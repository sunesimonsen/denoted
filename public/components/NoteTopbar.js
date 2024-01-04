import { html } from "@dependable/view";
import { css } from "stylewars";

const styles = css`
  & {
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;
    background: var(--dc-color-neutral-0);
    position: relative;
    border-bottom: thin solid var(--dc-color-neutral-3);
    box-shadow: rgb(47 57 65 / 5%) 0px 16px 24px 0px;
    z-index: 1;
    height: 72px;
    padding: 0 24px;
  }
`;

export class NoteTopbar {
  render() {
    return html` <div data-layout="top" className=${styles}></div> `;
  }
}
