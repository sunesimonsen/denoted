import { html } from "@dependable/view";
import { noteDirtyState } from "../state.js";
import { css } from "stylewars";
import { Button } from "@dependable/components/Button/v0";
import { ms2 } from "@dependable/components/spacing/v0";

const styles = css`
  & {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto;
    background: var(--dc-color-neutral-0);
    border-top: thin solid var(--dc-color-neutral-3);
    padding: 0 24px;
    height: 72px;
  }
`;

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
      <div className=${styles} data-layout="bottom">
        <div></div>
        <div>
          <${Button} onClick=${this.onView}>View<//>
          <${Button}
            className=${ms2}
            primary
            loading=${noteDirtyState.saving()}
            onClick=${this.onSave}
          >
            Save
          <//>
        </div>
      </div>
    `;
  }
}
