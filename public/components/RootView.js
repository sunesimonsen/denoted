import { html } from "@dependable/view";
import { route, queryParams } from "@dependable/nano-router";
import { Home } from "./Home.js";

export class RootView {
  willMount() {
    this.context.api.authenticate();
  }

  render() {
    switch (route()) {
      default:
        return html`<${Home} />`;
    }
  }
}
