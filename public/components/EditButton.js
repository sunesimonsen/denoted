import { html } from "@dependable/view";

import { IconButton } from "@dependable/components/IconButton/v0";
import PencilStroke12Icon from "@dependable/icons/PencilStroke12Icon";
import { Link } from "@dependable/nano-router";

export class EditButton {
  constructor() {
    this.onEdit = () => {
      this.context.router.navigate("note/edit");
    };
  }

  render(props) {
    return html`
      <${IconButton} onClick=${this.onEdit} ...${props}>
        <${PencilStroke12Icon} />
      <//>
    `;
  }
}
