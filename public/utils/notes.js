import { newDatetime } from "./datetime.js";
import { timestampFromDatetime } from "./timestamp.js";
import { idFrom } from "./ids.js";
import { InvalidTitleError } from "../errors/InvalidTitleError.js";
import { isTitleInvalid } from "../validations/isTitleInvalid.js";

export const newNote = ({ title = "", tags }) => {
  if (isTitleInvalid(title)) {
    throw new InvalidTitleError(title);
  }

  const datetime = newDatetime();
  const timestamp = timestampFromDatetime(datetime);
  const id = idFrom({ timestamp, title, tags });

  return { id, timestamp, date: datetime, title, tags, properties: {} };
};
