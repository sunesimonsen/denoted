import { html } from "@dependable/view";
import { TextInput } from "@dependable/components/TextInput/v0";
import { Validation } from "@dependable/components/Validation/v0";
import { ColumnLayout } from "@dependable/components/ColumnLayout/v0";

export class TitleInput {
  renderValidation() {
    return html`<${Validation} type="error"
      >The title has to be non-empty and only include spaces and letter a-å<//
    >`;
  }

  render({ id, title, invalid, onTitleChange }) {
    return html`
      <${ColumnLayout} justifyItems="start" gap="0.3em" stretched>
        <label for=${id}>Title</label>
        <${TextInput} id=${id} .value=${title} onChange=${onTitleChange} />
        ${invalid && this.renderValidation()}
      <//>
    `;
  }
}
