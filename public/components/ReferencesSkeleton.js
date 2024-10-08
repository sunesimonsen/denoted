import { h } from "@dependable/view";
import { NoteReferenceSkeleton } from "./NoteReference";

export class ReferencesSkeleton {
  render() {
    return h(
      "ul",
      {},
      h("li", {}, h(NoteReferenceSkeleton, { width: "70%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "80%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "70%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "80%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "70%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "80%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "90%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "70%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "90%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "70%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "80%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "90%" })),
      h("li", {}, h(NoteReferenceSkeleton, { width: "70%" })),
    );
  }
}
