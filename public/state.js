import { observable, computed } from "@dependable/state";
import { Cache } from "@dependable/cache";
import { debounce } from "@dependable/debounce";

export const moduleCache = new Cache();

export const searches = new Cache("searches");

export const notesCache = new Cache("notes");

export const authCache = new Cache("auth");

export const searchText = observable("", { id: "searchText" });

const debouncedSearchText = debounce(searchText, 50);

const searchTerms = computed(() => debouncedSearchText().split(/\s+/));

export const nameToNote = (name) => {
  const [timestamp, title, tags] = name.replace(/\..+$/, "").split(/--|__/);

  const [_, year, month, day, hours, minutes, seconds] = timestamp.match(
    /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
  );

  return {
    id: name,
    timestamp,
    date: {
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
    },
    title: title.replaceAll("-", " "),
    tags: (tags || "").split("_").filter(Boolean),
  };
};

export const allNotes = computed(() => {
  const [files, status, error] = searches.byId("notes");

  const notes = (files || []).map(nameToNote).sort((a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;

    return 0;
  });

  return [notes, status, error];
});

export const starredNotes = computed(() => {
  const [notes, status, error] = allNotes();

  const starredNotes = notes.filter((note) => note.tags.includes("star"));

  return [starredNotes, status, error];
});

export const timestampToNote = (timestamp) => {
  const [notes] = allNotes();

  return notes.find((note) => note.timestamp === timestamp);
};

export const filteredNotes = computed(() => {
  const [notes, status, error] = allNotes();

  const terms = searchTerms();

  const filteredNotes = notes.filter((node) =>
    terms.every((term) => node.id.toLowerCase().includes(term.toLowerCase())),
  );

  return [filteredNotes, status, error];
});

const currentTagFilter = computed(() => {
  const m = debouncedSearchText().match(/_[^_ ]*$/);

  return m && m[0];
});

export const allNoteTags = computed(() => {
  const [notes] = allNotes();
  const tags = new Set();

  for (const note of notes) {
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
});

const filteredNotesTags = computed(() => {
  const [notes] = filteredNotes();
  const tags = new Set();

  for (const note of notes) {
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
});

export const searchResults = computed(() => {
  const [notes, status, error] = filteredNotes();

  const searchResults = [];

  if (currentTagFilter()) {
    const tags = filteredNotesTags();

    searchResults.push(
      ...tags
        .filter(
          (tag) =>
            currentTagFilter() !== "_" + tag &&
            tag.startsWith(currentTagFilter().slice(1)),
        )
        .map((tag) => ({
          type: "tag",
          data: {
            id: "tag:" + tag,
            tag: tag,
          },
        })),
    );
  }

  searchResults.push(...notes.map((note) => ({ type: "note", data: note })));

  return [searchResults, status, error];
});

export const noteDirtyState = {
  id: null,
  rev: null,
  title: observable("", { id: "dirtyStateTitle" }),
  content: observable("", { id: "dirtyStateContent" }),
  tags: observable([], { id: "dirtyStateTags" }),
  saving: observable(false),
};

export const isStarred = computed(() => noteDirtyState.tags().includes("star"));

export const toggleStarred = () => {
  let tags = noteDirtyState.tags();

  if (isStarred()) {
    tags = tags.filter((tag) => tag !== "star");
  } else {
    tags = [...tags, "star"];
  }

  noteDirtyState.tags(tags);
};
