import expect from "unexpected";
import { Api } from "../public/Api.js";
import { FakeFetch } from "./FakeFetch.js";
import { FakeSessionStorage } from "./FakeSessionStorage.js";
import { notesCache } from "../public/state.js";

const content = `\
#+title:      Denote test
#+date:       [2024-03-02 Tue 00:15]
#+filetags:   :denote:test:
#+identifier: 20240302T001523

* Denote test

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
    const id = "20240302T001523--denote-test__denote_test.org";

    it("fetches the note with the given id and stores it in the notes cache", async () => {
      fakeFetch.response.body = content;
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
            "Dropbox-API-Arg": `{"path":"/org/denote/${id}"}`,
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
        properties: {
          title: "Denote test",
          date: "[2024-03-02 Tue 00:15]",
          filetags: ":denote:test:",
          identifier: "20240302T001523",
        },
        html: '<div class="section"><h2>Denote test</h2><p>This file is just for playing around with Denote. </p></div>',
        content:
          "* Denote test\n\nThis file is just for playing around with Denote.",
      });
    });
  });
});
