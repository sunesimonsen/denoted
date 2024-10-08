import { h } from "@dependable/view";
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
    return h(
      "div",
      { className: styles },
      h("h1", { style: "width: 230px" }, h(Skeleton)),
      h("div", { style: "width: 130px" }, h(Skeleton)),
    );
  }
}

export class NoteMetadata {
  render({ title, date, tags }) {
    return h(
      "header",
      { className: styles },
      h("h1", {}, title),
      h(NoteDate, { date: date }),
      h(Tags, { tags: tags }),
    );
  }
}
