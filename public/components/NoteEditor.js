import { html } from "@dependable/view";
import { css } from "stylewars";
import { notesCache, noteDirtyState } from "../state.js";
import { LOADED, FAILED } from "@dependable/cache";
import { params } from "@dependable/nano-router";
import { makeEditor } from "../editor";
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
  }

  didRender() {
    const { id } = params();

    const [note, status] = notesCache.byId(id);

    if (status === LOADED && id !== this.id) {
      if (this.editor) {
        this.editor.destroy();
      }

      noteDirtyState.id = note.id;
      noteDirtyState.rev = note.rev;
      noteDirtyState.title(note.title);
      noteDirtyState.content(note.content);
      noteDirtyState.tags(note.tags);

      const { editor, setTheme } = makeEditor({
        target: this.ref,
        content: note.content,
        onChange: this.onChange,
      });

      editor.focus();
      this.editor = editor;

      this.id = id;
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
        ${status !== LOADED && html`<${NotePreviewSkeleton} />`}
        <div ref=${this.setRef} data-layout="main" style="overflow: hidden" />
        <${NoteEditorFooter} />
      <//>
    `;
  }
}
