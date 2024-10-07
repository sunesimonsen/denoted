import { h } from "@dependable/view";

import { css } from "stylewars";

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
    return h(
      "div",
      {
        className: styles,
      },
      timestamp,
    );
  }
}
