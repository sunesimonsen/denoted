import { html } from "@dependable/view";
import { css, classes } from "stylewars";

const styles = css`
  & {
    position: relative;
    background: var(--dc-color-background);
    border: thin solid var(--dc-color-neutral-80);
    margin: 30px auto;
    width: 800px;
    padding: 40px 60px;
    min-height: 1200px;
    overflow-x: hidden;
    overflow-wrap: break-word;
  }

  @media screen and (max-width: 1200px) {
    & {
      width: 70%;
    }
  }

  @media screen and (max-width: 100px) {
    & {
      width: 70%;
    }
  }

  & a {
    text-decoration: none;
    color: var(--dc-color-primary-50);
  }

  & a:focus,
  & a:hover {
    outline: none;
    text-decoration: underline;
    color: var(--dc-color-primary-40);
  }

  & a:active {
    text-decoration: underline;
    color: var(--dc-color-primary-30);
  }

  & hr {
    border: none;
    border-bottom: thin solid var(--dc-color-neutral-80);
    margin: 20px 0;
  }

  & h1,
  & h2,
  & h3 {
    font-weight: normal;
    margin: 0;
  }

  & h1 {
    font-size: 2em;
    margin-bottom: 0.2em;
  }

  & h2 {
    font-size: 1.4em;
    margin-bottom: 0.4em;
  }

  & h3 {
    font-size: 1.2em;
    margin-bottom: 0.2em;
  }

  & p {
    margin: 0.5em 0;
  }
`;

export class Paper {
  render({ children, className }) {
    return html`<div className=${classes(styles, className)}>${children}</div>`;
  }
}
