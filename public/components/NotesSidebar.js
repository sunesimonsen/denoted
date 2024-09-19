import { html } from "@dependable/view";
import { css } from "stylewars";
import { allNotes } from "../state.js";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { FAILED, LOADED } from "@dependable/cache";
import { NoteReference } from "./NoteReference.js";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { ReferencesSkeleton } from "./ReferencesSkeleton.js";
import { SidebarLayout, Sidebar } from "@dependable/components/Sidebar/v0";

const styles = css`
  & {
    overflow: hidden;
    width: 300px;
  }

  & ul {
    padding: 0 16px;
    margin: 20px 0;
  }

  & ul > li {
    padding: 0;
    margin: 4px;
    list-style-type: none;
  }
`;

const scrollAreaStyles = css`
  & {
    flex: 1;
  }
`;

export class NotesSidebar {
  constructor() {
    this.onClick = () => {
      this.context.visibleSidebar("");
    };
  }

  renderFileList() {
    const [notes, status, error] = allNotes();

    if (status === FAILED) {
      return "Failed";
    }

    if (status !== LOADED) {
      return html`<${ReferencesSkeleton} />`;
    }

    const items = notes.map((note) => {
      return html`<li><${NoteReference} note=${note} /></li>`;
    });

    return html`
      <ul>
        ${items}
      </ul>
    `;
  }

  render() {
    return html`
      <${Sidebar}
        data-layout="start"
        className=${styles}
        onClick=${this.onClick}
      >
        <${ScrollArea} className=${scrollAreaStyles}>
          <nav>${this.renderFileList()}</nav>
        <//>
      <//>
    `;
  }
}
