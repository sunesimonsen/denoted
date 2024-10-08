import { h } from "@dependable/view";
import { css } from "stylewars";
import { SidebarLayout } from "@dependable/components/Sidebar/v0";

const styles = css`
  & {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    --dc-sidebar-initial-display: flex;
  }
  @media screen and (max-width: 1200px) {
    & {
      --dc-sidebar-display: none;
      --dc-sidebar-toggle-display: inline-flex;
    }
  }
`;

export class DefaultLayout {
  render({ children }) {
    return h(SidebarLayout, { className: styles }, children);
  }
}
