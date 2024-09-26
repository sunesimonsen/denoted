import { html } from "@dependable/view";
import { css } from "stylewars";
import { allNotes, starredNotes } from "../state.js";
import { FAILED, LOADED } from "@dependable/cache";
import { NoteReference } from "./NoteReference.js";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { ReferencesSkeleton } from "./ReferencesSkeleton.js";
import { Sidebar } from "@dependable/components/Sidebar/v0";
import StarFill16Icon from "@dependable/icons/StarFill16Icon";

const styles = css`
  & {
    overflow: hidden;
    width: 300px;
  }

  & h2 {
    margin-block-start: var(--dc-spacing-4);
    margin-inline-start: var(--dc-spacing-4);
    font-size: 1em;
    font-weight: normal;
    color: var(--dc-color-neutral-40);
    display: flex;
    align-items: center;
    gap: var(--dc-spacing-1);
  }

  & h2 svg {
    color: var(--dc-color-warning-50);
  }

  & ul {
    padding: 0 var(--dc-spacing-4);
    margin: 0;
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

  renderStarred() {
    const [notes, status] = starredNotes();

    if (status === FAILED) {
      return "Failed";
    }

    if (status !== LOADED) {
      return html`<${ReferencesSkeleton} />`;
    }

    const items = notes.map((note) => {
      return html`<li><${NoteReference} note=${note} /></li>`;
    });

    if (!items.length) {
      return null;
    }

    return html`
      <h2>Starred<${StarFill16Icon} /></h2>
      <ul>
        ${items}
      </ul>
    `;
  }

  renderFileList() {
    const [notes, status] = allNotes();

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
      <h2>All</h2>
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
          <nav>${this.renderStarred()} ${this.renderFileList()}</nav>
        <//>
      <//>
    `;
  }
}
