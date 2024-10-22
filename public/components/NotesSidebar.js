import { h } from "@dependable/view";
import { css } from "stylewars";
import { allNotes, starredNotes } from "../state.js";
import { FAILED, LOADED } from "@dependable/cache";
import { NoteReference } from "./NoteReference.js";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";
import { ReferencesSkeleton } from "./ReferencesSkeleton.js";
import { Sidebar } from "@dependable/components/Sidebar/v0";
import StarFill16Icon from "@dependable/icons/StarFill16Icon";
import { FatalErrorScreen } from "./FatalErrorScreen.js";
import { ErrorBoundary } from "@dependable/components/ErrorBoundary/v0";

const styles = css`
  & {
    --dc-sidebar-width: 300px;
    --dc-sidebar-min-width: 200px;
    --dc-sidebar-max-width: 500px;
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
    margin: var(--dc-spacing-1);
    list-style-type: none;
  }
  & [data-failed] {
    padding: 0 calc(var(--dc-spacing-1) + var(--dc-spacing-4));
    color: var(--dc-color-error-40);
  }
`;

const scrollAreaStyles = css`
  & {
    flex: 1;
  }
`;

class FailedToLoadNotes {
  render() {
    return h("div", { "data-failed": true }, "Loading failed");
  }
}

class Notes {
  render({ title, noteResolver }) {
    const [notes, status] = noteResolver();

    if (status === FAILED) {
      return [h("h2", {}, title), h(FailedToLoadNotes)];
    }

    if (status !== LOADED) {
      return h(ReferencesSkeleton);
    }

    const items = notes.map((note) => h("li", {}, h(NoteReference, { note })));

    return [h("h2", {}, title), h("ul", {}, items)];
  }
}

export class NotesSidebar {
  #onClick = () => {
    this.context.visibleSidebar("");
  };

  render() {
    return h(
      Sidebar,
      {
        "data-layout": "start",
        className: styles,
        onClick: this.#onClick,
        resizable: true,
      },
      h(
        ScrollArea,
        { className: scrollAreaStyles },
        h(
          "nav",
          {},
          h(
            ErrorBoundary,
            {
              name: "NotesSidebar",
              fallback: h(FatalErrorScreen),
              onError: console.error,
            },
            h(Notes, {
              title: ["Starred", h(StarFill16Icon)],
              noteResolver: starredNotes,
            }),
            h(Notes, { title: "All", noteResolver: allNotes }),
          ),
        ),
      ),
    );
  }
}
