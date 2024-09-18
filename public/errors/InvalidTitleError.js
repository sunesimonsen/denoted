export class InvalidTitleError extends Error {
  constructor(title) {
    super(`Invalid title: "${title}"`);
  }
}
