import { html } from "@dependable/view";
import { IconButton } from "@dependable/components/IconButton/v0";
import PlusCircleStroke16Icon from "@dependable/icons/PlusCircleStroke16Icon";
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
      <${IconButton} basic pill onClick=${this.onClick} ...${props}>
        <${PlusCircleStroke16Icon} width="24" height="24" />
      <//>
    `;
  }
}
