import { html } from "@dependable/view";
import { css } from "stylewars";
import { FileSearch } from "./FileSearch.js";

const styles = css`
  & {
    display: grid;
    align-items: center;
    grid-template-columns: 400px 1fr 400px;
    background: var(--dc-color-neutral-0);
    position: relative;
    border-bottom: thin solid var(--dc-color-neutral-3);
    box-shadow: rgb(47 57 65 / 5%) 0px 16px 24px 0px;
    z-index: 1;
    height: 72px;
    padding: 0 24px;
  }
`;

export class Topbar {
  render() {
    return html`
      <div data-layout="top" className=${styles}>
        <div></div>
        <div>
          <${FileSearch} />
        </div>
        <div></div>
      </div>
    `;
  }
}
