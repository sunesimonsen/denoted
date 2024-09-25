import { html } from "@dependable/view";
import { css } from "stylewars";
import { Center } from "@dependable/components/Center/v0";

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
    width: 40vw;
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
    return html`<${Center} className=${containerStyles}>
      <article className=${usageStyles}>
        <img
          src=${new URL("../images/frontpage-drawing.jpg", import.meta.url)}
          className=${drawingStyles}
        />
        <p>Find notes by searching<code>⌘k</code></p>
        <p>All entered search terms will filter the notes displayed</p>
        <p>
          Filter notes by title only prefix search term with a dash
          <code>-term</code>
        </p>
        <p>
          Filter notes by tags only prefix search term with an underscore
          <code>_term</code>
        </p>
      </article>
    <//>`;
  }
}
