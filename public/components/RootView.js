import { h } from "@dependable/view";
import { Home } from "./Home.js";
import { route } from "@dependable/nano-router";
import { AuthorizedView } from "./AuthorizedView.js";
import { AuthorizeView } from "./AuthorizeView.js";

export class RootView {
  render() {
    switch (route()) {
      case "authorize":
        return h(AuthorizeView);
      case "authorized":
        return h(AuthorizedView);
      default:
        return h(Home);
    }
  }
}
