import {
  searches,
  moduleCache,
  notesCache,
  nameToNote,
  noteDirtyState,
} from "./state.js";
import { delay } from "./utils/delay.js";
import { newNote } from "./utils/notes.js";
import { idFrom } from "./utils/ids.js";
import { frontmatter } from "./utils/frontmatter.js";
import { orgToHtml } from "./org.js";
import { Dropbox } from "./storage/Dropbox.js";

export class Api {
  constructor({ fetch, router, location, sessionStorage }) {
    this.router = router;

    this.dropbox = new Dropbox({
      fetch,
      location,
      sessionStorage,
    });
  }

  async fetchFiles() {
    const paths = [];

    let result = await this.dropbox.listFolder("/org/denote");

    for (const entry of result.entries) {
      if (entry[".tag"] === "file") {
        paths.push(entry.name);
      }
    }

    while (result.has_more) {
      result = await this.dropbox.listFolderFromCursor(result.cursor);

      for (const entry of result.entries) {
        if (entry[".tag"] === "file") {
          paths.push(entry.name);
        }
      }
    }

    return paths;
  }

  async refresh() {
    if (!this.cursor) {
      this.cursor = await this.dropbox.getLatestCursor("/org/denote/");
    }

    const result = await this.dropbox.listFolderFromCursor(this.cursor);

    this.cursor = result.cursor;

    for (const entry of result.entries) {
      const tag = entry[".tag"];

      const [notes] = searches.byId("notes");

      if (tag === "file") {
        if (!notes.includes(entry.name)) {
          searches.load("notes", () => [...notes, entry.name]);
        }

        const [note] = notesCache.byId(entry.name);

        if (note && note.rev !== entry.rev) {
          const updatedNote = await this.fetchNote(entry.name);

          notesCache.load(updatedNote.id, () => updatedNote);
        }
      } else if (tag === "deleted") {
        notesCache.evict(entry.name);
        searches.load("notes", () => notes.filter((id) => id !== entry.name));
      }
    }
  }

  async startRefreshing() {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.refreshing = false;
      } else if (!this.refreshing) {
        this.startRefreshing();
      }
    });

    if (!this.refreshing && document.visibilityState === "visible") {
      this.refreshing = true;

      while (this.refreshing) {
        await this.refresh();
        await delay(5000);
      }

      this.refreshing = false;
    }
  }

  loadNotes() {
    return searches.initialize("notes", async () => {
      const files = this.fetchFiles();

      return files;
    });
  }

  async fetchNote(id) {
    const { rev, content } = await this.dropbox.download(`/org/denote/${id}`);

    const info = nameToNote(id);

    const properties = {};
    const propertiesMatches = content.matchAll(
      /^#\+(?<key>[^:]+):\s*(?<value>.*)/gm,
    );

    for (const propertyMatch of propertiesMatches) {
      const { key, value } = propertyMatch.groups;

      properties[key] = value;
    }

    try {
      const html = await orgToHtml(content);

      return {
        ...info,
        rev,
        properties,
        title: properties.title,
        html,
        content: content
          .replace(/^#\+(title|identifier|filetags|date):[^\n]*/gm, "")
          .trim(),
      };
    } catch (e) {
      throw e;
    }
  }

  loadNote(id) {
    return notesCache.initialize(id, () => this.fetchNote(id));
  }

  loadEditor() {
    return moduleCache.initialize("editor", import("./editor.js"));
  }

  async createNote({ title, tags }) {
    const note = newNote({ title, tags });

    const contentWithFrontmatter = frontmatter(note) + "\n\n";

    await this.dropbox.create(`/org/denote/${note.id}`, contentWithFrontmatter);

    this.router.navigate({
      route: "note/edit",
      params: { id: note.id },
    });

    const [notes] = searches.byId("notes");

    searches.load("notes", [...notes, note.id]);
  }

  async deleteNote({ id }) {
    await this.dropbox.delete(`/org/denote/${id}`);

    this.router.navigate({
      route: "home",
    });

    notesCache.evict(id);

    const [notes] = searches.byId("notes");
    const deletedId = id;

    searches.load(
      "notes",
      notes.filter((id) => id !== deletedId),
    );
  }

  async saveNote() {
    const [note] = notesCache.byId(noteDirtyState.id);

    if (!note) {
      throw new Error("Note is not loaded");
    }

    try {
      const title = noteDirtyState.title();
      const content = noteDirtyState.content();
      const tags = noteDirtyState.tags();
      const contentWithFrontmatter = frontmatter(note) + "\n\n" + content;

      noteDirtyState.saving(true);

      const { rev } = await this.dropbox.update(
        `/org/denote/${noteDirtyState.id}`,
        noteDirtyState.rev,
        contentWithFrontmatter,
      );

      const html = await orgToHtml(content);

      noteDirtyState.rev = rev;

      const newId = idFrom({ timestamp: note.timestamp, title, tags });

      if (newId !== note.id) {
        const result = this.dropbox.move(
          `/org/denote/${noteDirtyState.id}`,
          `/org/denote/${newId}`,
        );

        const [notes] = searches.byId("notes");

        searches.load("notes", () => [
          newId,
          ...notes.filter((id) => id !== note.id),
        ]);

        noteDirtyState.id = newId;
        noteDirtyState.rev = result.rev;
      }

      notesCache.load(noteDirtyState.id, {
        ...note,
        id: noteDirtyState.id,
        rev: noteDirtyState.rev,
        title,
        content,
        tags,
        html,
      });

      this.router.navigate({
        route: "note/view",
        params: {
          id: noteDirtyState.id,
        },
      });
    } finally {
      noteDirtyState.saving(false);
    }
  }

  isAuthenticated() {
    return this.dropbox.isAuthenticated();
  }

  authenticate() {
    if (!this.isAuthenticated()) {
      this.router.navigate({
        route: "login",
        hash: "",
        replace: true,
        queryParams: {},
      });
    }

    // Blocking promise waiting for redirect
    return new Promise(() => {});
  }

  async tradeCodeForAccessToken(code) {
    await this.dropbox.tradeCodeForAccessToken(code);

    this.router.navigate({
      route: "home",
      hash: "",
      replace: true,
      queryParams: {},
    });
  }
}
