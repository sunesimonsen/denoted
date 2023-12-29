import { html } from "@dependable/view";
import { Sidebar } from "./SideBar.js";
import { ContentPanel } from "./ContentPanel.js";
import { DefaultLayout } from "./DefaultLayout.js";

export class Home {
  didMount() {
    this.context.api.loadNotes();
  }

  render() {
    return html`
      <${DefaultLayout} stretched>
        <${Sidebar} />
        <${ContentPanel} />
      <//>
    `;
  }
}