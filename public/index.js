import "@dependable/vite";
import { render, h } from "@dependable/view";
import { RootView } from "./components/RootView.js";
import { Router, Routing } from "@dependable/nano-router";
import { createBrowserHistory } from "@nano-router/history";
import { ThemeProvider } from "@dependable/components/brown-theme/v0";
import { Keyboard } from "./components/Keyboard.js";
import { routes } from "./routes.js";
import { Api } from "./Api.js";

const history = createBrowserHistory();

const router = new Router({ routes, history });

const api = new Api({ router });

render(
  h(
    Routing,
    { router },
    h("Context", { api }, h(ThemeProvider, {}, h(Keyboard, {}, h(RootView)))),
  ),
);
