import { html } from "@dependable/view";

import { IconButton } from "@dependable/components/IconButton/v0";
import PencilStroke12Icon from "@dependable/icons/PencilStroke12Icon";
import { Link } from "@dependable/nano-router";

export class EditButton {
  render(props) {
    return html`
      <${Link} route="note/edit">
        <${IconButton} ...${props}><${PencilStroke12Icon} /><//>
      <//>
    `;
  }
}
