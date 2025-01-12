import expect from "unexpected";
import { FakeFetch } from "./FakeFetch.js";
import { FakeSessionStorage } from "./FakeSessionStorage.js";
import { Dropbox } from "../public/storage/Dropbox.js";
import { NotFoundError } from "../public/errors/NotFoundError.js";
import { headerSafeJSON } from "../public/utils/headerSafeJSON.js";

describe("Dropbox", () => {
  let dropbox, fakeFetch;

  const folderPath = "/my/path";
  const noteName = "20250112T151828--note__test.org";
  const notePath = `${folderPath}/${noteName}`;

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

  describe("listFolderFromCursor", () => {
    it("responds with the content of the given folder", async () => {
      const listResponse = {
        entries: [
          { ".tag": "file", name: "20221212T100717--zendesk-shards.org" },
          { ".tag": "file", name: "20230106T150823--ghost-in-the-machine.org" },
        ],
        cursor: "next-cursor",
        has_more: false,
      };

      fakeFetch.respondWithJson(listResponse);

      await expect(
        dropbox.listFolderFromCursor("first-cursor"),
        "to be fulfilled with",
        listResponse,
      );

      expect(fakeFetch.request, "to equal", {
        url: "https://api.dropboxapi.com/2/files/list_folder/continue",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cursor: "first-cursor" }),
        },
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.listFolderFromCursor("first-cursor"),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });

  describe("create", () => {
    const content = "Body text";
    const rev = "62b83007e4fad0841b75c";

    it("posts the body to the upload endpoint", async () => {
      fakeFetch.respondWithJson({
        name: noteName,
        rev,
      });

      await expect(dropbox.create(notePath, content), "to be fulfilled with", {
        name: noteName,
        rev,
      });

      expect(fakeFetch.request, "to equal", {
        url: "https://content.dropboxapi.com/2/files/upload",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": headerSafeJSON({ path: notePath, mode: "add" }),
          },
          body: content,
        },
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.create(notePath, content),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });

  describe("update", () => {
    const content = "Body text";
    const rev = "62b83007e4fad0841b75c";

    it("posts the body to the upload endpoint", async () => {
      fakeFetch.respondWithJson({
        name: noteName,
        rev,
      });

      await expect(
        dropbox.update(notePath, rev, content),
        "to be fulfilled with",
        {
          name: noteName,
          rev,
        },
      );

      expect(fakeFetch.request, "to equal", {
        url: "https://content.dropboxapi.com/2/files/upload",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": headerSafeJSON({
              path: notePath,
              mode: { ".tag": "update", update: rev },
            }),
          },
          body: content,
        },
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.update(notePath, rev, content),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });

  describe("move", () => {
    const toPath = `${folderPath}/20250112T151828--note__test_demo.org`;

    it("calls the move command on dropbox", async () => {
      const response = {
        metadata: {
          ".tag": "file",
          name: "20250112T151828--note__test_demo.org",
          rev: "62b83bcae6eb00841b75c",
        },
      };
      fakeFetch.respondWithJson(response);

      await expect(
        dropbox.move(notePath, toPath),
        "to be fulfilled with",
        response,
      );

      expect(fakeFetch.request, "to equal", {
        url: "https://api.dropboxapi.com/2/files/move_v2",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_path: notePath,
            to_path: toPath,
          }),
        },
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.move(notePath, toPath),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });

  describe("delete", () => {
    it("calls the delete command on dropbox", async () => {
      const response = {
        metadata: {
          ".tag": "file",
          name: noteName,
          rev: "62b83bcae6eb00841b75c",
        },
      };

      fakeFetch.respondWithJson(response);

      await expect(dropbox.delete(notePath), "to be fulfilled with", response);

      expect(fakeFetch.request, "to equal", {
        url: "https://api.dropboxapi.com/2/files/delete_v2",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: notePath }),
        },
      });
    });

    describe("when the request fails", () => {
      it("throw an exception", async () => {
        fakeFetch.rejectWith(403);

        await expect(
          dropbox.delete(notePath),
          "to be rejected with",
          "HTTP ERROR 403",
        );
      });
    });
  });
});
