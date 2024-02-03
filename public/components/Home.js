import { html } from "@dependable/view";
import { Sidebar } from "./SideBar.js";
import { ContentPanel } from "./ContentPanel.js";
import { DefaultLayout } from "./DefaultLayout.js";
import { Topbar } from "./Topbar.js";

export class Home {
  render() {
    this.context.api.loadNotes();

    return html`
      <${DefaultLayout} stretched>
        <${Topbar} />
        <${Sidebar} />
        <${ContentPanel} />
      <//>
    `;
  }
}
