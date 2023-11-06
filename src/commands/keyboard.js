module.exports = (pypress) => {
  const py = pypress.api;

  pypress.registerCommand("focus", async (command, api) => {
    let { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    await el.evaluate((node) => {
      node.focus();
    });
  });

  pypress.registerCommand("blur", async (command, api) => {
    let { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    await el.evaluate((node) => {
      node.blur();
    });
  });

  pypress.registerCommand("type", async (command, api) => {
    let { page, el } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.type(...command.args);
      return;
    }

    if (el) {
      await el.evaluate((node) => {
        node.focus();
      });
    }

    await page.keyboard.type(command.args[0]);
  });

  pypress.registerCommand("keyPress", async (command, api) => {
    let { page, el } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.keypress(...command.args);
      return;
    }

    if (el) {
      await el.evaluate((node) => {
        node.focus();
      });
    }

    await page.keyboard.press(command.args[0]);
  });

  pypress.registerCommand("keyDown", async (command, api) => {
    let { page, el } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.keydown(...command.args);
      return;
    }

    if (el) {
      await el.evaluate((node) => {
        node.focus();
      });
    }

    await page.keyboard.down(command.args[0]);
  });

  pypress.registerCommand("keyUp", async (command, api) => {
    let { page, el } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.keyup(...command.args);
      return;
    }

    if (el) {
      await el.evaluate((node) => {
        node.focus();
      });
    }

    await page.keyboard.up(command.args[0]);
  });

  pypress.registerCommand("keyCharacter", async (command, api) => {
    let { page, el } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.keyCharacter(...command.args);
      return;
    }

    if (el) {
      await el.evaluate((node) => {
        node.focus();
      });
    }

    await page.keyboard.sendCharacter(command.args[0]);
  });

  pypress.registerCommand("clear", async (command, api) => {
    let { page, el } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.clear(...command.args);
      return;
    }

    if (el) {
      await el.evaluate((node) => {
        node.focus();
      });
    }

    await page.evaluate(() => document.execCommand("selectall", false, null));
    await page.keyboard.press("Backspace");
  });
};
