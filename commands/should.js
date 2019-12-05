const pypress = require("../pypress");

const py = pypress.api;

pypress.registerCommand("should", async (command, api) => {
  py[`should:${command.args[0]}`](...command.args.slice(1));
});

pypress.registerCommand("should:navigate", async (command, api) => {
  const { page } = api.context;
  if (!page) {
    py.getDefaultPage();
    py["should:navigate"]();
    return;
  }

  await page.waitForNavigation();
});
