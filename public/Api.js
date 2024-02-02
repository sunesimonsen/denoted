import {
  searches,
  currentNote,
  notesCache,
  nameToNote,
  timestampToNote,
} from "./state.js";
import { isAuthorized, getAuthHeader, reauthorize } from "./auth.js";
import { reorg } from "@orgajs/reorg";
import { stream } from "unified-stream";
import mutate from "@orgajs/reorg-rehype";
import html from "rehype-stringify";
import { visit } from "unist-util-visit";

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
        reauthorize({ router: this.router });
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

    const authHeader = await getAuthHeader();

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
    searches.initialize("notes", async () => {
      const files = this.fetchFiles();
      return files;
    });
  }

  async fetchNote(id) {
    const authHeader = await getAuthHeader();

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
    };
  }

  loadNote(id) {
    notesCache.initialize(id, async () => {
      const content = this.fetchNote(id);
      return content;
    });
  }
}
