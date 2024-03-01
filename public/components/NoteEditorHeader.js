import { html } from "@dependable/view";
import { css } from "stylewars";
import { notesCache } from "../state.js";
import { Button } from "@dependable/components/Button/v0";
import { NoteDate } from "./NoteDate.js";
import { params } from "@dependable/nano-router";
import { FAILED, LOADED } from "@dependable/cache";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { Bar } from "@dependable/components/Bar/v0";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";

const styles = css`
  & {
    padding: 12px 30px;
  }

  & h1 {
    font-weight: normal;
    margin: 0;
  }
`;

class HeaderSkeleton {
  render() {
    return html`
      <div className=${styles} data-layout="top">
        <h1 style="width: 230px"><${Skeleton} /></h1>
        <div style="width: 130px"><${Skeleton} /></div>
      </div>
    `;
  }
}

export class NoteEditorHeader {
  renderTitle() {
    return note?.title || "Unknown";
  }

  render() {
    const [note, status, error] = notesCache.byId(params().id);

    if (status === FAILED) {
      return "Failed";
    }

    if (status !== LOADED) {
      return html`<${HeaderSkeleton} />`;
    }

    return html`
      <${Bar} data-layout="top" className=${styles}>
        <h1>${note.title}</h1>
        <${NoteDate} note=${note} />
      <//>
    `;
  }
}
