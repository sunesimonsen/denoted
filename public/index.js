import "@dependable/vite";
import { html, render } from "@dependable/view";
import { RootView } from "./components/RootView.js";
import { Router, Routing } from "@dependable/nano-router";
import { createBrowserHistory } from "@nano-router/history";
import { ThemeProvider } from "@dependable/components/default-theme/v0";
import { routes } from "./routes.js";
import { Api } from "./api.js";

const history = createBrowserHistory();

const router = new Router({ routes, history });

render(html`
  <${Routing} router=${router}>
    <${ThemeProvider}>
      <Context api=${new Api({ router })}>
        <${RootView} />
      </Context>
    <//>
  <//>
`);
