import { h } from "@dependable/view";
import { css } from "stylewars";
import { Center } from "@dependable/components/Center/v0";
import { ColumnLayout } from "@dependable/components/ColumnLayout/v0";

const styles = css`
  & h1 {
    margin: 0;
    font-size: small;
  }
  & p {
    margin: 0;
    font-size: small;
  }
`;

export class FatalErrorScreen {
  render() {
    return h(
      Center,
      { stretched: true, className: styles },
      h(
        ColumnLayout,
        {},
        h("h1", {}, "Something didn't work"),
        h("p", {}, "Give it a moment and try again."),
      ),
    );
  }
}
