import { newDatetime } from "./datetime.js";
import { timestampFromDatetime } from "./timestamp.js";
import { idFrom } from "./ids.js";

export const newNote = ({ title, tags }) => {
  const datetime = newDatetime();
  const timestamp = timestampFromDatetime(datetime);
  const id = idFrom({ timestamp, title, tags });

  return { id, timestamp, date: datetime, title, tags, properties: {} };
};
