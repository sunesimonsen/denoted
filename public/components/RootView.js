import { h } from "@dependable/view";
import { Home } from "./Home.js";
import { route } from "@dependable/nano-router";
import { AuthorizedView } from "./AuthorizedView.js";
import { LoginView } from "./LoginView.js";

export class RootView {
  render() {
    if (route() === "authorized") {
      return h(AuthorizedView);
    }

    if (route() === "login" || !this.context.api.isAuthenticated()) {
      return h(LoginView);
    }

    return h(Home);
  }
}
