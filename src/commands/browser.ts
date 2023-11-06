import puppeteer from "puppeteer";
import { sleep } from "a-mimir";
import type { Pypress } from "../pypress";
import { clearPageContext } from "./query";
import { Location } from "../types";

declare var location: any;

export default (pypress: Pypress) => {
  const py = pypress.api;

  pypress.registerCommand("launch", async (command, api) => {
    const browser = await puppeteer.launch(command.args[0] || {});
    api.writeContext({ browser });
    return browser;
  });

  pypress.registerCommand("close", async (command, api) => {
    const { browser } = api.context;
    if (browser) {
      await browser.close();
    }

    clearPageContext(api);
    api.writeContext({ browser: undefined, page: undefined });
  });

  pypress.registerCommand("getDefaultPage", async (command, api) => {
    const { browser } = api.context;
    if (!browser) {
      py.launch();
      return py.getDefaultPage();
    }

    const page = (await browser.pages())[0];
    api.writeContext({ page });
    return page;
  });

  pypress.registerCommand("newPage", async (command, api) => {
    const { browser } = api.context;
    if (!browser) {
      py.launch();
      return py.newPage();
    }

    clearPageContext(api);

    const page = await browser.newPage();
    api.writeContext({ page });
    return page;
  });

  pypress.registerCommand("goto", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.goto(...command.args);
    }

    clearPageContext(api);

    await page.goto(...command.args);
    return page;
  });

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

  pypress.registerCommand("evaluateHandle", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.evaluateHandle(...command.args);
    }

    const result: any = await page.evaluateHandle(...command.args);
    return result;
  });

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

  pypress.registerCommand("hash", async (command, api) => {
    return py.evaluate(() => location.hash);
  });

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

  pypress.registerCommand("reload", async (command, api) => {
    clearPageContext(api);
    await py.evaluate(() => location.reload());
  });

  pypress.registerCommand("scrollIntoView", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    await el.evaluate((node) => node.scrollIntoView());
  });
};
