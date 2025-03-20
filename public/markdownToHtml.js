import { marked } from "marked";
import linkifyIt from "marked-linkify-it";
marked.use(linkifyIt);

export const markdownToHtml = marked;
