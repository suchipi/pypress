module.exports = (pypress) => {
  // const py = pypress.api;

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
