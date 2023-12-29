import { html } from "@dependable/view";
import { NoteReferenceSkeleton } from "./NoteReference";

export class ReferencesSkeleton {
  render() {
    return html`
      <ul>
        <li><${NoteReferenceSkeleton} width="70%" /></li>
        <li><${NoteReferenceSkeleton} width="80%" /></li>
        <li><${NoteReferenceSkeleton} width="70%" /></li>
        <li><${NoteReferenceSkeleton} width="80%" /></li>
        <li><${NoteReferenceSkeleton} width="70%" /></li>
        <li><${NoteReferenceSkeleton} width="80%" /></li>
        <li><${NoteReferenceSkeleton} width="90%" /></li>
        <li><${NoteReferenceSkeleton} width="70%" /></li>
        <li><${NoteReferenceSkeleton} width="90%" /></li>
        <li><${NoteReferenceSkeleton} width="70%" /></li>
        <li><${NoteReferenceSkeleton} width="80%" /></li>
        <li><${NoteReferenceSkeleton} width="90%" /></li>
        <li><${NoteReferenceSkeleton} width="70%" /></li>
      </ul>
    `;
  }
}
