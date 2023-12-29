import { html } from "@dependable/view";
import { route } from "@dependable/nano-router";
import { NotePanel } from "./NotePanel.js";

export class ContentPanel {
  renderPanel() {
    if (route() === "note") {
      return html`<${NotePanel} />`;
    } else {
      return html`ContentPanel`;
    }
  }

  render() {
    return html`<main data-layout="main">${this.renderPanel()}</main>`;
  }
}
