import { h } from "@dependable/view";
import { css } from "stylewars";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteOption,
  AutocompletePopup,
} from "@dependable/components/Autocomplete/v0";
import { route } from "@dependable/nano-router";
import { searchText, searchResults } from "../state.js";
import { Tags } from "./Tags.js";

const popStyles = css`
  & {
    width: 60vw;
  }
  @media screen and (max-width: 900px) {
    & {
      margin-top: 2px;
      width: 80vw;
    }
  }
`;
const onInput = (e) => {
  searchText(e.target.value);
};
const onClear = () => {
  searchText("");
};

const timestampStyles = css`
  & {
    color: var(--dc-text-color-1);
    font-size: 12px;
  }
`;

const comletionLabelStyles = css`
  & {
    display: flex;
    gap: var(--dc-spacing-2);
  }
`;

class CompletionLabel {
  render({ title, tags, timestamp }) {
    return h("div", { className: comletionLabelStyles }, [
      title,
      h(Tags, { tags }),
      h("span", { className: timestampStyles }, timestamp),
    ]);
  }
}

export class FileSearch {
  #onFocus = () => {
    this.context.visibleSidebar("");
  };

  #onSelectItem = (e) => {
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

  renderItems() {
    const [notes] = searchResults();

    return notes.map((match) => {
      const { type, data } = match;

      if (type === "note") {
        const { id, title, tags, timestamp } = data;

        return h(
          AutocompleteOption,
          { key: id, value: match },
          h(CompletionLabel, { title, tags, timestamp }),
        );
      } else {
        const { id, tag } = data;

        return h(AutocompleteOption, { key: id, value: match }, "tag: ", tag);
      }
    });
  }

  render() {
    return h(
      Autocomplete,
      {
        id: "file-search",
        onSelectItem: this.#onSelectItem,
        placement: "bottom",
      },
      h(AutocompleteInput, {
        ".value": searchText(),
        onInput: onInput,
        onFocus: this.#onFocus,
        autofocus: route() === "home",
        onClear: onClear,
      }),
      h(AutocompletePopup, { className: popStyles }, this.renderItems()),
    );
  }
}
