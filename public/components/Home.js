import { html } from "@dependable/view";
import { NotesSidebar } from "./NotesSidebar.js";
import { ContentPanel } from "./ContentPanel.js";
import { DefaultLayout } from "./DefaultLayout.js";
import { Topbar } from "./Topbar.js";
import { queryParams } from "@dependable/nano-router";
import { NewNoteDialog } from "./NewNoteDialog.js";

export class Home {
  render() {
    return html`
      <${DefaultLayout} stretched>
        <${Topbar} />
        <${NotesSidebar} />
        <${ContentPanel} />
        <${NewNoteDialog} />
      <//>
    `;
  }
}
