import { html } from "@dependable/view";
import { css } from "stylewars";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";

const styles = css`
  & {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;

    width: 100%;
    height: 100%;
  }
`;

export class DefaultLayout {
  render({ children }) {
    return html`<${BorderLayout} className=${styles} stretched>${children}<//>`;
  }
}
