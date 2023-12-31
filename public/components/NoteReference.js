import { html } from "@dependable/view";
import { computed } from "@dependable/state";
import { route, params, Link } from "@dependable/nano-router";
import { css, classes } from "stylewars";
import { Skeleton } from "@dependable/components/Skeleton/v0";

const styles = css`
  & {
    color: var(--dc-text-color-0);
    text-decoration: none;
    padding: 6px 8px;
    border-radius: 4px;
    display: block;
    white-space: nowrap;
  }

  &:hover {
    background: var(--dc-color-neutral-2);
  }

  &:active {
    background: var(--dc-color-neutral-3);
  }

  &:focus-visible {
    outline: var(--dc-focus-ring);
  }
`;

const activeStyles = css`
  & {
    background: var(--dc-color-neutral-2);
  }
`;

export class NoteReferenceSkeleton {
  render({ width }) {
    return html`
      <span className=${styles} style=${{ width }}>
        <${Skeleton} />
      </span>
    `;
  }
}

export class NoteReference {
  isActive() {
    return route() === "note" && this.props.note.id === params().id;
  }

  render({ note, children, ...other }) {
    return html`
      <${Link}
        route="note"
        params=${{ id: note.id }}
        hash=""
        className=${classes(styles, this.isActive() && activeStyles)}
        ...${other}
      >
        ${note.title}
      <//>
    `;
  }
}
