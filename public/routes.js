import { Routes, Route, ExternalRoute } from "@nano-router/router";

export const routes = new Routes(
  new Route("home", "/"),
  new Route("authorized", "/authorized"),
  new Route("note", "/note/:id"),
  new ExternalRoute("authorize", "https://www.dropbox.com/oauth2/authorize"),
  new ExternalRoute("token", "https://www.dropbox.com/oauth2/token"),
);
