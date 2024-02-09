import { html } from "@dependable/view";
import { css } from "stylewars";
import { allNotes } from "../state.js";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { FAILED, LOADED } from "@dependable/cache";
import { NoteReference } from "./NoteReference.js";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { ReferencesSkeleton } from "./ReferencesSkeleton.js";

const styles = css`
  & {
    display: flex;
    overflow: hidden;
    width: 300px;
    background: var(--dc-color-neutral-1);
    border-inline-end: thin solid var(--dc-color-neutral-3);
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

export class Sidebar {
  renderFileList() {
    const [notes, status, error] = allNotes();

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

  didMount() {
    setInterval(() => {
      this.context.api.refresh();
    }, 10000);
  }

  render() {
    return html`
      <nav data-layout="start" className=${styles}>
        <${ScrollArea} className=${scrollAreaStyles}>
          ${this.renderFileList()}
        <//>
      </nav>
    `;
  }
}
