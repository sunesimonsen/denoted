import { html } from "@dependable/view";
import { css } from "stylewars";
import { filteredNotes } from "../state.js";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { FAILED, LOADED } from "@dependable/cache";
import { FileSearch } from "./FileSearch.js";
import { NoteReference } from "./NoteReference.js";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { ReferencesSkeleton } from "./ReferencesSkeleton.js";

const styles = css`
  & {
    overflow: hidden;
    width: 300px;
    background: var(--dc-color-neutral-1);
    border-inline-end: thin solid var(--dc-color-neutral-3);
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
    padding: 16px 16px;
    border-bottom: thin solid var(--dc-color-neutral-3);
    box-shadow: rgb(47 57 65 / 5%) 0px 16px 24px 0px;
    z-index: 1;
  }
`;

export class Sidebar {
  renderFileList() {
    const [notes, status, error] = filteredNotes();

    if (status === FAILED) {
      return "Failed";
    }

    if (status !== LOADED) {
      return html`<${ReferencesSkeleton} />`;
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
