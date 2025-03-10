import { h } from "@dependable/view";
import { IconButton } from "@dependable/components/IconButton/v0";
import PencilStroke16Icon from "@dependable/icons/PencilStroke16Icon";
import { NoteMetadataDialog } from "./NoteMetadataDialog.js";
import { showMetadataDialog } from "./NoteMetadataDialog.js";

export class EditMetadataButton {
  #onClick = () => {
    showMetadataDialog();
  };

  render() {
    return [
      h(
        IconButton,
        { basic: true, pill: true, onClick: this.#onClick },
        h(PencilStroke16Icon),
      ),
      h(NoteMetadataDialog),
    ];
  }
}
