import {
  searches,
  notesCache,
  nameToNote,
  authCache,
  timestampToNote,
} from "./state.js";
import { sha256 } from "./utils/sha256.js";
import { reorg } from "@orgajs/reorg";
import { stream } from "unified-stream";
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

const urlRegex =
  /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;

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
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(response.statusText || `HTTP ERROR ${response.status}`);
    }

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

    const { title } = content.match(/^#\+title:\s*\b(?<title>.*)/).groups;

    const { value: htmlContent } = await processor.process(content);

    return {
      ...info,
      title,
      html: htmlContent,
      content: content
        .replace(/^#\+(title|identifier|filetags|date):[^\n]*/gm, "")
        .trim(),
      rawContent: content,
    };
  }

  loadNote(id) {
    if (this.isAuthenticated()) {
      notesCache.initialize(id, async () => {
        const content = this.fetchNote(id);
        return content;
      });
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
