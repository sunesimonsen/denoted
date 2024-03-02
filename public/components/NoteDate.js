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
  render({ date }) {
    const timestamp = new Date(
      Date.UTC(
        date.year,
        date.month,
        date.day,
        date.hours,
        date.minutes,
        date.seconds,
      ),
    ).toISOString();

    return html`<div className=${styles}>${timestamp}</div>`;
  }
}
