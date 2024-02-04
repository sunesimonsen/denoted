import { Routes, Route, ExternalRoute } from "@nano-router/router";

export const routes = new Routes(
  new Route("home", "/"),
  new Route("authorized", "/authorized"),
  new Route("note/view", "/note/view/:id"),
  new Route("note/edit", "/note/edit/:id"),
  new ExternalRoute("authorize", "https://www.dropbox.com/oauth2/authorize"),
);
