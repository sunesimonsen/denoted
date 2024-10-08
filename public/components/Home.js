import { h } from "@dependable/view";
import { NotesSidebar } from "./NotesSidebar.js";
import { ContentPanel } from "./ContentPanel.js";
import { DefaultLayout } from "./DefaultLayout.js";
import { Topbar } from "./Topbar.js";
import { NewNoteDialog } from "./NewNoteDialog.js";

export class Home {
  render() {
    return h(
      DefaultLayout,
      { stretched: true },
      h(Topbar, null),
      h(NotesSidebar, null),
      h(ContentPanel, null),
      h(NewNoteDialog, null),
    );
  }
}
