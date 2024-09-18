import { html } from "@dependable/view";
import { observable } from "@dependable/state";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseButton,
  DialogSubmitButton,
} from "@dependable/components/Dialog/v0";

import { noteDirtyState } from "../state.js";
import { margin } from "@dependable/components/theming/v0";
import { TitleInput } from "./TitleInput.js";
import { TagsInput } from "./TagsInput.js";
import { isTitleInvalid } from "../validations/isTitleInvalid.js";

const metadataDialogVisible = observable(false, {
  id: "metadataDialogVisible",
});

const title = observable("", { id: "noteMetadataTitle" });
const tags = observable([], { id: "noteMetadataTags" });
const invalidTitle = observable(false, { id: "editNoteTitleInvalid" });

export const showMetadataDialog = () => {
  title(noteDirtyState.title());
  tags(noteDirtyState.tags());
  metadataDialogVisible(true);
};

export class NoteMetadataDialog {
  constructor() {
    this.onClose = () => {
      metadataDialogVisible(false);
      invalidTitle(false);
    };

    this.onSubmit = () => {
      if (isTitleInvalid(title())) {
        invalidTitle(true);
      } else {
        noteDirtyState.title(title());
        noteDirtyState.tags(tags());
        this.onClose();
      }
    };

    this.onTitleChange = (e) => {
      title(e.target.value);
    };

    this.onTagsChange = (updatedTags) => {
      tags(updatedTags);
    };
  }

  render() {
    if (!metadataDialogVisible()) return null;

    return html`
      <${Dialog} onClose=${this.onClose} onSubmit=${this.onSubmit}>
        <${DialogHeader}>Note metadata<//>
        <${DialogBody}>
          <${TitleInput}
            id="metadata-title-input"
            title=${title()}
            onTitleChange=${this.onTitleChange}
            invalid=${invalidTitle()}
          />
          <${TagsInput}
            id="metadata-tags-input"
            className=${margin(3, "block-start")}
            tags=${tags()}
            onTagsChange=${this.onTagsChange}
          />
        <//>
        <${DialogFooter}>
          <${DialogSubmitButton} primary>Change<//>
        <//>
        <${DialogCloseButton} />
      <//>
    `;
  }
}
