import { reorg } from "@orgajs/reorg";
import mutate from "@orgajs/reorg-rehype";
import html from "rehype-stringify";
import { visit } from "unist-util-visit";
import { timestampToNote } from "./state.js";

const resolveDenoteLinks = () => (tree) =>
  visit(tree, "link", (node) => {
    if (node.path.protocol === "denote") {
      node.path.protocol = "https";

      const note = timestampToNote(node.path.value);

      if (note) {
        node.path.value = "/note/" + note.id;
      }
    }
  });

const isExternalAnchor = (node) =>
  node.tagName === "a" && node.properties.href.startsWith("https://");

const addTargetBlankToExternalLinks = () => (tree) =>
  visit(tree, isExternalAnchor, (node) => {
    node.properties.target = "_blank";
    node.properties.rel = "noopener noreferrer";
  });

const urlRegex = /(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#=.\/\-?_]+)/gi;

const isUrlText = (node) => node.type === "text" && node.value.match(urlRegex);

const autoLink = () => (tree) =>
  visit(tree, isUrlText, (node, index, parent) => {
    parent.children[index] = {
      tagName: "a",
      type: "element",
      properties: {
        href: node.value,
      },
      children: [node],
    };
    return "skip";
  });

const isHeading = (node) => node.tagName?.match(/h\d/);

const incrementHeaderLevels = () => (tree) => {
  return visit(tree, isHeading, (node) => {
    node.tagName = node.tagName.replace(/\d/, (v) => parseInt(v) + 1);
    return "skip";
  });
};

export const orgProcessor = reorg()
  .use(resolveDenoteLinks)
  .use(mutate)
  .use(autoLink)
  .use(addTargetBlankToExternalLinks)
  .use(incrementHeaderLevels)
  .use(html);
