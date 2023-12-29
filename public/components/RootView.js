import { html } from "@dependable/view";
import { route, queryParams } from "@dependable/nano-router";
import { authorize } from "../auth.js";
import { Home } from "./Home.js";

export class RootView {
  render() {
    authorize(this.context);

    switch (route()) {
      default:
        return html`<${Home} />`;
    }
  }
}
