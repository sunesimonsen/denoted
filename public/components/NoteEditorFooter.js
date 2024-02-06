import { html } from "@dependable/view";
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
    this.onCancel = () => {
      this.context.router.navigate("note/view");
    };
  }

  render() {
    return html`
      <div className=${styles} data-layout="bottom">
        <div></div>
        <div>
          <${Button} onClick=${this.onCancel}>Cancel<//>
          <${Button} className=${ms2} primary>Save<//>
        </div>
      </div>
    `;
  }
}
