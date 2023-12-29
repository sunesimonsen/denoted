import { searches } from "./state.js";
import { isAuthorized, getAuthHeader } from "./auth.js";

export class Api {
  async fetch(...args) {
    const response = await fetch(...args);

    if (!response.ok) {
      throw new Error(response.statusText || `HTTP ERROR ${response.status}`);
    }

    return response.json();
  }

  async searchFiles() {
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

  async loadNotes() {
    if (isAuthorized()) {
      searches.initialize("notes", async () => {
        const files = this.searchFiles();
        return files;
      });
    }
  }
}
