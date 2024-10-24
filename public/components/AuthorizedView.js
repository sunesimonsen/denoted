import { h } from "@dependable/view";
import { Center } from "@dependable/components/Center/v0";
import { queryParams } from "@dependable/nano-router";
import { DefaultLayout } from "./DefaultLayout";

export class AuthorizedView {
  async #recieveDropboxToken() {
    const codeVerifier = sessionStorage.getItem("dropbox-code-verifier");

    sessionStorage.removeItem("dropbox-code-verifier");

    const { code } = queryParams();

    this.context.api.tradeCodeForAccessToken(code, codeVerifier);
  }

  willMount() {
    this.#recieveDropboxToken();
  }

  render() {
    return h(
      DefaultLayout,
      {},
      h(Center, { stretched: true }, "Redirecting..."),
    );
  }
}
