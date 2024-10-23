import { Routes, Route, ExternalRoute } from "@nano-router/router";

export const routes = new Routes(
  new Route("authorized", "/authorized"),
  new Route("authorize", "/authorize"),
  new Route("note/view", "/note/view/:id"),
  new Route("note/edit", "/note/edit/:id"),
  new Route("home", "/"),
  new ExternalRoute(
    "dropbox/authorize",
    "https://www.dropbox.com/oauth2/authorize",
  ),
);
