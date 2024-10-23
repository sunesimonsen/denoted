import { h } from "@dependable/view";
import { NotesSidebar } from "./NotesSidebar.js";
import { ContentPanel } from "./ContentPanel.js";
import { DefaultLayout } from "./DefaultLayout.js";
import { Topbar } from "./Topbar.js";
import { NewNoteDialog } from "./NewNoteDialog.js";

export class Home {
  didMount() {
    this.context.api.loadNotes();
    this.context.api.startRefreshing();
  }

  render() {
    return h(
      DefaultLayout,
      {},
      h(Topbar),
      h(NotesSidebar),
      h(ContentPanel),
      h(NewNoteDialog),
    );
  }
}
