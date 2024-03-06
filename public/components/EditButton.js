import { html } from "@dependable/view";

import { IconButton } from "@dependable/components/IconButton/v0";
import PencilStroke16Icon from "@dependable/icons/PencilStroke16Icon";
import { Link } from "@dependable/nano-router";

export class EditButton {
  constructor() {
    this.onClick = () => {
      this.context.router.navigate("note/edit");
    };
  }

  render(props) {
    return html`
      <${IconButton} basic pill onClick=${this.onClick} ...${props}>
        <${PencilStroke16Icon} />
      <//>
    `;
  }
}
