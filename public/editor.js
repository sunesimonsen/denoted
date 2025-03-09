import {
  foldGutter,
  bracketMatching,
  defaultHighlightStyle,
} from "@codemirror/language";
import { defaultKeymap } from "@codemirror/commands";
import { EditorView, highlightActiveLine, keymap } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorState } from "@codemirror/state";

const baseTheme = EditorView.baseTheme({
  "&": {
    height: "100%",
  },
  ".cm-content": {
    padding: "30px 60px",
    maxWidth: "1000px",
  },
  ".cm-link": {
    cursor: "pointer",
  },
  ".cm-gutters": {
    minWidth: "1rem",
  },
});

const baseStyle = HighlightStyle.define([
  {
    tag: t.heading1,
    fontWeight: "bold",
    textDecoration: "none",
    fontSize: "1.6em",
  },
  {
    tag: t.heading2,
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.4em",
  },
  {
    tag: t.heading3,
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.2em",
  },
  { tag: t.heading4, textDecoration: "none", fontWeight: "bold" },
  { tag: t.heading5, textDecoration: "none", fontWeight: "bold" },
  { tag: t.heading6, textDecoration: "none", fontWeight: "bold" },
  { tag: t.keyword, fontWeight: "bold" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  {
    tag: t.monospace,
    borderRadius: "4px",
    padding: "1px 4px",
    fontFamily: "'JetBrains Mono', monospace",
  },
]);

const theme = [
  baseTheme,
  syntaxHighlighting(baseStyle),
  syntaxHighlighting(defaultHighlightStyle),
];

export function makeEditor(config) {
  const { target, content = "", extensions = [], onChange } = config;

  const state = EditorState.create({
    doc: "",
    extensions: [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      keymap.of([...defaultKeymap]),
      highlightActiveLine(),
      EditorView.lineWrapping,
      bracketMatching(),
      foldGutter(),
      theme,
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

  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: content },
  });

  return { editor };
}
