import { h } from "@dependable/view";

import { IconButton } from "@dependable/components/IconButton/v0";
import PlusCircleStroke16Icon from "@dependable/icons/PlusCircleStroke16Icon";

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
    return h(
      IconButton,
      {
        basic: true,
        pill: true,
        onClick: this.onClick,
        ...props,
      },
      h(PlusCircleStroke16Icon, {
        width: "24",
        height: "24",
      }),
    );
  }
}
