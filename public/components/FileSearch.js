import { html } from "@dependable/view";
import { SearchInput } from "@dependable/components/SearchInput/v0";
import { searchText } from "../state.js";

const onInput = (e) => {
  searchText(e.target.value);
};

const onClear = () => {
  searchText("");
};

export class FileSearch {
  render() {
    return html`
      <${SearchInput}
        .value=${searchText()}
        onInput=${onInput}
        onClear=${onClear}
      />
    `;
  }
}
