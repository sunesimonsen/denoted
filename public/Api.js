import { searches, currentNote, notesCache } from "./state.js";
import { isAuthorized, getAuthHeader } from "./auth.js";

export class Api {
  async fetch(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(response.statusText || `HTTP ERROR ${response.status}`);
    }

    if (
      options?.headers &&
      options.headers["Content-Type"] === "application/json"
    ) {
      return response.json();
    } else {
      return response.text();
    }
  }

  async fetchFiles() {
    const paths = [];

    let result = await this.fetch(
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
      result = await this.fetch(
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
    let result = await this.fetch(
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
    console.log(result);

    return result;
  }

  loadNote(id) {
    notesCache.initialize(id, async () => {
      const content = this.fetchNote(id);
      return content;
    });
  }
}
