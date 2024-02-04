import { html } from "@dependable/view";
import { NotePreview } from "./NotePreview.js";
import { NoteEditor } from "./NoteEditor.js";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { route, params } from "@dependable/nano-router";

export class NotePanel {
  renderPanel() {
    switch (route()) {
      case "note/edit":
        return html`<${NoteEditor} />`;
      default:
        return html`<${NotePreview} />`;
    }
  }

  render() {
    this.context.api.loadNote(params().id);

    return html`<${BorderLayout} stretched> ${this.renderPanel()} <//>`;
  }
}
