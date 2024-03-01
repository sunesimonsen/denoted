import { html } from "@dependable/view";
import { FileSearch } from "./FileSearch.js";
import { Bar } from "@dependable/components/Bar/v0";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";
import { SidebarToggle } from "@dependable/components/Sidebar/v0";

export class Topbar {
  render() {
    return html`
      <${Bar} data-layout="top">
        <${ToolbarLayout} sections="start center end">
          <div>
            <${SidebarToggle} />
          </div>
          <div style="width: 40vw">
            <${FileSearch} />
          </div>
          <div></div>
        <//>
      <//>
    `;
  }
}
