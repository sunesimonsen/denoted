import { html } from "@dependable/view";
import { css } from "stylewars";
import { notesCache, currentNote } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";
import { makeEditor } from "@orgajs/editor";
import { Skeleton } from "@dependable/components/Skeleton/v0";

const skeletonStyles = css`
  & {
    padding: 0 30px;
    width: 800px;
  }
`;

class NotePreviewSkeleton {
  render() {
    return html`
      <div className=${skeletonStyles}>
        <h2>
          <${Skeleton} />
        </h2>
        <p>
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
        </p>
        <h2>
          <${Skeleton} />
        </h2>
        <p>
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
        </p>
      </div>
    `;
  }
}

export class NotePreview {
  constructor() {
    this.setRef = (ref) => {
      this.ref = ref;
    };
  }

  didRender() {
    const { id } = params();

    const [note, status] = notesCache.byId(id);

    if (status === LOADED && id !== this.id) {
      if (this.editor) {
        this.editor.destroy();
      }

      const { editor } = makeEditor({
        target: this.ref,
        content: note.content,
      });

      this.editor = editor;

      this.id = id;
    }
  }

  render() {
    const [note, status, error] = notesCache.byId(params().id);

    if (status === FAILED) {
      return html`Failed`;
    }

    if (status !== LOADED) {
      return html`<${NotePreviewSkeleton} />`;
    }

    return html`<div ref=${this.setRef} style="overflow: hidden" />`;
  }
}