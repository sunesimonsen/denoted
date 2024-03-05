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
        await this.context.api.deleteNote(params());
        deleting(false);
        this.onClose();
      } catch {
        deleting(false);
      }
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
          <${DialogSubmitButton} loading=${deleting()} danger primary>Delete<//>
        <//>
        <${DialogCloseButton} />
      <//>
    `;
  }
}
