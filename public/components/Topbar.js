import { h } from "@dependable/view";
import { css } from "stylewars";
import { FileSearch } from "./FileSearch.js";
import { HomeLink } from "./HomeLink.js";
import { Bar } from "@dependable/components/Bar/v0";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";
import { SidebarToggle } from "@dependable/components/Sidebar/v0";
import { NewNoteButton } from "./NewNoteButton.js";

const centerStyles = css`
  & {
    width: 60vw;
  }
  @media screen and (max-width: 600px) {
    & {
      width: 50vw;
    }
  }
`;

export class Topbar {
  render() {
    return h(
      Bar,
      { "data-layout": "top" },
      h(
        ToolbarLayout,
        { sections: "start center end" },
        h(
          "div",
          null,
          h(SidebarToggle, { pill: true, basic: true }),
          h(HomeLink, null),
        ),
        h("div", { className: centerStyles }, h(FileSearch, null)),
        h("div", null, h(NewNoteButton, null)),
      ),
    );
  }
}
