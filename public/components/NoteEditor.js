import { h } from "@dependable/view";
import { css } from "stylewars";
import { moduleCache, notesCache, noteDirtyState } from "../state.js";
import { LOADED } from "@dependable/cache";
import { Skeleton } from "@dependable/components/Skeleton/v0";
import { BorderLayout } from "@dependable/components/BorderLayout/v0";
import { NoteEditorHeader } from "./NoteEditorHeader.js";
import { NoteEditorFooter } from "./NoteEditorFooter.js";

const skeletonStyles = css`
  & {
    padding: 30px 60px;
  }
`;

class NotePreviewSkeleton {
  render() {
    return h(
      "div",
      { className: skeletonStyles },
      h("h2", {}, h(Skeleton)),
      h("p", {}, h(Skeleton), h(Skeleton), h(Skeleton)),
      h("h2", {}, h(Skeleton)),
      h(
        "p",
        {},
        h(Skeleton),
        h(Skeleton),
        h(Skeleton),
        h(Skeleton),
        h(Skeleton),
      ),
    );
  }
}

export class NoteEditor {
  #setRef = (ref) => {
    this.ref = ref;
  };

  #onChange = (state) => {
    noteDirtyState.content(state.doc.toString());
  };

  #prepareEditor(id) {
    if (this.id === id) return;

    const [editorModule, moduleStatus, moduleError] =
      moduleCache.byId("editor");
    const [note, noteStatus, noteError] = notesCache.byId(id);

    if (moduleError) throw moduleError;
    if (noteError) throw noteError;
    if (moduleStatus !== LOADED) return;
    if (noteStatus !== LOADED) return;

    if (this.editor) {
      this.editor.destroy();
    }

    noteDirtyState.id = note.id;
    noteDirtyState.rev = note.rev;
    noteDirtyState.title(note.title);
    noteDirtyState.content(note.content);
    noteDirtyState.tags(note.tags);

    const { makeEditor } = editorModule;
    const { editor } = makeEditor({
      target: this.ref,
      content: note.content,
      onChange: this.#onChange,
    });

    this.editor = editor;
    this.id = note.id;
    editor.focus();
  }

  isLoading() {
    const moduleStatus = moduleCache.statusById("editor");
    const noteStatus = notesCache.statusById(this.props.id);

    return moduleStatus !== LOADED || noteStatus !== LOADED;
  }

  didRender() {
    this.context.api.loadNote(this.props.id);
    this.context.api.loadEditor();
    this.#prepareEditor(this.props.id);
  }

  render({ id }) {
    return h(
      BorderLayout,
      { stretched: true },
      h(NoteEditorHeader, { id }),
      this.isLoading() && h(NotePreviewSkeleton),
      h("div", {
        ref: this.#setRef,
        "data-layout": "main",
        style: "overflow: hidden",
      }),
      h(NoteEditorFooter),
    );
  }
}
