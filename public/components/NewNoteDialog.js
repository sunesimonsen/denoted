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
import { queryParams } from "@dependable/nano-router";

const title = observable("", { id: "newNoteTitle" });
const tags = observable([], { id: "newNoteTags" });

export class NewNoteDialog {
  constructor() {
    this.onClose = () => {
      this.context.router.navigate({
        queryParams: {},
      });
    };

    this.onSubmit = () => {
      this.onClose();
    };

    this.onTitleChange = (e) => {
      title(e.target.value);
    };

    this.onTagsChange = (updatedTags) => {
      tags(updatedTags);
    };
  }

  render() {
    if (queryParams().create !== "note") return null;

    return html`
      <${Dialog} onClose=${this.onClose} onSubmit=${this.onSubmit}>
        <${DialogHeader}>Create note<//>
        <${DialogBody}>
          <${TitleInput}
            id="metadata-title-input"
            title=${title()}
            onTitleChange=${this.onTitleChange}
          />
          <${TagsInput}
            id="metadata-tags-input"
            className=${margin(3, "block-start")}
            tags=${tags()}
            onTagsChange=${this.onTagsChange}
          />
        <//>
        <${DialogFooter}>
          <${DialogSubmitButton} primary>Create<//>
        <//>
        <${DialogCloseButton} />
      <//>
    `;
  }
}
