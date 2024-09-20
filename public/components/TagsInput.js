import { html } from "@dependable/view";
import { observable } from "@dependable/state";
import { Tags } from "./Tags.js";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteOption,
  AutocompletePopup,
} from "@dependable/components/Autocomplete/v0";
import { allNoteTags } from "../state.js";
import { FieldLayout } from "@dependable/components/FieldLayout/v0";
import { margin } from "@dependable/components/theming/v0";

export class TagsInput {
  constructor({ id }) {
    this.searchText = observable("", { id: id + "SearchText" });

    this.onSearchTextChange = (e) => {
      this.searchText(e.target.value);
    };

    this.onTagSearchInputClear = () => {
      this.searchText("");
    };

    this.onTagSelect = (e) => {
      const { key } = e.detail;
      const { tags } = this.props;

      let updatedTags;
      if (key === ".add") {
        const searchText = this.searchText().toLowerCase();
        updatedTags = [...tags, searchText].sort();
      } else if (tags.includes(key)) {
        updatedTags = tags.filter((tag) => tag != key);
      } else {
        updatedTags = [...tags, key].sort();
      }

      this.searchText("");
      this.props.onTagsChange(updatedTags);
    };
  }

  renderTagsOptions() {
    const tags = this.searchText()
      ? Array.from(new Set([...allNoteTags(), ...this.props.tags])).sort()
      : this.props.tags;

    const searchText = this.searchText().toLowerCase();

    const options = tags
      .filter((tag) => tag.includes(searchText))
      .slice(0, 6)
      .map(
        (tag) => html`
          <${AutocompleteOption}
            key=${tag}
            value=${tag}
            selected=${this.props.tags.includes(tag)}
          >
            ${tag}
          <//>
        `,
      );

    if (searchText && !tags.includes(searchText)) {
      return [
        ...options,
        html`
          <${AutocompleteOption} key=".add" value=".add">
            Add tag "${searchText}"
          <//>
        `,
      ];
    }

    return options;
  }

  render({ id, className, tags }) {
    return html`
      <${FieldLayout} className=${className} stretched>
        <label for=${id}>Tags</label>
        <${Autocomplete} id=${id} onSelect=${this.onTagSelect}>
          <${AutocompleteInput}
            .value=${this.searchText()}
            onInput=${this.onSearchTextChange}
            onClear=${this.onTagSearchInputClear}
          />
          <${AutocompletePopup}>${this.renderTagsOptions()}<//>
        <//>
        <${Tags} tags=${tags} className=${margin(2, "block-start")} />
      <//>
    `;
  }
}
