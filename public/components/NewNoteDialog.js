import { h } from "@dependable/view";
import { observable } from "@dependable/state";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseButton,
  DialogSubmitButton,
} from "@dependable/components/Dialog/v0";
import { margin } from "@dependable/components/theming/v0";
import { TitleInput } from "./TitleInput.js";
import { TagsInput } from "./TagsInput.js";
import { queryParams } from "@dependable/nano-router";
import { InvalidTitleError } from "../errors/InvalidTitleError.js";

const title = observable("", { id: "newNoteTitle" });
const tags = observable([], { id: "newNoteTags" });
const invalidTitle = observable(false, { id: "newNoteTitleInvalid" });
const creating = observable(false);

export class NewNoteDialog {
  constructor() {
    this.onClose = () => {
      if (!creating()) {
        this.context.router.navigate({ queryParams: {}, replace: true });
        title("");
        tags([]);
        invalidTitle(false);
      }
    };

    this.onSubmit = async () => {
      creating(true);

      try {
        await this.context.api.createNote({ title: title(), tags: tags() });
        creating(false);
        this.onClose();
      } catch (e) {
        creating(false);

        if (e instanceof InvalidTitleError) {
          invalidTitle(true);
        }
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
    if (queryParams().create !== "note") return null;

    return h(
      Dialog,
      { onClose: this.onClose, onSubmit: this.onSubmit },
      h(DialogHeader, {}, "Create note"),
      h(
        DialogBody,
        {},
        h(TitleInput, {
          id: "metadata-title-input",
          title: title(),
          onTitleChange: this.onTitleChange,
          invalid: invalidTitle(),
        }),
        h(TagsInput, {
          id: "metadata-tags-input",
          className: margin(3, "block-start"),
          tags: tags(),
          onTagsChange: this.onTagsChange,
        }),
      ),
      h(
        DialogFooter,
        {},
        h(DialogSubmitButton, { primary: true, loading: creating() }, "Create"),
      ),
      h(DialogCloseButton),
    );
  }
}
