import { h } from "@dependable/view";

import { noteDirtyState } from "../state.js";

import { Button } from "@dependable/components/Button/v0";
import { margin } from "@dependable/components/theming/v0";
import { Bar } from "@dependable/components/Bar/v0";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";
import { DeleteNoteButton } from "./DeleteNoteButton.js";

export class NoteEditorFooter {
  constructor() {
    this.onView = () => {
      this.context.router.navigate("note/view");
    };
    this.onSave = () => {
      this.context.api.saveNote();
    };
  }
  render() {
    return h(
      Bar,
      {
        "data-layout": "bottom",
      },
      h(
        ToolbarLayout,
        {
          sections: "start end",
        },
        h("div", null, h(DeleteNoteButton, null)),
        h(
          "div",
          null,
          h(
            Button,
            {
              basic: true,
              onClick: this.onView,
            },
            "View",
          ),
          h(
            Button,
            {
              className: margin(2, "start"),
              primary: true,
              loading: noteDirtyState.saving(),
              onClick: this.onSave,
            },
            "Save",
          ),
        ),
      ),
    );
  }
}
