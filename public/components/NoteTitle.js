import { html } from "@dependable/view";
import { css } from "stylewars";
import { Skeleton } from "@dependable/components/Skeleton/v0";

const styles = css`
  & {
    font-weight: normal;
    font-size: 24px;
    margin: 0;
    margin-bottom: 4px;
  }
`;

const skeletonStyles = css`
  & {
    width: 200px;
  }
`;

export class NoteTitle {
  render({ children }) {
    return html`<h1 className=${styles}>${children}</h1>`;
  }
}

export class NoteTitleSkeleton {
  render({ children }) {
    return html`<${NoteTitle}><${Skeleton} className=${skeletonStyles}/></h1>`;
  }
}
