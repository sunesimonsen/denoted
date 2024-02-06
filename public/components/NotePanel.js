import { html } from "@dependable/view";
import { NotePreview } from "./NotePreview.js";
import { NoteEditor } from "./NoteEditor.js";
import { route, params } from "@dependable/nano-router";

export class NotePanel {
  render() {
    this.context.api.loadNote(params().id);

    switch (route()) {
      case "note/edit":
        return html`<${NoteEditor} />`;
      default:
        return html`<${NotePreview} />`;
    }
  }
}
