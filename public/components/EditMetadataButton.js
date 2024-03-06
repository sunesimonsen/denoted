import { html } from "@dependable/view";
import { observable } from "@dependable/state";
import { css } from "stylewars";
import { IconButton } from "@dependable/components/IconButton/v0";
import PencilStroke16Icon from "@dependable/icons/PencilStroke16Icon";
import { Link } from "@dependable/nano-router";
import { showMetadataDialog } from "./NoteMetadataDialog.js";

const styles = css`
  & {
    position: absolute;
    inset-inline-end: var(--dc-spacing-4);
    inset-block-start: var(--dc-spacing-3);
  }
`;

export class EditMetadataButton {
  constructor() {
    this.onClick = () => {
      showMetadataDialog();
    };
  }

  render() {
    return html`
      <${IconButton} basic pill onClick=${this.onClick} className=${styles}>
        <${PencilStroke16Icon} />
      <//>
    `;
  }
}
