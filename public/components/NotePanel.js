import { h } from "@dependable/view";
import { NotePreview } from "./NotePreview.js";
import { NoteEditor } from "./NoteEditor.js";
import { route } from "@dependable/nano-router";

export class NotePanel {
  render({ id }) {
    switch (route()) {
      case "note/edit":
        return h(NoteEditor, { id });
      default:
        return h(NotePreview, { id });
    }
  }
}
