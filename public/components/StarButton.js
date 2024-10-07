import { h } from "@dependable/view";
import { css } from "stylewars";
import { IconButton } from "@dependable/components/IconButton/v0";
import StarFill16Icon from "@dependable/icons/StarFill16Icon";
import StarStroke16Icon from "@dependable/icons/StarStroke16Icon";
import { toggleStarred, isStarred } from "../state";
const iconStyles = css`
  & {
    color: var(--dc-color-warning-50);
  }
`;
export class StarButton {
  renderIcon() {
    return isStarred()
      ? h(StarFill16Icon, {
          className: iconStyles,
        })
      : h(StarStroke16Icon, null);
  }
  render() {
    console.log();
    return h(
      IconButton,
      {
        basic: true,
        pill: true,
        onClick: toggleStarred,
      },
      this.renderIcon(),
    );
  }
}
