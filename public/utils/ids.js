const removeInvalidChars = (text) => text.replace(/[^-0-9a-zæøå]/gi, "");

export const idFrom = ({ timestamp, title, tags }) => {
  const escapedTitle = title
    .toLowerCase()
    .split(" ")
    .map(removeInvalidChars)
    .join("-");

  const escapedTags = tags
    .map((tag) => removeInvalidChars(tag.toLowerCase()))
    .filter(Boolean)
    .join("_");

  return (
    [`${timestamp}--${escapedTitle}`, escapedTags].filter(Boolean).join("__") +
    ".md"
  );
};
