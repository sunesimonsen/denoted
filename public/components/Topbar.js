import { html } from "@dependable/view";
import { css } from "stylewars";
import { FileSearch } from "./FileSearch.js";
import { Bar } from "@dependable/components/Bar/v0";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";
import { SidebarToggle } from "@dependable/components/Sidebar/v0";
import { NewNoteButton } from "./NewNoteButton.js";

const centerStyles = css`
  & {
    width: 40vw;
  }

  @media screen and (max-width: 900px) {
    & {
      width: 50vw;
    }
  }
`;

export class Topbar {
  render() {
    return html`
      <${Bar} data-layout="top">
        <${ToolbarLayout} sections="start center end">
          <div>
            <${SidebarToggle} pill basic />
          </div>
          <div className=${centerStyles}>
            <${FileSearch} />
          </div>
          <div>
            <${NewNoteButton} />
          </div>
        <//>
      <//>
    `;
  }
}
