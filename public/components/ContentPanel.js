import { h } from "@dependable/view";
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
      return h(NotePanel);
    }

    return h(Usage);
  }

  render() {
    return h(
      "main",
      { "data-layout": "main", className: styles },
      this.renderPanel(),
    );
  }
}
