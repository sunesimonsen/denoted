import { html } from "@dependable/view";
import { notesCache, currentNote } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";

export class NotePreview {
  render() {
    const [content, status, error] = notesCache.byId(params().id);

    if (status === FAILED) {
      return html`Failed`;
    }

    if (status !== LOADED) {
      return html`Loading`;
    }

    return html`<pre>${content}</pre>`;
  }
}
