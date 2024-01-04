import { html } from "@dependable/view";
import { css, classes } from "stylewars";
import { notesCache, currentNote } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";
import { makeEditor } from "@orgajs/editor";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { NoteDate } from "./NoteDate.js";

const containerStyles = css`
  & {
    background: var(--dc-color-neutral-3);
  }
`;

const styles = css`
  & {
    background: var(--dc-color-neutral-0);
    border: thin solid var(--dc-color-neutral-2);
    padding: 40px 60px;
    margin: 30px auto;
    width: 800px;
    min-height: 1200px;
    overflow-x: hidden;
    overflow-wrap: break-word;
  }

  & a {
    text-decoration: none;
    color: var(--dc-color-primary-0);
  }

  & a:focus,
  & a:hover {
    outline: none;
    text-decoration: underline;
    color: var(--dc-color-primary-1);
  }

  & a:active {
    text-decoration: underline;
    color: var(--dc-color-primary-2);
  }

  & h1,
  & h2,
  & h3 {
    font-weight: normal;
    margin: 0;
  }

  & h1 {
    font-size: 2em;
    margin-bottom: 0.2em;
  }

  & h2 {
    font-size: 1.4em;
    margin-bottom: 0.4em;
  }

  & h3 {
    font-size: 1.2em;
    margin-bottom: 0.2em;
  }

  & p {
    margin: 0.5em 0;
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

      this.ref.addEventListener("click", (e) => {
        if (e.target.nodeName === "A") {
          const href = e.target.getAttribute("href");
          if (href.startsWith("/note/")) {
            this.context.router.navigate({
              route: "note",
              params: { id: href.slice("/note/".length) },
            });

            e.preventDefault();
          }
        }
      });
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
        <div className=${styles}>
          <h1>${note.title}</h1>
          <${NoteDate} note=${note} />
          <div ref=${this.setRef} />
        </div>
      <//>
    `;
  }
}
