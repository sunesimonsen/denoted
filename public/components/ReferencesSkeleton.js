import { h } from "@dependable/view";

import { NoteReferenceSkeleton } from "./NoteReference";
export class ReferencesSkeleton {
  render() {
    return h("ul", null, h("li", null, h(NoteReferenceSkeleton, {
      width: "70%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "80%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "70%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "80%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "70%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "80%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "90%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "70%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "90%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "70%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "80%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "90%"
    })), h("li", null, h(NoteReferenceSkeleton, {
      width: "70%"
    })));
  }
}