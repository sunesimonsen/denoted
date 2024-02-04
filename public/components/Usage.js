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
    color: var(--dc-text-color-1);
  }

  & code {
    display: inline-block;
    padding: 4px 6px;
    margin-inline-start: 1ex;
    background: var(--dc-color-neutral-2);
    font-size: 14px;
  }
`;

export class Usage {
  render() {
    return html`<${Center} className=${containerStyles}>
      <article className=${usageStyles}>
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
