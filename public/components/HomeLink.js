import { h } from "@dependable/view";
import { css } from "stylewars";
import { Link } from "@dependable/nano-router";
const logo = new URL(
  "../icons/denoted-icon-transparent-42x42.png",
  import.meta.url,
);
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

  @media screen and (max-width: 1200px) {
    & {
      display: none;
    }
  }
`;
export class HomeLink {
  render() {
    return h(
      Link,
      {
        className: homeStyles,
        route: "home",
      },
      h("img", {
        src: logo,
        className: logoStyles,
      }),
    );
  }
}
