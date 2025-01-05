import expect from "unexpected";
import { FakeFetch } from "./FakeFetch.js";
import { FakeSessionStorage } from "./FakeSessionStorage.js";
import { Dropbox } from "../public/storage/Dropbox.js";
import { NotFoundError } from "../public/errors/NotFoundError.js";

describe("Dropbox", () => {
  let dropbox, fakeFetch;

  const folderPath = "/my/path";
  const notePath = folderPath + "/note.org";

  beforeEach(() => {
    fakeFetch = new FakeFetch();

    const sessionStorage = new FakeSessionStorage();

    dropbox = new Dropbox({
      fetch: fakeFetch.fetch,
      sessionStorage,
    });

    sessionStorage.setItem("dropbox-token", "token");
  });

  describe("getLatestCursor", () => {
    it("responds with the JSON body of the response", async () => {
      const cursor = "my-cursor";

      fakeFetch.respondWithJson({ cursor });

      await expect(
        dropbox.getLatestCursor(folderPath),
        "to be fulfilled with",
        cursor,
      );

      expect(fakeFetch.request, "to equal", {
        url: "https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: folderPath }),
        },
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.getLatestCursor(folderPath),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });

  describe("download", () => {
    it("responds with the content on the path", async () => {
      const content = "Body text";
      const rev = "6242e992bf97d0841b75c";

      fakeFetch.respondWithText(content);

      fakeFetch.response.headers.set(
        "Dropbox-Api-Result",
        JSON.stringify({ rev }),
      );

      await expect(dropbox.download(notePath), "to be fulfilled with", {
        content,
        rev,
      });

      expect(fakeFetch.request, "to equal", {
        url: "https://content.dropboxapi.com/2/files/download",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "text/plain; charset=utf-8",
            "Dropbox-API-Arg": `{"path":"${notePath}"}`,
          },
        },
      });
    });

    describe("when the path is not found", () => {
      it("throw a not found error", async () => {
        fakeFetch.respondWithJson({
          error: {
            ".tag": "path",
            path: {
              ".tag": "not_found",
            },
          },
        });

        fakeFetch.rejectWith(409);

        await expect(
          dropbox.download(notePath),
          "to be rejected with",
          new NotFoundError(),
        );
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.download(folderPath),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });

  describe("listFolder", () => {
    it("responds with the content of the given folder", async () => {
      const listResponse = {
        entries: [
          { ".tag": "file", name: "20221212T100717--zendesk-shards.org" },
          { ".tag": "file", name: "20230106T150823--ghost-in-the-machine.org" },
        ],
        cursor: "my-cursor",
        has_more: false,
      };

      fakeFetch.respondWithJson(listResponse);

      await expect(
        dropbox.listFolder(notePath),
        "to be fulfilled with",
        listResponse,
      );

      expect(fakeFetch.request, "to equal", {
        url: "https://api.dropboxapi.com/2/files/list_folder",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: notePath, limit: 2000 }),
        },
      });
    });

    describe("when the path can't be found", () => {
      it("throw a not found error", async () => {
        fakeFetch.respondWithJson({
          error: {
            ".tag": "path",
            path: {
              ".tag": "not_found",
            },
          },
        });

        fakeFetch.rejectWith(409);

        await expect(
          dropbox.listFolder(notePath),
          "to be rejected with",
          new NotFoundError(),
        );
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.listFolder(notePath),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });
});
