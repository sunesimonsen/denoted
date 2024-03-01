import { html } from "@dependable/view";
import { computed } from "@dependable/state";
import { route, params, location, Link } from "@dependable/nano-router";
import { css, classes } from "stylewars";
import { Skeleton } from "@dependable/components/Skeleton/v0";

const styles = css`
  & {
    color: var(--dc-color-foreground);
    text-decoration: none;
    padding: 6px 8px;
    border-radius: 4px;
    display: block;
    white-space: nowrap;
  }

  &:hover {
    background: var(--dc-color-neutral-90);
  }

  &:active {
    background: var(--dc-color-neutral-80);
  }

  &:focus-visible {
    outline: var(--dc-focus-ring);
  }
`;

const activeStyles = css`
  & {
    background: var(--dc-color-neutral-90);
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
  constructor() {
    this.setRef = (ref) => {
      this.ref = ref;
    };
  }

  isActive() {
    return route().startsWith("note") && this.props.note.id === params().id;
  }

  didRender() {
    const { state } = location();
    if (this.isActive() && state?.scrollIntoView) {
      this.ref.scrollIntoView(false);
      this.context.router.navigate({ state: {}, replace: true });
    }
  }

  render({ note, children, ...other }) {
    return html`
      <${Link}
        ref=${this.setRef}
        route="note/view"
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
