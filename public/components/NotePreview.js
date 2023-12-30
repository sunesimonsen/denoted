import { html } from "@dependable/view";
import { css, classes } from "stylewars";
import { notesCache, currentNote } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";
import { makeEditor } from "@orgajs/editor";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";

const containerStyles = css`
  & {
    background: var(--dc-color-neutral-3);
  }
`;

const styles = css`
  & {
    background: var(--dc-color-neutral-0);
    border: thin solid var(--dc-color-neutral-2);
    padding: 30px;
    margin: 30px auto;
    width: 800px;
    min-height: 1200px;
    overflow-x: hidden;
    overflow-wrap: break-word;
  }
`;

const skeletonStyles = css`
  & {
    overflow-y: auto;
  }
`;

class NotePreviewSkeleton {
  render() {
    return html`
      <div className=${classes(containerStyles, skeletonStyles)}>
        <div className=${styles}>
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
      this.ref.innerHTML = note.html;

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

    return html`
      <${ScrollArea} className=${containerStyles}>
        <div ref=${this.setRef} className=${styles} />
      <//>
    `;
  }
}
