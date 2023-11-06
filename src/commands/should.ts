import type { Pypress } from "../pypress";

export default (pypress: Pypress) => {
  const py = pypress.api;

  pypress.registerCommand("should", async (command, api) => {
    const [name, ...rest] = command.args as Array<any>;
    py[`should:${name}`](...rest);
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
};
