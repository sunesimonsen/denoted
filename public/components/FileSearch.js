import { html } from "@dependable/view";
import { MediaInput } from "@dependable/components/MediaInput/v0";
import { ms2, me2 } from "@dependable/components/spacing/v0";
import { searchText } from "../state.js";

import SearchStroke16Icon from "@dependable/icons/SearchStroke16Icon";
import XStroke12Icon from "@dependable/icons/XStroke12Icon";

export class FileSearch {
  constructor() {
    this.onInput = (e) => {
      searchText(e.target.value);
    };

    this.onClear = () => {
      searchText("");
    };
  }

  renderClear() {
    return html`<${XStroke12Icon} className=${ms2} onClick=${this.onClear} />`;
  }

  render() {
    return html`
      <${MediaInput}>
        <${SearchStroke16Icon} className=${me2} />
        <input
          id="fileSearch"
          autocomplete="off"
          type="text"
          .value=${searchText()}
          onInput=${this.onInput}
        />
        ${searchText() && this.renderClear()}
      <//>
    `;
  }
}
