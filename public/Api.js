import {
  searches,
  currentNote,
  notesCache,
  nameToNote,
  timestampToNote,
} from "./state.js";
import { isAuthorized, getAuthHeader } from "./auth.js";
import { reorg } from "@orgajs/reorg";
import { stream } from "unified-stream";
import mutate from "@orgajs/reorg-rehype";
import html from "rehype-stringify";
import { visit } from "unist-util-visit";

const resolveDenoteLinks = () => (tree) => {
  console.log(tree);
  return visit(tree, "link", (node) => {
    if (node.path.protocol === "denote") {
      node.path.protocol = "https";

      const note = timestampToNote(node.path.value);

      if (note) {
        node.path.value = "/note/" + note.id;
      }
    }
  });
};

const isExternalAnchor = (node) =>
  node.tagName === "a" && node.properties.href.startsWith("https://");

const addTargetBlankToExternalLinks = () => (tree) => {
  return visit(tree, isExternalAnchor, (node) => {
    node.properties.target = "_blank";
    node.properties.rel = "noopener noreferrer";
  });
};

const processor = reorg()
  .use(resolveDenoteLinks)
  .use(mutate)
  .use(addTargetBlankToExternalLinks)
  .use(html);

export class Api {
  async fetch(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(response.statusText || `HTTP ERROR ${response.status}`);
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

    let result = await this.fetchJson(
      "https://api.dropboxapi.com/2/files/list_folder",
      {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
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
            Authorization: getAuthHeader(),
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
    if (isAuthorized()) {
      searches.initialize("notes", async () => {
        const files = this.fetchFiles();
        return files;
      });
    }
  }

  async fetchNote(id) {
    const response = await this.fetch(
      "https://content.dropboxapi.com/2/files/download",
      {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
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
