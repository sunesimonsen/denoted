import { h } from "@dependable/view";
import { TextInput } from "@dependable/components/TextInput/v0";
import { Validation } from "@dependable/components/Validation/v0";
import { FieldLayout } from "@dependable/components/FieldLayout/v0";

export class TitleInput {
  renderValidation() {
    return [
      h(
        Validation,
        { type: "error" },
        "The title has to be non-empty and only include spaces and letter a-\xE5",
      ),
      " ",
    ];
  }

  render({ id, title, invalid, onTitleChange }) {
    return h(
      FieldLayout,
      { stretched: true },
      h("label", { for: id }, "Title"),
      h(TextInput, {
        id: id,
        ".value": title,
        onChange: onTitleChange,
        validation: invalid && "error",
      }),
      invalid && this.renderValidation(),
    );
  }
}
