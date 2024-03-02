import { html } from "@dependable/view";
import { css } from "stylewars";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { NoteDate } from "./NoteDate.js";
import { Tags } from "./Tags.js";

const styles = css`
  & {
    display: flex;
    flex-direction: column;
    gap: var(--dc-spacing-2);
  }

  & h1 {
    font-weight: normal;
    margin: 0;
  }
`;

export class NoteMetadataSkeleton {
  render() {
    return html`
      <div className=${styles}>
        <h1 style="width: 230px"><${Skeleton} /></h1>
        <div style="width: 130px"><${Skeleton} /></div>
      </div>
    `;
  }
}

export class NoteMetadata {
  render({ title, date, tags }) {
    return html`
      <header className=${styles}>
        <h1>${title}</h1>
        <${NoteDate} date=${date} />
        <${Tags} tags=${tags} />
      </header>
    `;
  }
}
