import { html } from "@dependable/view";
import { css } from "stylewars";
import { Link } from "@dependable/nano-router";

const logo = new URL("../icons/denoted-icon-114x114.png", import.meta.url);

const logoStyles = css`
  & {
    height: 42px;
    border-radius: 6px;
  }
`;

const homeStyles = css`
  & {
    text-decoration: none;
  }
`;

export class HomeLink {
  render() {
    return html`
      <${Link} className=${homeStyles} route="home">
        <img src=${logo} className=${logoStyles} />
      <//>
    `;
  }
}
