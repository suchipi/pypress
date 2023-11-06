import type { Pypress } from "../pypress";

export default (pypress: Pypress) => {
  const py = pypress.api;

  pypress.registerCommand("clearCookie", async (command, api) => {
    let { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.clearCookie(...command.args);
    }

    await page.deleteCookie({ name: command.args[0] });
  });

  pypress.registerCommand("clearCookies", async (command, api) => {
    let { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.clearCookies(...command.args);
    }

    const cookies = await page.cookies();
    for (const cookie of cookies) {
      await page.deleteCookie(cookie);
    }
  });

  pypress.registerCommand("getCookies", async (command, api) => {
    let { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.getCookies(...command.args);
    }

    const cookies = await page.cookies();
    api.writeContext({ cookies });
    return cookies;
  });

  pypress.registerCommand("getCookie", async (command, api) => {
    const cookies = await py.getCookies();
    return cookies.find((cookie) => cookie.name === command.args[0]) || null;
  });
};
