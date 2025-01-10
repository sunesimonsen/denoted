export class FakeSessionStorage {
  #data = new Map();

  setItem(key, value) {
    this.#data.set(key, value);
  }

  removeItem(key) {
    this.#data.delete(key);
  }

  getItem(key) {
    return this.#data.get(key);
  }
}
