import { h } from "@dependable/view";
import { css } from "stylewars";
import { ScrollArea } from "@dependable/components/ScrollArea/v0";

const containerStyles = css`
  & {
    height: 100%;
  }
`;
const usageStyles = css`
  & {
    text-align: center;
    color: var(--dc-color-foreground);
    padding: var(--dc-spacing-5);
  }
  & code {
    display: inline-block;
    padding: 4px 6px;
    margin-inline-start: 1ex;
    background: var(--dc-color-neutral-90);
    font-size: 14px;
  }
`;
const drawingStyles = css`
  & {
    border: thin solid var(--dc-color-neutral-70);
    width: 33vw;
    border-radius: 2vw;
    margin-bottom: 30px;
  }
  @media screen and (max-width: 1200px) {
    & {
      width: 60vw;
    }
  }
`;

export class Usage {
  render() {
    return h(
      ScrollArea,
      { className: containerStyles },
      h(
        "article",
        { className: usageStyles },
        h("img", {
          src: new URL("../images/taking-notes.jpeg", import.meta.url),
          className: drawingStyles,
        }),
        h("p", null, "Find notes by searching", h("code", null, "\u2318k")),
        h(
          "p",
          null,
          "All entered search terms will filter the notes displayed",
        ),
        h(
          "p",
          null,
          "Filter notes by title only prefix search term with a dash",
          h("code", null, "-term"),
        ),
        h(
          "p",
          null,
          "Filter notes by tags only prefix search term with an underscore",
          h("code", null, "_term"),
        ),
      ),
    );
  }
}
