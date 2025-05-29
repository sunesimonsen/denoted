import { marked } from "marked";
import linkifyIt from "marked-linkify-it";
marked.use(linkifyIt);

const renderer = new marked.Renderer();

renderer.link = ({ href, title, text }) => {
  const target = !href.endsWith(".id") && "_blank";

  const attributes = Object.entries({ href, title, target })
    .filter(([_, value]) => value)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");

  return `<a ${attributes}>${text}</a>`;
};

export const markdownToHtml = (markdown) => marked(markdown, { renderer });
