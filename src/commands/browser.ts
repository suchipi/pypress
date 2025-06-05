import puppeteer from "puppeteer";
import { sleep } from "a-mimir";
import type { Pypress } from "../pypress";
import { clearPageContext } from "./query";
import { Location } from "../types";
import makeDebug from "debug";

function makeCommandDebug(name: string) {
  return makeDebug("pypress:commands/" + name);
}

declare var location: any;

export default (pypress: Pypress) => {
  const py = pypress.api;

  {
    const debug = makeCommandDebug("launch");
    pypress.registerCommand("launch", async (command, api) => {
      const launchOptions = command.args[0] || {};
      debug(
        "awaiting puppeteer.launch(options), where 'options' is:",
        launchOptions,
      );
      const browser = await puppeteer.launch(launchOptions);
      api.writeContext({ browser });
      return browser;
    });
  }

  {
    const debug = makeCommandDebug("close");
    pypress.registerCommand("close", async (command, api) => {
      const { browser } = api.context;
      if (browser) {
        debug("awaiting browser.close()...");
        await browser.close();
      } else {
        debug("py.close was called but no browser was present. continuing...");
      }

      clearPageContext(api);
      api.writeContext({ browser: undefined, page: undefined });
    });
  }

  {
    const debug = makeCommandDebug("getDefaultPage");
    pypress.registerCommand("getDefaultPage", async (command, api) => {
      const { browser } = api.context;
      if (!browser) {
        debug("no browser; re-invoking self after calling py.launch()");
        py.launch();
        return py.getDefaultPage();
      }

      debug("awaiting browser.pages()...");
      const pages = await browser.pages();

      const page = pages[0];
      if (page == null) {
        throw new Error("py.launch() didn't create a page!");
      }
      api.writeContext({ page });
      return page;
    });
  }

  {
    const debug = makeCommandDebug("newPage");
    pypress.registerCommand("newPage", async (command, api) => {
      const { browser } = api.context;
      if (!browser) {
        debug("no browser; re-invoking self after calling py.launch()");
        py.launch();
        return py.newPage();
      }

      clearPageContext(api);

      const page = await browser.newPage();
      api.writeContext({ page });
      return page;
    });
  }

  {
    const debug = makeCommandDebug("goto");
    pypress.registerCommand("goto", async (command, api) => {
      const { page } = api.context;
      if (!page) {
        debug("no page; re-invoking self after calling py.getDefaultPage()");
        py.getDefaultPage();
        return py.goto(...command.args);
      }

      clearPageContext(api);

      await page.goto(...command.args);
      return page;
    });
  }

  {
    const debug = makeCommandDebug("evaluate");
    pypress.registerCommand("evaluate", async (command, api) => {
      const { page } = api.context;
      if (!page) {
        py.getDefaultPage();
        return py.evaluate(...command.args);
      }

      let result: any;
      try {
        result = await page.evaluate(...command.args);
      } catch (error: any) {
        await sleep.async(100);
        api.retry({ error, maxRetries: 10 });
      }

      return result;
    });
  }

  {
    const debug = makeCommandDebug("evaluateHandle");
    pypress.registerCommand("evaluateHandle", async (command, api) => {
      const { page } = api.context;
      if (!page) {
        py.getDefaultPage();
        return py.evaluateHandle(...command.args);
      }

      const result: any = await page.evaluateHandle(...command.args);
      return result;
    });
  }

  {
    const debug = makeCommandDebug("go");
    pypress.registerCommand("go", async (command, api) => {
      const { page } = api.context;
      if (!page) {
        py.getDefaultPage();
        return py.go(...command.args);
      }

      switch (command.args[0]) {
        case "back": {
          clearPageContext(api);
          await page.goBack();
          break;
        }
        case "forward": {
          clearPageContext(api);
          await page.goForward();
          break;
        }
        default: {
          throw new Error('`py.go` only accepts "back" or "forward"');
        }
      }
    });
  }

  {
    const debug = makeCommandDebug("hash");
    pypress.registerCommand("hash", async (command, api) => {
      return py.evaluate(() => location.hash);
    });
  }

  {
    const debug = makeCommandDebug("location");
    pypress.registerCommand("location", async (command, api) => {
      let serializedLocation = await py.evaluate(() => {
        return {
          hash: location.hash,
          host: location.host,
          hostname: location.hostname,
          href: location.href,
          origin: location.origin,
          pathname: location.pathname,
          port: location.port,
          protocol: location.protocol,
          search: location.search,
          __toStringResult: location.toString(),
        };
      });

      const {
        hash,
        host,
        hostname,
        href,
        origin,
        pathname,
        port,
        protocol,
        search,
        __toStringResult,
      } = serializedLocation;

      const location: Location = {
        hash,
        host,
        hostname,
        href,
        origin,
        pathname,
        port,
        protocol,
        search,
        toString: () => __toStringResult,
      };

      if (command.args[0]) {
        return location[command.args[0]] as any;
      } else {
        return location as any;
      }
    });
  }

  {
    const debug = makeCommandDebug("reload");
    pypress.registerCommand("reload", async (command, api) => {
      clearPageContext(api);
      await py.evaluate(() => location.reload());
    });
  }

  {
    const debug = makeCommandDebug("scrollIntoView");
    pypress.registerCommand("scrollIntoView", async (command, api) => {
      const { el } = api.context;
      if (!el) {
        throw new Error("No element selected");
      }

      await el.evaluate((node) => node.scrollIntoView());
    });
  }
};
