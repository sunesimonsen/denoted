import { queryParams } from "@dependable/nano-router";

let token = null;

const host =
  process.env.NODE_ENV === "production"
    ? "https://denoted.surge.sh"
    : "http://localhost:5000";

async function sha256(text) {
  const msgUint8 = new TextEncoder().encode(text); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  const base64UriEncoded = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64UriEncoded;
}

export const reauthorize = () => {
  token = null;
  sessionStorage.removeItem("dropbox-token");
  authorize();
};

const tradeCodeForAccessToken = async (code, codeVerifier) => {
  const body = Object.entries({
    client_id: "23m5fpdg74lyhna",
    redirect_uri: host + "/authorized",
    code,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  })
    .map(
      ([name, value]) =>
        encodeURIComponent(name) + "=" + encodeURIComponent(value),
    )
    .join("&");

  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  });

  if (response.ok) {
    const { access_token } = await response.json();

    return access_token;
  } else {
    throw new Error("Extracting access token failed");
  }
};

export const authorize = async (context) => {
  if (!token) {
    token = sessionStorage.getItem("dropbox-token");
  }

  const { code } = queryParams();

  if (!token) {
    if (code) {
      const codeVerifier = sessionStorage.getItem("dropbox-code_verifier");
      sessionStorage.removeItem("dropbox-code_verifier");

      token = await tradeCodeForAccessToken(code, codeVerifier);

      context.router.navigate({
        route: "home",
        queryParams: {},
        hash: "",
        replace: true,
      });
    } else {
      const codeVerifier = (
        crypto.randomUUID() + crypto.randomUUID()
      ).replaceAll("-", "");

      sessionStorage.setItem("dropbox-code_verifier", codeVerifier);

      context.router.navigate({
        route: "authorize",
        queryParams: {
          client_id: "23m5fpdg74lyhna",
          response_type: "code",
          code_challenge: await sha256(codeVerifier),
          code_challenge_method: "S256",
          redirect_uri: host + "/authorized",
        },
      });
    }
  }
};

const delay = (timeout) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });

export const getAuthHeader = async () => {
  if (token) return `Bearer ${token}`;

  console.log("waiting");
  await delay(100);

  return getAuthHeader();
};

export const isAuthorized = () => Boolean(token);
