import { NotFoundError } from "../errors/NotFoundError.js";
import { sha256 } from "../utils/sha256.js";

function headerSafeJson(v) {
  return JSON.stringify(v).replace(/[\u007f-\uffff]/g, function (c) {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

export class HttpError extends Error {
  constructor({ statusText, status, body }) {
    super(statusText || `HTTP ERROR ${status}`);
    this.status = status;
    this.body = body;
  }
}

const convertErrors = (err) => {
  if (err instanceof HttpError) {
    if (err.status === 409) {
      const response = JSON.parse(err.body);

      if (response?.error?.path[".tag"] === "not_found") {
        return new NotFoundError();
      }
    }
  }

  return err;
};

export class Dropbox {
  #realFetch = null;

  #location = null;

  #sessionStorage = null;

  #changeListeners = new Set();

  #interval = null;

  constructor({ fetch, location, sessionStorage }) {
    this.#realFetch = fetch;
    this.#location = location;
    this.#sessionStorage = sessionStorage;
  }

  async #fetch(url, options) {
    const response = await this.#realFetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        return await this.#reauthenticate();
      } else {
        const body = await response.text();
        const { status, statusText } = response;

        throw new HttpError({ status, statusText, body });
      }
    }

    return response;
  }

  async #fetchJson(url, options) {
    const response = await this.#fetch(url, options);

    return response.json();
  }

  async getLatestCursor(path) {
    const { cursor } = await this.#fetchJson(
      "https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor",
      {
        method: "POST",
        headers: {
          Authorization: await this.#getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      },
    );

    return cursor;
  }

  async listFolder(path, limit = 2000) {
    try {
      return await this.#fetchJson(
        "https://api.dropboxapi.com/2/files/list_folder",
        {
          method: "POST",
          headers: {
            Authorization: await this.#getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path, limit }),
        },
      );
    } catch (err) {
      throw convertErrors(err);
    }
  }

  async listFolderFromCursor(cursor) {
    return this.#fetchJson(
      "https://api.dropboxapi.com/2/files/list_folder/continue",
      {
        method: "POST",
        headers: {
          Authorization: await this.#getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursor }),
      },
    );
  }

  async download(path) {
    try {
      const response = await this.#fetch(
        "https://content.dropboxapi.com/2/files/download",
        {
          method: "POST",
          headers: {
            Authorization: await this.#getAuthHeader(),
            "Content-Type": "text/plain; charset=utf-8",
            "Dropbox-API-Arg": headerSafeJson({ path }),
          },
        },
      );

      const apiResult = JSON.parse(response.headers.get("Dropbox-Api-Result"));
      const content = await response.text();

      return { ...apiResult, content };
    } catch (err) {
      throw convertErrors(err);
    }
  }

  async create(path, body) {
    return this.#fetchJson("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: await this.#getAuthHeader(),
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": headerSafeJson({ path, mode: "add" }),
      },
      body,
    });
  }

  async update(path, rev, body) {
    return this.#fetchJson("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: await this.#getAuthHeader(),
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": headerSafeJson({
          path,
          mode: { ".tag": "update", update: rev },
        }),
      },
      body,
    });
  }

  async move(fromPath, toPath) {
    return this.#fetchJson("https://api.dropboxapi.com/2/files/move_v2", {
      method: "POST",
      headers: {
        Authorization: await this.#getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_path: fromPath,
        to_path: toPath,
      }),
    });
  }

  async delete(path) {
    return this.#fetchJson("https://api.dropboxapi.com/2/files/delete_v2", {
      method: "POST",
      headers: {
        Authorization: await this.#getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });
  }

  async #authorize() {
    const codeVerifier = (crypto.randomUUID() + crypto.randomUUID()).replaceAll(
      "-",
      "",
    );

    this.#sessionStorage.setItem("dropbox-code-verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: "23m5fpdg74lyhna",
      response_type: "code",
      code_challenge: await sha256(codeVerifier),
      code_challenge_method: "S256",
      redirect_uri: this.#location.origin + "/authorized",
    });

    this.#sessionStorage.setItem("redirect-location", this.#location.href);

    this.#location.assign(
      "https://www.dropbox.com/oauth2/authorize?" + params.toString(),
    );

    // Blocking promise waiting for redirect
    return new Promise(() => {});
  }

  async tradeCodeForAccessToken(code) {
    const codeVerifier = this.#sessionStorage.getItem("dropbox-code-verifier");

    this.#sessionStorage.removeItem("dropbox-code-verifier");

    const params = new URLSearchParams({
      client_id: "23m5fpdg74lyhna",
      redirect_uri: window.location.origin + "/authorized",
      code,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    });

    const response = await this.#fetch(
      "https://api.dropboxapi.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      if (response.status === 400) {
        await this.#reauthenticate();
      }

      throw new Error("Extracting access token failed");
    }

    const { access_token } = await response.json();

    this.#accessToken = access_token;

    const href = this.#sessionStorage.getItem("redirect-location");

    this.#sessionStorage.removeItem("redirect-location");
    this.#location.assign(href);
  }

  isAuthenticated() {
    return Boolean(this.#accessToken);
  }

  async authenticate() {
    return this.#authorize();
  }

  async #getAuthHeader() {
    if (!this.isAuthenticated()) {
      return this.#reauthenticate();
    }

    return `Bearer ${this.#accessToken}`;
  }

  #reauthenticate() {
    this.#accessToken = null;

    return this.authenticate();
  }

  get #accessToken() {
    return this.#sessionStorage.getItem("dropbox-token");
  }

  set #accessToken(token) {
    if (token) {
      this.#sessionStorage.setItem("dropbox-token", token);
    } else {
      this.#sessionStorage.removeItem("dropbox-token");
    }
  }

  addChangeListener(listener) {
    this.#changeListeners.add(listener);

    if (!this.#interval) {
      this.#interval = setInterval(this.#checkForUpdates, 5000);
    }
  }

  removeChangeListener(listener) {
    this.#changeListeners.delete(listener);

    if (this.#changeListeners.size === 0) {
      clearInterval(this.#interval);
    }
  }

  #checkForUpdates = async () => {
    for (const listener of this.#changeListeners) {
      const folder = listener.path;

      if (!listener.cursor) {
        listener.cursor = await this.getLatestCursor(folder);
      }

      const result = await this.listFolderFromCursor(listener.cursor);

      for (const entry of result.entries) {
        const { name, rev } = entry;

        switch (entry[".tag"]) {
          case "file":
            await listener.onFileChanged({ folder, name, rev });
            break;
          case "deleted":
            await listener.onFileDeleted({ folder, name, rev });
            break;
        }
      }

      listener.cursor = result.cursor;
    }
  };
}
