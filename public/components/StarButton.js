import { html } from "@dependable/view";
import { IconButton } from "@dependable/components/IconButton/v0";
import StarFill16Icon from "@dependable/icons/StarFill16Icon";
import StarStroke16Icon from "@dependable/icons/StarStroke16Icon";
import { noteDirtyState, toggleStarred, isStarred } from "../state";
import { computed } from "@dependable/state";

export class StarButton {
  renderIcon() {
    return isStarred()
      ? html`<${StarFill16Icon} />`
      : html`<${StarStroke16Icon} />`;
  }

  render() {
    console.log();
    return html`
      <${IconButton} basic pill onClick=${toggleStarred}>
        ${this.renderIcon()}
      <//>
    `;
  }
}
