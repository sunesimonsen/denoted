import { h } from "@dependable/view";
import { Center } from "@dependable/components/Center/v0";
import { sha256 } from "../utils/sha256.js";
import { DefaultLayout } from "./DefaultLayout.js";

export class LoginView {
  async #authorizeWithDropbox() {
    const codeVerifier = (crypto.randomUUID() + crypto.randomUUID()).replaceAll(
      "-",
      "",
    );

    sessionStorage.setItem("dropbox-code-verifier", codeVerifier);

    this.context.router.navigate({
      route: "dropbox/authorize",
      queryParams: {
        client_id: "23m5fpdg74lyhna",
        response_type: "code",
        code_challenge: await sha256(codeVerifier),
        code_challenge_method: "S256",
        redirect_uri: window.location.origin + "/authorized",
      },
    });
  }

  willMount() {
    this.#authorizeWithDropbox();
  }

  render() {
    return h(
      DefaultLayout,
      {},
      h(Center, { stretched: true }, "Authenticating..."),
    );
  }
}
