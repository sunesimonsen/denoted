import { foldGutter, toggleFold, bracketMatching } from "@codemirror/language";
import { defaultKeymap } from "@codemirror/commands";
import { EditorView, highlightActiveLine, keymap } from "@codemirror/view";
import { cleanup } from "@orgajs/editor/extensions";
import { org } from "@orgajs/cm-lang";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@orgajs/cm-lang";
import { Compartment, EditorState } from "@codemirror/state";

const baseTheme = EditorView.baseTheme({
  "&": {
    height: "100%",
  },
  ".cm-content": {
    padding: "60px calc(30vw - 300px)",
  },
  ".cm-link": {
    cursor: "pointer",
  },
  ".cm-org-todo": {
    color: "red",
  },
  ".cm-org-done": {
    color: "green",
  },
  ".cm-gutters": {
    minWidth: "1rem",
  },
});

const baseStyle = HighlightStyle.define([
  { tag: t.heading1, fontWeight: "bold", fontSize: "1.6em" },
  { tag: t.heading2, fontWeight: "bold", fontSize: "1.4em" },
  { tag: t.heading3, fontWeight: "bold", fontSize: "1.2em" },
  { tag: t.heading4, fontWeight: "bold" },
  { tag: t.heading5, fontWeight: "bold" },
  { tag: t.heading6, fontWeight: "bold" },
  { tag: t.keyword, fontWeight: "bold" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  {
    tag: t.monospace,
    borderRadius: "4px",
    padding: "1px 4px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.underline, textDecoration: "underline" },
  { tag: t.keyword, color: "#e45649" },
  { tag: t.comment, color: "#9ca0a4" },
  { tag: t.processingInstruction, color: "#9ca0a4" },
  { tag: t.attributeName, color: "#9ca0a4" },
]);

const theme = [baseTheme, syntaxHighlighting(baseStyle)];

const keys = [
  {
    key: "Tab",
    run: toggleFold,
  },
];

export function makeEditor(config) {
  const themeConfig = new Compartment();

  const {
    target,
    content = "",
    extensions = [],
    dark = false,
    onChange,
  } = config;

  const state = EditorState.create({
    doc: content,
    extensions: [
      org(),
      keymap.of([...defaultKeymap]),
      highlightActiveLine(),
      EditorView.lineWrapping,
      bracketMatching(),
      foldGutter(),
      keymap.of([...defaultKeymap, ...keys]),
      theme,
      cleanup,
      extensions,
    ],
  });

  const editor = new EditorView({
    state,
    parent: target,
    dispatch: (tr) => {
      editor.update([tr]);
      tr.docChanged && onChange && onChange(editor.state);
    },
  });

  return { editor };
}
