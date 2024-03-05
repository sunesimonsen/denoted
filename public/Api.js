import {
  searches,
  notesCache,
  nameToNote,
  authCache,
  timestampToNote,
  noteDirtyState,
} from "./state.js";
import { sha256 } from "./utils/sha256.js";
import { delay } from "./utils/delay.js";
import { newNote } from "./utils/notes.js";
import { idFrom } from "./utils/ids.js";
import { frontmatter } from "./utils/frontmatter.js";
import { reorg } from "@orgajs/reorg";
import mutate from "@orgajs/reorg-rehype";
import html from "rehype-stringify";
import { visit } from "unist-util-visit";
import { LOADED } from "@dependable/cache";

const resolveDenoteLinks = () => (tree) =>
  visit(tree, "link", (node) => {
    if (node.path.protocol === "denote") {
      node.path.protocol = "https";

      const note = timestampToNote(node.path.value);

      if (note) {
        node.path.value = "/note/" + note.id;
      }
    }
  });

const isExternalAnchor = (node) =>
  node.tagName === "a" && node.properties.href.startsWith("https://");

const addTargetBlankToExternalLinks = () => (tree) =>
  visit(tree, isExternalAnchor, (node) => {
    node.properties.target = "_blank";
    node.properties.rel = "noopener noreferrer";
  });

const urlRegex = /(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#=.\/\-?_]+)/gi;

const isUrlText = (node) => node.type === "text" && node.value.match(urlRegex);

const autoLink = () => (tree) =>
  visit(tree, isUrlText, (node, index, parent) => {
    parent.children[index] = {
      tagName: "a",
      type: "element",
      properties: {
        href: node.value,
      },
      children: [node],
    };
    return "skip";
  });

const isHeading = (node) => node.tagName?.match(/h\d/);

const incrementHeaderLevels = () => (tree) => {
  return visit(tree, isHeading, (node) => {
    node.tagName = node.tagName.replace(/\d/, (v) => parseInt(v) + 1);
    return "skip";
  });
};

const processor = reorg()
  .use(resolveDenoteLinks)
  .use(mutate)
  .use(autoLink)
  .use(addTargetBlankToExternalLinks)
  .use(incrementHeaderLevels)
  .use(html);

export class Api {
  constructor({ router }) {
    this.router = router;
  }

  async fetch(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        this.reauthenticate();
      } else {
        throw new Error(response.statusText || `HTTP ERROR ${response.status}`);
      }
    }

    return response;
  }

  async fetchJson(url, options) {
    const response = await this.fetch(url, options);

    return response.json();
  }

  async fetchFiles() {
    const paths = [];

    const authHeader = this.getAuthHeader();

    let result = await this.fetchJson(
      "https://api.dropboxapi.com/2/files/list_folder",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "/org/denote",
          limit: 2000,
        }),
      },
    );

    for (const { name } of result.entries) {
      paths.push(name);
    }

    while (result.has_more) {
      result = await this.fetchJson(
        "https://api.dropboxapi.com/2/files/list_folder/continue",
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cursor: result.cursor,
          }),
        },
      );

      for (const { name } of result.entries) {
        paths.push(name);
      }
    }

    return paths;
  }

  async refresh() {
    const authHeader = this.getAuthHeader();

    if (!this.cursor) {
      let { cursor } = await this.fetchJson(
        "https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor",
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "/org/denote/",
          }),
        },
      );

      this.cursor = cursor;
    }

    const result = await this.fetchJson(
      "https://api.dropboxapi.com/2/files/list_folder/continue",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cursor: this.cursor,
        }),
      },
    );

    this.cursor = result.cursor;

    for (const entry of result.entries) {
      const tag = entry[".tag"];

      const [notes] = searches.byId("notes");

      if (tag === "file") {
        if (!notes.includes(entry.name)) {
          searches.load("notes", () => [...notes, entry.name]);
        }

        const [note] = notesCache.byId(entry.name);
        if (note && note.rev !== entry.rev) {
          const updatedNote = await this.fetchNote(entry.name);
          notesCache.load(updatedNote.id, () => updatedNote);
        }
      } else if (tag === "deleted") {
        notesCache.evict(entry.name);
        searches.load("notes", () => notes.filter((id) => id !== entry.name));
      }
    }
  }

  async startRefreshing() {
    window.addEventListener("visibilitychange", (event) => {
      if (document.visibilityState === "hidden") {
        this.refreshing = false;
      } else if (!this.refreshing) {
        this.startRefreshing();
      }
    });

    if (
      this.isAuthenticated() &&
      !this.refreshing &&
      document.visibilityState === "visible"
    ) {
      this.refreshing = true;

      while (this.refreshing) {
        await this.refresh();
        await delay(5000);
      }
    }
  }

  loadNotes() {
    if (this.isAuthenticated()) {
      searches.initialize("notes", async () => {
        const files = this.fetchFiles();
        return files;
      });
    }
  }

  async fetchNote(id) {
    const authHeader = this.getAuthHeader();

    const response = await this.fetch(
      "https://content.dropboxapi.com/2/files/download",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "text/plain; charset=utf-8",
          "Dropbox-API-Arg": JSON.stringify({
            path: `/org/denote/${id}`,
          }),
        },
      },
    );

    const info = nameToNote(id);

    const content = await response.text();

    const properties = {};
    const propertiesMatches = content.matchAll(
      /^#\+(?<key>[^:]+):\s*(?<value>.*)/gm,
    );

    for (const propertyMatch of propertiesMatches) {
      const { key, value } = propertyMatch.groups;
      properties[key] = value;
    }

    const { value: html } = await processor.process(content);

    const { rev } = JSON.parse(response.headers.get("Dropbox-Api-Result"));

    return {
      ...info,
      rev,
      properties,
      title: properties.title,
      html,
      content: content
        .replace(/^#\+(title|identifier|filetags|date):[^\n]*/gm, "")
        .trim(),
    };
  }

  loadNote(id) {
    if (this.isAuthenticated()) {
      notesCache.initialize(id, async () => this.fetchNote(id));
    }
  }

  async createNote({ title, tags }) {
    const note = newNote({ title, tags });

    const contentWithFrontmatter = frontmatter(note) + "\n\n";
    console.log("wat");

    const { rev } = await this.fetchJson(
      "https:content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({
            path: `/org/denote/${note.id}`,
            mode: "add",
          }),
        },
        body: contentWithFrontmatter,
      },
    );

    this.router.navigate({
      route: "note/edit",
      params: { id: note.id },
    });
  }

  async saveNote() {
    const [note] = notesCache.byId(noteDirtyState.id);
    if (!note) {
      throw new Error("Note is not loaded");
    }

    try {
      const title = noteDirtyState.title();
      const content = noteDirtyState.content();
      const tags = noteDirtyState.tags();
      const contentWithFrontmatter = frontmatter(note) + "\n\n" + content;

      noteDirtyState.saving(true);

      const { rev } = await this.fetchJson(
        "https://content.dropboxapi.com/2/files/upload",
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": JSON.stringify({
              path: `/org/denote/${noteDirtyState.id}`,
              mode: { ".tag": "update", update: noteDirtyState.rev },
            }),
          },
          body: contentWithFrontmatter,
        },
      );

      const { value: html } = await processor.process(content);

      noteDirtyState.rev = rev;

      const newId = idFrom({ timestamp: note.timestamp, title, tags });

      if (newId !== note.id) {
        const result = await this.fetchJson(
          "https://api.dropboxapi.com/2/files/move_v2",
          {
            method: "POST",
            headers: {
              Authorization: this.getAuthHeader(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from_path: `/org/denote/${noteDirtyState.id}`,
              to_path: `/org/denote/${newId}`,
            }),
          },
        );

        noteDirtyState.id = newId;
        noteDirtyState.rev = result.rev;
      }

      notesCache.load(noteDirtyState.id, {
        ...note,
        id: noteDirtyState.id,
        rev: noteDirtyState.rev,
        title,
        content,
        tags,
        html,
      });

      this.router.navigate({
        route: "note/view",
        params: {
          id: noteDirtyState.id,
        },
      });
    } finally {
      noteDirtyState.saving(false);
    }
  }

  getAuthHeader() {
    const [token] = authCache.byId("token");
    return `Bearer ${token}`;
  }

  reauthenticate() {
    sessionStorage.removeItem("dropbox-token");
    authCache.evict("token");
  }

  isAuthenticated() {
    const [, status] = authCache.byId("token");
    return status === LOADED;
  }

  async tradeCodeForAccessToken(code, codeVerifier) {
    const body = Object.entries({
      client_id: "23m5fpdg74lyhna",
      redirect_uri: window.location.origin + "/authorized",
      code,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    })
      .map(
        ([name, value]) =>
          encodeURIComponent(name) + "=" + encodeURIComponent(value),
      )
      .join("&");

    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    });

    if (response.ok) {
      const { access_token } = await response.json();

      return access_token;
    } else {
      throw new Error("Extracting access token failed");
    }
  }

  authenticate() {
    authCache.initialize("token", async () => {
      const token = sessionStorage.getItem("dropbox-token");
      if (token) return token;

      const { code } = this.router.queryParams;
      if (this.router.route === "authorized" && code) {
        const codeVerifier = sessionStorage.getItem("dropbox-code-verifier");
        sessionStorage.removeItem("dropbox-code-verifier");

        const token = await this.tradeCodeForAccessToken(code, codeVerifier);
        sessionStorage.setItem("dropbox-token", token);

        this.router.navigate({
          route: "home",
          queryParams: {},
          hash: "",
          replace: true,
        });

        return token;
      } else {
        const codeVerifier = (
          crypto.randomUUID() + crypto.randomUUID()
        ).replaceAll("-", "");

        sessionStorage.setItem("dropbox-code-verifier", codeVerifier);

        this.router.navigate({
          route: "authorize",
          queryParams: {
            client_id: "23m5fpdg74lyhna",
            response_type: "code",
            code_challenge: await sha256(codeVerifier),
            code_challenge_method: "S256",
            redirect_uri: window.location.origin + "/authorized",
          },
        });
      }
    });
  }
}
