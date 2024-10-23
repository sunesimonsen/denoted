import { h } from "@dependable/view";
import { NotesSidebar } from "./NotesSidebar.js";
import { ContentPanel } from "./ContentPanel.js";
import { DefaultLayout } from "./DefaultLayout.js";
import { Topbar } from "./Topbar.js";
import { NewNoteDialog } from "./NewNoteDialog.js";

export class Home {
  didMount() {
    const api = this.context.api;

    if (api.isAuthenticated()) {
      api.loadNotes();
      api.startRefreshing();
    } else {
      api.authenticate();
    }
  }

  render() {
    if (!this.context.api.isAuthenticated()) return null;

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
