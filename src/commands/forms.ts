import type { Pypress } from "../pypress";

export default (pypress: Pypress) => {
  pypress.registerCommand("check", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    el.evaluate((node) => {
      node.checked = true;
    });
  });
};
