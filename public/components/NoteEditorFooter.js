import { html } from "@dependable/view";
import { noteDirtyState } from "../state.js";
import { css } from "stylewars";
import { Button } from "@dependable/components/Button/v0";
import { margin } from "@dependable/components/theming/v0";
import { Bar } from "@dependable/components/Bar/v0";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";

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
    return html`
      <${Bar} data-layout="bottom">
        <${ToolbarLayout} sections="end">
          <${Button} onClick=${this.onView}>View<//>
          <${Button}
            className=${margin(2, "start")}
            primary
            loading=${noteDirtyState.saving()}
            onClick=${this.onSave}
          >
            Save
          <//>
        <//>
      <//>
    `;
  }
}
