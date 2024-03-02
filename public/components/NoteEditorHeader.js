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
import { noteDirtyState } from "../state.js";
import { NoteMetadata, NoteMetadataSkeleton } from "./NoteMetadata.js";

const styles = css`
  & {
    padding: 12px 30px;
  }
`;

export class NoteEditorHeader {
  renderTitle() {
    return note?.title || "Unknown";
  }

  render() {
    const [note, status, error] = notesCache.byId(params().id);

    if (status === FAILED) {
      return "Failed";
    }

    return html`
      <${Bar} data-layout="top" className=${styles}>
        ${status === LOADED
          ? html`
              <${NoteMetadata}
                title=${noteDirtyState.title()}
                date=${note}
                tags=${note.tags}
              />
            `
          : html`<${NoteMetadataSkeleton} />`}
      <//>
    `;
  }
}
