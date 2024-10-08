export class Keyboard {
  didMount() {
    document.body.addEventListener("keydown", (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        const input = document.getElementById("file-search");

        input.value = "";
        input.focus();
        e.preventDefault();
      }
    });
  }

  render({ children }) {
    return children;
  }
}
