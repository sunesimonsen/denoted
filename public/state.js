import { observable, computed } from "@dependable/state";
import { Cache } from "@dependable/cache";
import { debounce } from "@dependable/debounce";

export const searches = new Cache("searches");
export const notesCache = new Cache("notes");
export const authCache = new Cache("authCache");

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
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
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

export const timestampToNote = (timestamp) => {
  const [notes, status, error] = allNotes();

  return notes.find((note) => note.timestamp === timestamp);
};

export const filteredNotes = computed(() => {
  const [notes, status, error] = allNotes();

  const terms = searchTerms();

  const filteredNotes = notes.filter((node) =>
    terms.every((term) => node.id.includes(term)),
  );

  return [filteredNotes, status, error];
});

const currentTagFilter = computed(() => {
  const m = debouncedSearchText().match(/_[^_ ]*$/);
  return m && m[0];
});

const filteredNotesTags = computed(() => {
  const [notes, status, error] = filteredNotes();
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
  title: observable(""),
  content: observable(""),
  saving: observable(false),
};
