import { html } from "@dependable/view";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteOption,
  AutocompletePopup,
} from "@dependable/components/Autocomplete/v0";
import { route } from "@dependable/nano-router";
import { searchText, searchResults } from "../state.js";

const onInput = (e) => {
  searchText(e.target.value);
};

const onClear = () => {
  searchText("");
};

export class FileSearch {
  constructor() {
    this.onFocus = () => {
      this.context.visibleSidebar("");
    };

    this.onSelect = (e) => {
      if (e.detail) {
        const { value } = e.detail;

        if (value.type === "note") {
          this.context.router.navigate({
            route: "note/view",
            params: { id: value.data.id },
            state: { scrollIntoView: true },
          });

          searchText("");
        } else if (value.type === "tag") {
          searchText(
            searchText().replace(/_[^_ ]*$/, "_" + value.data.tag + " "),
          );

          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    };
  }

  renderItems() {
    const [notes] = searchResults();

    return notes.map((match) => {
      const { type, data } = match;

      if (type === "note") {
        const { id, title, tags } = data;
        const label = tags.length ? `${title} (${tags.join(",")})` : title;

        return html`
          <${AutocompleteOption} key=${id} value=${match}>${label}<//>
        `;
      } else {
        const { id, tag } = data;

        return html`
          <${AutocompleteOption} key=${id} value=${match}>tag: ${tag}<//>
        `;
      }
    });
  }

  render() {
    return html`
      <${Autocomplete} id="file-search" onSelect=${this.onSelect}>
        <${AutocompleteInput}
          .value=${searchText()}
          onInput=${onInput}
          onFocus=${this.onFocus}
          autofocus=${route() === "home"}
          onClear=${onClear}
        />
        <${AutocompletePopup}>${this.renderItems()}<//>
      <//>
    `;
  }
}
