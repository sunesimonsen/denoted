import { html } from "@dependable/view";
import { Button } from "@dependable/components/Button/v0";
import { showDeleteNoteDialog } from "./DeleteNoteDialog.js";

export class DeleteNoteButton {
  render(props) {
    return html`
      <${Button} onClick=${showDeleteNoteDialog} ...${props}> Delete <//>
    `;
  }
}
