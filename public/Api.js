import {
  searches,
  moduleCache,
  notesCache,
  nameToNote,
  noteDirtyState,
} from "./state.js";
import { delay } from "./utils/delay.js";
import { newNote } from "./utils/notes.js";
import { idFrom } from "./utils/ids.js";
import { frontmatter } from "./utils/frontmatter.js";
import { orgToHtml } from "./org.js";

function headerSafeJson(v) {
  return JSON.stringify(v).replace(/[\u007f-\uffff]/g, function (c) {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

export class Api {
  constructor({ router }) {
    this.router = router;
  }

  async fetch(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        return await this.reauthenticate();
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

    const authHeader = await this.#getAuthHeader();

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
    const authHeader = await this.#getAuthHeader();

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
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.refreshing = false;
      } else if (!this.refreshing) {
        this.startRefreshing();
      }
    });

    if (!this.refreshing && document.visibilityState === "visible") {
      this.refreshing = true;

      while (this.refreshing) {
        await this.refresh();
        await delay(5000);
      }

      this.refreshing = false;
    }
  }

  loadNotes() {
    searches.initialize("notes", async () => {
      const files = this.fetchFiles();

      return files;
    });
  }

  async fetchNote(id) {
    const authHeader = await this.#getAuthHeader();

    const response = await this.fetch(
      "https://content.dropboxapi.com/2/files/download",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "text/plain; charset=utf-8",
          "Dropbox-API-Arg": headerSafeJson({
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

    try {
      const html = await orgToHtml(content);

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
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  loadNote(id) {
    notesCache.initialize(id, () => this.fetchNote(id));
  }

  loadEditor() {
    moduleCache.initialize("editor", import("./editor.js"));
  }

  async createNote({ title, tags }) {
    const note = newNote({ title, tags });

    const contentWithFrontmatter = frontmatter(note) + "\n\n";

    await this.fetchJson("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: await this.#getAuthHeader(),
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": headerSafeJson({
          path: `/org/denote/${note.id}`,
          mode: "add",
        }),
      },
      body: contentWithFrontmatter,
    });

    this.router.navigate({
      route: "note/edit",
      params: { id: note.id },
    });

    const [notes] = searches.byId("notes");

    searches.load("notes", [...notes, note.id]);
  }

  async deleteNote({ id }) {
    await this.fetchJson("https://api.dropboxapi.com/2/files/delete_v2", {
      method: "POST",
      headers: {
        Authorization: await this.#getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: `/org/denote/${id}` }),
    });

    this.router.navigate({
      route: "home",
    });

    notesCache.evict(id);

    const [notes] = searches.byId("notes");
    const deletedId = id;

    searches.load(
      "notes",
      notes.filter((id) => id !== deletedId),
    );
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
            Authorization: await this.#getAuthHeader(),
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": headerSafeJson({
              path: `/org/denote/${noteDirtyState.id}`,
              mode: { ".tag": "update", update: noteDirtyState.rev },
            }),
          },
          body: contentWithFrontmatter,
        },
      );

      const html = await orgToHtml(content);

      noteDirtyState.rev = rev;

      const newId = idFrom({ timestamp: note.timestamp, title, tags });

      if (newId !== note.id) {
        const result = await this.fetchJson(
          "https://api.dropboxapi.com/2/files/move_v2",
          {
            method: "POST",
            headers: {
              Authorization: await this.#getAuthHeader(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from_path: `/org/denote/${noteDirtyState.id}`,
              to_path: `/org/denote/${newId}`,
            }),
          },
        );

        const [notes] = searches.byId("notes");

        searches.load("notes", () => [
          newId,
          ...notes.filter((id) => id !== note.id),
        ]);

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

  #getAuthHeader() {
    if (!this.isAuthenticated()) {
      return this.reauthenticate();
    }

    return `Bearer ${this.accessToken}`;
  }

  reauthenticate() {
    this.accessToken = null;

    return this.authenticate();
  }

  isAuthenticated() {
    return Boolean(this.accessToken);
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

    const response = await this.fetch(
      "https://api.dropboxapi.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      },
    );

    if (!response.ok) {
      if (response.status === 400) {
        await this.reauthenticate();
      }

      throw new Error("Extracting access token failed");
    }

    const { access_token } = await response.json();

    this.accessToken = access_token;

    this.router.navigate({
      route: "home",
      queryParams: {},
      hash: "",
      replace: true,
    });
  }

  get accessToken() {
    return sessionStorage.getItem("dropbox-token");
  }

  set accessToken(token) {
    if (token) {
      sessionStorage.setItem("dropbox-token", token);
    } else {
      sessionStorage.removeItem("dropbox-token");
    }
  }

  authenticate() {
    this.router.navigate({
      route: "login",
      hash: "",
      replace: true,
      queryParams: {},
    });

    // Blocking promise waiting for redirect
    return new Promise(() => {});
  }
}
