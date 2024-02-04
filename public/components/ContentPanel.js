import { html } from "@dependable/view";
import { css } from "stylewars";
import { route } from "@dependable/nano-router";
import { NotePanel } from "./NotePanel.js";
import { Usage } from "./Usage.js";

const styles = css`
  & {
    overflow: hidden;
  }
`;

export class ContentPanel {
  renderPanel() {
    if (route().startsWith("note/")) {
      return html`<${NotePanel} />`;
    }

    return html`<${Usage} />`;
  }

  render() {
    return html`
      <main data-layout="main" className=${styles}>${this.renderPanel()}</main>
    `;
  }
}
