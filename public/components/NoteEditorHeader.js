import { h } from "@dependable/view";
import { FAILED, LOADED } from "@dependable/cache";
import { css } from "stylewars";
import { Bar } from "@dependable/components/Bar/v0";
import { noteDirtyState, notesCache } from "../state.js";
import { StarButton } from "./StarButton.js";
import { EditMetadataButton } from "./EditMetadataButton.js";
import { NoteMetadata, NoteMetadataSkeleton } from "./NoteMetadata.js";
import { ToolbarLayout } from "@dependable/components/ToolbarLayout/v0";

const toolbarStyles = css`
  & {
    --dc-toolbar-align-items: start;
    --dc-toolbar-gap: var(--dc-spacing-2);
  }
`;

export class NoteEditorHeader {
  render({ id }) {
    const [note, status, error] = notesCache.byId(id);

    if (status === FAILED) {
      throw error;
    }

    return h(
      Bar,
      { "data-layout": "top" },
      h(
        ToolbarLayout,
        { sections: "start end", className: toolbarStyles },
        h(
          "div",
          {},
          status === LOADED
            ? h(NoteMetadata, {
                title: noteDirtyState.title(),
                date: note.date,
                tags: noteDirtyState.tags(),
              })
            : h(NoteMetadataSkeleton),
        ),
        h("div", {}, h(StarButton), h(EditMetadataButton)),
      ),
    );
  }
}
