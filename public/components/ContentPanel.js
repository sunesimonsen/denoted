import { html } from "@dependable/view";
import { css } from "stylewars";
import { route } from "@dependable/nano-router";
import { NotePanel } from "./NotePanel.js";

const styles = css`
  & {
    overflow: hidden;
  }
`;

export class ContentPanel {
  renderPanel() {
    if (route() === "note") {
      return html`<${NotePanel} />`;
    } else {
      return html`ContentPanel`;
    }
  }

  render() {
    return html`
      <main data-layout="main" className=${styles}>${this.renderPanel()}</main>
    `;
  }
}
