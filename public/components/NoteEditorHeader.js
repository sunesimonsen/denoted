import { FAILED, LOADED } from "@dependable/cache";
import { css } from "stylewars";
import { Bar } from "@dependable/components/Bar/v0";
import { params } from "@dependable/nano-router";
import { html } from "@dependable/view";
import { noteDirtyState, notesCache } from "../state.js";
import { StarButton } from "./StarButton.js";
import { EditMetadataButton } from "./EditMetadataButton.js";
import { NoteMetadata, NoteMetadataSkeleton } from "./NoteMetadata.js";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";

const toolbarStyles = css`
  & {
    --dc-toolbar-align-items: start;
  }
`;

export class NoteEditorHeader {
  renderTitle() {
    return note?.title || "Unknown";
  }

  render() {
    const [note, status] = notesCache.byId(params().id);

    if (status === FAILED) {
      return "Failed";
    }

    return html`
      <${Bar} data-layout="top">
        <${ToolbarLayout} sections="start end" className=${toolbarStyles}>
          <div>
            ${status === LOADED
              ? html`
                  <${NoteMetadata}
                    title=${noteDirtyState.title()}
                    date=${note.date}
                    tags=${noteDirtyState.tags()}
                  />
                `
              : html`<${NoteMetadataSkeleton} />`}
          </div>
          <div>
            <${StarButton} />
            <${EditMetadataButton} />
          </div>
        <//>
      <//>
    `;
  }
}
