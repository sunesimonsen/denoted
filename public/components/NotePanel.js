import { html } from "@dependable/view";
import { NotePreview } from "./NotePreview.js";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { params } from "@dependable/nano-router";

export class NotePanel {
  render() {
    this.context.api.loadNote(params().id);

    return html`
      <${BorderLayout} stretched>
        <${NotePreview} />
      <//>
    `;
  }
}
