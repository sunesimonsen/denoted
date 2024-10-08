import { h } from "@dependable/view";
import { observable } from "@dependable/state";
import { params } from "@dependable/nano-router";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseButton,
  DialogSubmitButton,
} from "@dependable/components/Dialog/v0";

const deleteNoteDialogVisible = observable(false, {
  id: "deleteNoteDialogVisible",
});

export const showDeleteNoteDialog = () => {
  deleteNoteDialogVisible(true);
};

const deleting = observable(false);

export class DeleteNoteDialog {
  constructor() {
    this.onClose = () => {
      if (!deleting()) {
        deleteNoteDialogVisible(false);
      }
    };

    this.onSubmit = async () => {
      const { id } = params();

      deleting(true);

      try {
        await this.context.api.deleteNote({ id });
        deleting(false);
        this.onClose();
      } catch {
        deleting(false);
      }
    };
  }

  render() {
    if (!deleteNoteDialogVisible()) return null;

    return h(
      Dialog,
      { onClose: this.onClose, onSubmit: this.onSubmit },
      h(DialogHeader, null, "Are you sure?"),
      h(
        DialogBody,
        null,
        h("p", null, "Are you sure you want to delete this note?"),
        h("p", null, "Deleted content cannot be recovered."),
      ),
      h(
        DialogFooter,
        null,
        h(
          DialogSubmitButton,
          { loading: deleting(), danger: true, primary: true },
          "Delete",
        ),
      ),
      h(DialogCloseButton, null),
    );
  }
}
