import { queryParams, location } from "@dependable/nano-router";

let token = null;

const host =
  process.env.NODE_ENV === "production"
    ? "https://denoted.surge.sh"
    : "http://localhost:5000";

export const authorize = (context) => {
  if (!token) {
    token = sessionStorage.getItem("dropbox-token");
  }

  const { hash } = location();

  if (!token && hash) {
    const { access_token } = Object.fromEntries(
      hash
        .slice(1)
        .split("&")
        .map((e) => e.split("=")),
    );

    token = access_token;

    sessionStorage.setItem("dropbox-token", token);

    context.router.navigate({
      route: "home",
      hash: "",
      replace: true,
    });
  }

  if (!token) {
    context.router.navigate({
      route: "authorize",
      queryParams: {
        client_id: "23m5fpdg74lyhna",
        response_type: "token",
        redirect_uri: host + "/authorized",
      },
    });
  }
};

export const getAuthHeader = () => `Bearer ${token}`;

export const isAuthorized = () => Boolean(token);
