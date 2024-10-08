import { h } from "@dependable/view";
import { Tag } from "@dependable/components/Tag/v0";

export class Tags {
  renderTag(tag) {
    return [h(Tag, null, tag), " "];
  }

  render({ className, tags }) {
    if (tags.length === 0) {
      return null;
    }

    return h("div", { className: className }, tags.map(this.renderTag));
  }
}
