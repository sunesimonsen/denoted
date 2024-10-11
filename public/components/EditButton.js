import { h } from "@dependable/view";
import { IconButton } from "@dependable/components/IconButton/v0";
import PencilStroke16Icon from "@dependable/icons/PencilStroke16Icon";

export class EditButton {
  #onClick = () => {
    this.context.router.navigate("note/edit");
  };

  render(props) {
    return h(
      IconButton,
      { basic: true, pill: true, onClick: this.#onClick, ...props },
      h(PencilStroke16Icon),
    );
  }
}
