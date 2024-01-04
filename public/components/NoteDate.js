import { html } from "@dependable/view";
import { css } from "stylewars";
import { Skeleton } from "@dependable/components/Skeleton/v0";

const styles = css`
  & {
    color: var(--dc-text-color-1);
    margin-top: 0.4em;
    padding-bottom: 1.4em;
    margin-bottom: 1.4em;
    border-bottom: thin solid var(--dc-color-neutral-3);
    font-size: 12px;
  }
`;

export class NoteDate {
  render({ note }) {
    const timestamp = new Date(
      Date.UTC(
        note.year,
        note.month,
        note.day,
        note.hours,
        note.minutes,
        note.seconds,
      ),
    ).toISOString();

    return html`<div className=${styles}>${timestamp}</div>`;
  }
}
