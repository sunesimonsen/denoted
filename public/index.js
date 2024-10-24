import "@dependable/vite";
import { render, h } from "@dependable/view";
import { RootView } from "./components/RootView.js";
import { Router, Routing } from "@dependable/nano-router";
import { createBrowserHistory } from "@nano-router/history";
import { ThemeProvider } from "@dependable/components/brown-theme/v0";
import { Keyboard } from "./components/Keyboard.js";
import { ErrorBoundary } from "@dependable/components/ErrorBoundary/v0";
import { FatalErrorScreen } from "./components/FatalErrorScreen.js";
import { routes } from "./routes.js";
import { Api } from "./Api.js";

const history = createBrowserHistory();

const router = new Router({ routes, history });

const api = new Api({ fetch, router });

render(
  h(
    Routing,
    { router },
    h(
      "Context",
      { api },
      h(
        ThemeProvider,
        {},
        h(
          Keyboard,
          {},
          h(
            ErrorBoundary,
            {
              name: "ContentPanel",
              fallback: h(FatalErrorScreen),
              onError: console.error,
            },
            h(RootView),
          ),
        ),
      ),
    ),
  ),
);
