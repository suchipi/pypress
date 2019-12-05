const pypress = require("../pypress");

const py = pypress.api;

pypress.registerCommand("clearLocalStorage", async (command, api) => {
  let { page } = api.context;
  if (!page) {
    py.getDefaultPage();
    py.clearLocalStorage(...command.args);
    return;
  }

  await page.evaluate(() => localStorage.clear());
});
