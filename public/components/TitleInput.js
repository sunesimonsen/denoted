import { html } from "@dependable/view";
import { TextInput } from "@dependable/components/TextInput/v0";
import { margin } from "@dependable/components/theming/v0";

export class TitleInput {
  render({ id, title, onTitleChange }) {
    return html`
      <div>
        <label for=${id}>Title</label>
        <${TextInput}
          id=${id}
          .value=${title}
          onChange=${onTitleChange}
          className=${margin(1, "block-start")}
        />
      </div>
    `;
  }
}
