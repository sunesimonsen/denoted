import { h } from "@dependable/view";
import { css } from "stylewars";
import { route, params } from "@dependable/nano-router";
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
      return h(NotePanel, { id: params().id });
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
