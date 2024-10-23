import { h } from "@dependable/view";
import { css, classes } from "stylewars";
import { notesCache } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { EditButton } from "./EditButton.js";
import { FatalErrorScreen } from "./FatalErrorScreen.js";
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
    return h(
      "div",
      { className: classes(containerStyles, skeletonStyles) },
      h(
        Paper,
        {},
        h("h2", {}, h(Skeleton)),
        h("p", {}, h(Skeleton), h(Skeleton), h(Skeleton)),
        h("h2", {}, h(Skeleton)),
        h(
          "p",
          {},
          h(Skeleton),
          h(Skeleton),
          h(Skeleton),
          h(Skeleton),
          h(Skeleton),
        ),
        h("h2", {}, h(Skeleton)),
        h("p", {}, h(Skeleton), h(Skeleton), h(Skeleton)),
        h("h2", {}, h(Skeleton)),
        h(
          "p",
          {},
          h(Skeleton),
          h(Skeleton),
          h(Skeleton),
          h(Skeleton),
          h(Skeleton),
        ),
      ),
    );
  }
}

export class NotePreview {
  #setScrollRef = (ref) => {
    this.scrollRef = ref;
  };

  #anchorClickHandler = (e) => {
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
  };

  #setDocmentRef = (ref) => {
    this.documentRef = ref;
    this.documentRef.addEventListener("click", this.#anchorClickHandler);
  };

  didRender() {
    const id = this.props.id;
    const [note, status] = notesCache.byId(id);

    if (status === LOADED && (id !== this.id || note.rev !== this.rev)) {
      this.documentRef.innerHTML = note.html;
      this.id = id;
      this.rev = note.rev;
      this.scrollRef.focus();
    }
  }

  render({ id }) {
    const [note, status] = notesCache.byId(id);

    if (status === FAILED) {
      return h(FatalErrorScreen);
    }

    if (status !== LOADED) {
      return h(NotePreviewSkeleton);
    }

    return h(
      ScrollArea,
      { className: containerStyles, ref: this.#setScrollRef, tabindex: "-1" },
      h(
        Paper,
        {},
        h(EditButton, { className: editButtonStyles }),
        h(NoteMetadata, {
          title: note.title,
          date: note.date,
          tags: note.tags,
        }),
        h("hr"),
        h("div", { ref: this.#setDocmentRef }),
      ),
    );
  }
}
