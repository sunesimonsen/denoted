import { observable, computed } from "@dependable/state";
import { Cache } from "@dependable/cache";
import { debounce } from "@dependable/debounce";
import { route, params } from "@dependable/nano-router";

export const searches = new Cache("searches");
export const notesCache = new Cache("notes");

export const searchText = observable("", { id: "searchText" });
const debouncedSearchText = debounce(searchText, 50);

const searchTerms = computed(() => {
  const words = [];
  const tags = [];
  for (const part of debouncedSearchText().split(/\s+/)) {
    if (part.startsWith("tag:")) {
      tags.push(part.slice(4));
    } else {
      words.push(part);
    }
  }

  return { words, tags };
});

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

const allNotes = computed(() => {
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

  const { words, tags } = searchTerms();

  const filteredNotes = notes.filter(
    (node) =>
      words.every((word) => node.title.includes(word)) &&
      tags.every((tag) => node.tags.includes(tag)),
  );

  return [filteredNotes, status, error];
});

export const currentNote = computed(() => {
  if (route() !== "note") return null;

  const [notes, status, error] = allNotes();

  return notes.find(({ id }) => id === params().id);
});
