import { html } from "@dependable/view";
import { css } from "stylewars";
import { filteredNotes } from "../state.js";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { FAILED, LOADED } from "@dependable/cache";
import { FileSearch } from "./FileSearch.js";
import { NoteReference } from "./NoteReference.js";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";

const styles = css`
  & {
    overflow: hidden;
    width: 300px;
    background: var(--dc-color-neutral-1);
  }

  & ul {
    padding: 0 16px;
    margin: 0;
  }

  & ul > li {
    padding: 0;
    margin: 4px;
    list-style-type: none;
  }

  & [data-layout="top"] {
    margin: 16px 16px;
  }
`;

export class Sidebar {
  renderFileList() {
    const [notes, status, error] = filteredNotes();

    if (status === FAILED) {
      return "Failed";
    }

    if (status !== LOADED) {
      return "loading";
    }

    const items = notes.map((note) => {
      const tagString = note.tags.length ? ` (${note.tags.join(",")})` : "";
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
      <nav data-layout="start" className=${styles}>
        <${BorderLayout} stretched>
          <div data-layout="top">
            <${FileSearch} />
          </div>
          <${ScrollArea}>${this.renderFileList()}<//>
        <//>
      </nav>
    `;
  }
}
