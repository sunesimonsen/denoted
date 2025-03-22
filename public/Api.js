import {
  searches,
  moduleCache,
  notesCache,
  nameToNote,
  noteDirtyState,
} from "./state.js";
import { newNote } from "./utils/notes.js";
import { idFrom } from "./utils/ids.js";
import { markdownToHtml } from "./markdownToHtml.js";
import { Dropbox } from "./storage/Dropbox.js";

class Changelistener {
  constructor(path) {
    this.path = path;
  }

  async onFileChanged({ name, rev }) {
    const [notes] = searches.byId("notes");

    if (!notes.includes(name)) {
      searches.load("notes", () => [...notes, name]);
    }

    const [note] = notesCache.byId(name);

    if (note && note.rev !== rev) {
      notesCache.evict(name);
    }
  }

  onFileDeleted({ name }) {
    const [notes] = searches.byId("notes");

    notesCache.evict(name);
    searches.load("notes", () => notes.filter((id) => id !== name));
  }
}

export class Api {
  #changeListener = new Changelistener("/denoted");

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

    let result = await this.dropbox.listFolder("/denoted");

    for (const entry of result.entries) {
      if (entry[".tag"] === "file" && entry.name.endsWith(".md")) {
        paths.push(entry.name);
      }
    }

    while (result.has_more) {
      result = await this.dropbox.listFolderFromCursor(result.cursor);

      for (const entry of result.entries) {
        if (entry[".tag"] === "file" && entry.name.endsWith(".md")) {
          paths.push(entry.name);
        }
      }
    }

    return paths;
  }

  loadNotes() {
    return searches.initialize("notes", async () => {
      const files = this.fetchFiles();

      return files;
    });
  }

  async fetchNote(id) {
    const { rev, content } = await this.dropbox.download(`/denoted/${id}`);

    const info = nameToNote(id);

    const html = await markdownToHtml(content);

    return {
      ...info,
      rev,
      html,
      content: content
        .replace(/^#\+(title|identifier|filetags|date):[^\n]*/gm, "")
        .trim(),
    };
  }

  loadNote(id) {
    return notesCache.initialize(id, () => this.fetchNote(id));
  }

  loadEditor() {
    return moduleCache.initialize("editor", import("./editor.js"));
  }

  async createNote({ title, tags }) {
    const note = newNote({ title, tags });

    await this.dropbox.create(`/denoted/${note.id}`, "");

    this.router.navigate({
      route: "note/edit",
      params: { id: note.id },
    });

    const [notes] = searches.byId("notes");

    searches.load("notes", [...notes, note.id]);
  }

  async deleteNote({ id }) {
    await this.dropbox.delete(`/denoted/${id}`);

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

      noteDirtyState.saving(true);

      const { rev } = await this.dropbox.update(
        `/denoted/${noteDirtyState.id}`,
        noteDirtyState.rev,
        content,
      );

      const html = await markdownToHtml(content);

      noteDirtyState.rev = rev;

      const newId = idFrom({ timestamp: note.timestamp, title, tags });

      if (newId !== note.id) {
        const result = this.dropbox.move(
          `/denoted/${noteDirtyState.id}`,
          `/denoted/${newId}`,
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
      return this.dropbox.authenticate();
    }
  }

  async listenForUpdates() {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.dropbox.removeChangeListener(this.#changeListener);
      } else {
        this.dropbox.addChangeListener(this.#changeListener);
      }
    });

    if (document.visibilityState === "visible") {
      this.dropbox.addChangeListener(this.#changeListener);
    }
  }
}
