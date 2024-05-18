import { html } from "@dependable/view";
import { observable, computed } from "@dependable/state";
import { css } from "stylewars";
import { notesCache, noteDirtyState } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";
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
    return html`
      <div className=${skeletonStyles}>
        <h2>
          <${Skeleton} />
        </h2>
        <p>
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
        </p>
        <h2>
          <${Skeleton} />
        </h2>
        <p>
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
          <${Skeleton} />
        </p>
      </div>
    `;
  }
}

export class NoteEditor {
  constructor() {
    this.setRef = (ref) => {
      this.ref = ref;
    };

    this.onChange = (state) => {
      noteDirtyState.content(state.doc.toString());
    };

    this.editorLoaded = observable(false);

    this.loadEditor = async (note) => {
      if (note.id !== this.id) {
        this.editorLoaded(false);
        if (this.editor) {
          this.editor.destroy();
        }

        const { makeEditor } = await import("../editor.js");

        const { editor, setTheme } = makeEditor({
          target: this.ref,
          content: note.content,
          onChange: this.onChange,
        });

        this.editorLoaded(true);
        this.editor = editor;
        this.id = note.id;

        editor.focus();
      }
    };

    this.initializeDirtyState = (note) => {
      if (noteDirtyState.id !== note.id) {
        noteDirtyState.id = note.id;
        noteDirtyState.rev = note.rev;
        noteDirtyState.title(note.title);
        noteDirtyState.content(note.content);
        noteDirtyState.tags(note.tags);
      }
    };

    this.isLoading = computed(() => {
      const { id } = params();
      const [_, status] = notesCache.byId(id);
      return !this.editorLoaded() && status !== LOADED;
    });
  }

  didRender() {
    const { id } = params();
    const [note, status] = notesCache.byId(id);

    if (status === LOADED) {
      this.initializeDirtyState(note);
      this.loadEditor(note);
    }
  }

  render() {
    const [note, status, error] = notesCache.byId(params().id);

    if (status === FAILED) {
      return html`Failed`;
    }

    return html`
      <${BorderLayout} stretched>
        <${NoteEditorHeader} />
        ${this.isLoading() && html`<${NotePreviewSkeleton} />`}
        <div ref=${this.setRef} data-layout="main" style="overflow: hidden" />
        <${NoteEditorFooter} />
      <//>
    `;
  }
}
