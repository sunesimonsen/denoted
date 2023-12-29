import { html } from "@dependable/view";
import { MediaInput } from "@dependable/components/MediaInput/v0";
import { me2, ms2 } from "@dependable/components/spacing/v0";
import { searchText } from "../state.js";

import SearchStroke16Icon from "@dependable/icons/SearchStroke16Icon";

export class FileSearch {
  constructor() {
    this.onInput = (e) => {
      searchText(e.target.value);
    };
  }
  render() {
    return html`
      <${MediaInput}>
        <input
          id="fileSearch"
          autocomplete="off"
          type="text"
          .value=${searchText()}
          onInput=${this.onInput}
        />
        <${SearchStroke16Icon} className=${ms2} />
      <//>
    `;
  }
}
