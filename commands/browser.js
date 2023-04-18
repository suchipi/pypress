const puppeteer = require("puppeteer");
const { clearPageContext } = require("./query");

module.exports = (pypress) => {
  const py = pypress.api;

  pypress.registerCommand("launch", async (command, api) => {
    const browser = await puppeteer.launch(command.args[0] || {});
    api.writeContext({ browser });
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
      py.getDefaultPage();
      return;
    }

    const page = (await browser.pages())[0];
    api.writeContext({ page });
  });

  pypress.registerCommand("newPage", async (command, api) => {
    const { browser } = api.context;
    if (!browser) {
      py.launch();
      py.newPage();
      return;
    }

    clearPageContext(api);

    const page = await browser.newPage();
    api.writeContext({ page });
  });

  pypress.registerCommand("goto", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.goto(...command.args);
      return;
    }

    clearPageContext(api);

    await page.goto(...command.args);
  });

  pypress.registerCommand("evaluate", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return;
    }

    let result;
    try {
      result = await page.evaluate(...command.args);
    } catch (error) {
      await api.sleep(100);
      api.retry({ error, maxRetries: 10 });
    }

    return result;
  });

  pypress.registerCommand("evaluateHandle", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.goto(...command.args);
      return;
    }

    const result = await page.evaluateHandle(...command.args);

    return result;
  });

  pypress.registerCommand("go", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.go(...command.args);
      return;
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
    py.evaluate(() => location.hash);
  });

  pypress.registerCommand("location", async (command, api) => {
    let serializedLocation = py.evaluate(() => {
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
    } = serializedLocation;

    const location = {
      hash,
      host,
      hostname,
      href,
      origin,
      pathname,
      port,
      protocol,
      search,
      toString: () => ret.__toStringResult
    };

    let ret = location;

    if (command.args[0]) {
      ret = location[command.args[0]];
    }

    return ret;
  });

  pypress.registerCommand("reload", async (command, api) => {
    clearPageContext(api);
    // eslint-disable-next-line no-self-assign
    py.evaluate(() => location.reload());
  });

  pypress.registerCommand("scrollIntoView", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    await el.evaluate((node) => node.scrollIntoView());
  });
};
