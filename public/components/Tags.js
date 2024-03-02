import { html } from "@dependable/view";
import { Tag } from "@dependable/components/Tag/v0";

export class Tags {
  renderTag(tag) {
    return html`<${Tag}>${tag}<//> `;
  }

  render({ tags }) {
    if (tags.length === 0) {
      return null;
    }

    return html`<div>${tags.map(this.renderTag)}</div>`;
  }
}
