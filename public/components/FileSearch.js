import { html } from "@dependable/view";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteOption,
  AutocompletePopup,
} from "@dependable/components/Autocomplete/v0";
import { searchText, filteredNotes } from "../state.js";

const onInput = (e) => {
  searchText(e.target.value);
};

const onClear = () => {
  searchText("");
};

export class FileSearch {
  constructor() {
    this.onSelect = (e) => {
      if (e.detail) {
        const { key, value } = e.detail;

        this.context.router.navigate({
          route: "note",
          params: { id: key },
        });

        searchText("");
      } else {
        e.preventDefault();
      }
    };
  }

  renderItems() {
    const [notes] = filteredNotes();

    return notes.map(({ id, title, tags }) => {
      const label = tags.length ? `${title} (${tags.join(",")})` : title;

      return html`
        <${AutocompleteOption} key=${id} value=${title}>${label}<//>
      `;
    });
  }

  render() {
    return html`
      <${Autocomplete} id="default-autocomplete" onSelect=${this.onSelect}>
        <${AutocompleteInput} .value=${searchText()} onInput=${onInput} />
        <${AutocompletePopup}>${this.renderItems()}<//>
      <//>
    `;
  }
}
