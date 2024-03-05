import { html } from "@dependable/view";
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

export class DeleteNoteDialog {
  constructor() {
    this.onClose = () => {
      deleteNoteDialogVisible(false);
    };

    this.onSubmit = () => {
      const { id } = params();
      this.context.api.deleteNote(params());
      this.onClose();
    };
  }

  render() {
    if (!deleteNoteDialogVisible()) return null;

    return html`
      <${Dialog} onClose=${this.onClose} onSubmit=${this.onSubmit}>
        <${DialogHeader}>Are you sure?<//>
        <${DialogBody}>
          <p>Are you sure you want to delete this note?</p>
          <p>Deleted content cannot be recovered.</p>
        <//>
        <${DialogFooter}>
          <${DialogSubmitButton} danger primary>Delete<//>
        <//>
        <${DialogCloseButton} />
      <//>
    `;
  }
}
