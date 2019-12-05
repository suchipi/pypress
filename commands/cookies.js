const pypress = require("../pypress");

const py = pypress.api;

pypress.registerCommand("clearCookie", async (command, api) => {
  let { page } = api.context;
  if (!page) {
    py.getDefaultPage();
    py.clearCookie(...command.args);
    return;
  }

  await page.deleteCookie({ name: command.args[0] });
});

pypress.registerCommand("clearCookies", async (command, api) => {
  let { page } = api.context;
  if (!page) {
    py.getDefaultPage();
    py.clearCookies(...command.args);
    return;
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
    py.getCookies(...command.args);
    return;
  }

  const cookies = await page.cookies();
  api.writeContext({ cookies });
  return cookies;
});

pypress.registerCommand("getCookie", async (command, api) => {
  py.getCookies();
  py.then(({ cookies }) => {
    return cookies.find((cookie) => cookie.name === command.args[0]) || null;
  });
});
