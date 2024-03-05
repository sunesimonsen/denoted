import { html } from "@dependable/view";
import { css, classes } from "stylewars";
import { notesCache } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { EditButton } from "./EditButton.js";
import { Paper } from "./Paper.js";
import { NoteMetadata } from "./NoteMetadata.js";

const containerStyles = css`
  & {
    background: var(--dc-color-neutral-85);
    height: 100%;
  }
  &:focus {
    outline: none;
  }

  @media screen and (max-width: 900px) {
    & {
      background: var(--dc-color-background);
    }
  }
`;

const skeletonStyles = css`
  & {
    overflow-y: auto;
  }
`;

const editButtonStyles = css`
  & {
    position: absolute;
    top: 20px;
    right: 20px;
  }
`;

class NotePreviewSkeleton {
  render() {
    return html`
      <div className=${classes(containerStyles, skeletonStyles)}>
        <${Paper}>
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
        <//>
      </div>
    `;
  }
}

export class NotePreview {
  constructor() {
    this.setScrollRef = (ref) => {
      this.scrollRef = ref;
    };

    this.setDocmentRef = (ref) => {
      this.documentRef = ref;

      this.documentRef.addEventListener("click", (e) => {
        if (e.target.nodeName === "A") {
          const href = e.target.getAttribute("href");
          if (href.startsWith("/note/")) {
            this.context.router.navigate({
              route: "note/view",
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

    if (status === LOADED && (id !== this.id || note.rev !== this.rev)) {
      this.documentRef.innerHTML = note.html;

      this.id = id;
      this.rev = note.rev;
      this.scrollRef.focus();
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
      <${ScrollArea}
        className=${containerStyles}
        ref=${this.setScrollRef}
        tabindex="-1"
      >
        <${Paper}>
          <${EditButton} className=${editButtonStyles} />
          <${NoteMetadata}
            title=${note.title}
            date=${note.date}
            tags=${note.tags}
          />
          <hr />
          <div ref=${this.setDocmentRef} />
        <//>
      <//>
    `;
  }
}
