import { h } from "@dependable/view";
import { Center } from "@dependable/components/Center/v0";
import { DefaultLayout } from "./DefaultLayout.js";

export class LoginView {
  willMount() {
    this.context.api.dropbox.authenticate();
  }

  render() {
    return h(
      DefaultLayout,
      {},
      h(Center, { stretched: true }, "Authenticating..."),
    );
  }
}
