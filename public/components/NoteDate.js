import { html } from "@dependable/view";
import { css } from "stylewars";
import { Skeleton } from "@dependable/components/Skeleton/v0";

const styles = css`
  & {
    color: var(--dc-text-color-1);
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

    return html`<span className=${styles}>${timestamp}</span>`;
  }
}

export class NoteDateSkeleton {
  render() {
    return html`<span className=${styles}><${Skeleton} /></span>`;
  }
}
