import { html } from "@dependable/view";
import { css } from "stylewars";
import { notesCache } from "../state.js";
import { params } from "@dependable/nano-router";
import { LOADED, FAILED } from "@dependable/cache";
import { NoteTitle, NoteTitleSkeleton } from "./NoteTitle.js";
import { NoteDate, NoteDateSkeleton } from "./NoteDate.js";

export class NoteInfo {
  render() {
    const [note, status, error] = notesCache.byId(params().id);

    if (status === FAILED) {
      console.log(error);
      return html`Failed`;
    }

    if (status !== LOADED) {
      return html`<div><${NoteTitleSkeleton} /><${NoteDateSkeleton} /></div>`;
    }

    return html`
      <div><${NoteTitle}>${note.title}<//><${NoteDate} note=${note} /></div>
    `;
  }
}
