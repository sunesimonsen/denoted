import { h } from "@dependable/view";
import { showDeleteNoteDialog } from "./DeleteNoteDialog.js";
import { DeleteNoteDialog } from "./DeleteNoteDialog.js";
import { IconButton } from "@dependable/components/IconButton/v0";
import TrashStroke16Icon from "@dependable/icons/TrashStroke16Icon";

export class DeleteNoteButton {
  render(props) {
    return [
      h(
        IconButton,
        {
          onClick: showDeleteNoteDialog,
          pill: true,
          basic: true,
          ...props,
        },
        h(TrashStroke16Icon, null),
      ),
      h(DeleteNoteDialog, null),
    ];
  }
}
