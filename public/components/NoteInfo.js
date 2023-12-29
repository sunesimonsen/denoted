import { html } from "@dependable/view";
import { currentNote } from "../state.js";

export class NoteInfo {
  render() {
    const note = currentNote();

    return html`<h2>${note?.title}</h2>`;
  }
}
