import { html } from "@dependable/view";

import { IconButton } from "@dependable/components/IconButton/v0";
import PlusStroke16Icon from "@dependable/icons/PlusStroke16Icon";
import { Link } from "@dependable/nano-router";

export class NewNoteButton {
  constructor() {
    this.onClick = () => {
      this.context.router.navigate({
        queryParams: {
          create: "note",
        },
      });
    };
  }

  render(props) {
    return html`
      <${IconButton} onClick=${this.onClick} ...${props}>
        <${PlusStroke16Icon} />
      <//>
    `;
  }
}
