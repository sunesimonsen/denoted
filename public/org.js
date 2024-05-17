export const orgToHtml = async (content) => {
  const { orgProcessor } = await import("./orgProcessor.js");
  const { value: html } = await orgProcessor.process(content);

  return html;
};
