import expect from "unexpected";
import { Api } from "../public/Api.js";
import { FakeFetch } from "./FakeFetch.js";
import { FakeSessionStorage } from "./FakeSessionStorage.js";
import { notesCache } from "../public/state.js";

const content = `\
# Denote test

This file is just for playing around with Denote.
`;

describe("Api", () => {
  let api, fakeFetch;

  beforeEach(() => {
    fakeFetch = new FakeFetch();

    const sessionStorage = new FakeSessionStorage();

    api = new Api({
      fetch: fakeFetch.fetch,
      sessionStorage,
    });

    sessionStorage.setItem("dropbox-token", "token");
  });

  describe("loadNote", () => {
    const id = "20240302T001523--Denote-test__denote_test.org";

    it("fetches the note with the given id and stores it in the notes cache", async () => {
      fakeFetch.respondWithText(content);

      fakeFetch.response.headers.set(
        "Dropbox-Api-Result",
        JSON.stringify({ rev: "6242e992bf97d0841b75c" }),
      );

      await api.loadNote(id);

      const [note] = notesCache.byId(id);

      expect(fakeFetch.request, "to equal", {
        url: "https://content.dropboxapi.com/2/files/download",
        options: {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "text/plain; charset=utf-8",
            "Dropbox-API-Arg": `{"path":"/denoted/${id}"}`,
          },
        },
      });

      expect(note, "to equal", {
        id,
        timestamp: "20240302T001523",
        date: {
          year: "2024",
          month: "03",
          day: "02",
          hours: "00",
          minutes: "15",
          seconds: "23",
        },
        title: "Denote test",
        tags: ["denote", "test"],
        rev: "6242e992bf97d0841b75c",
        html: "<h1>Denote test</h1>\n<p>This file is just for playing around with Denote.</p>\n",
        content:
          "# Denote test\n\nThis file is just for playing around with Denote.",
      });
    });
  });
});
