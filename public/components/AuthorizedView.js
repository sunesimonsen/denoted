import { h } from "@dependable/view";
import { Center } from "@dependable/components/Center/v0";
import { queryParams } from "@dependable/nano-router";
import { DefaultLayout } from "./DefaultLayout";

export class AuthorizedView {
  async #receiveDropboxToken() {
    const { code } = queryParams();

    this.context.api.dropbox.tradeCodeForAccessToken(code);
  }

  willMount() {
    this.#receiveDropboxToken();
  }

  render() {
    return h(
      DefaultLayout,
      {},
      h(Center, { stretched: true }, "Redirecting..."),
    );
  }
}
