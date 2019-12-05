const pypress = require("../pypress");

const py = pypress.api;

pypress.registerCommand("click", async (command, api) => {
  const { page } = api.context;
  if (!page) {
    throw new Error(
      "No page present; I need a page to move the mouse so I can click"
    );
  }

  if (command.args.length === 1) {
    py.get(command.args[0]).click();
    return;
  } else if (command.args.length === 2) {
    const [posX, posY] = command.args;
    const mouse = page.mouse;
    await mouse.move(posX, posY);
    await mouse.click(posX, posY, {
      button: "left",
      clickCount: 1,
      delay: 0,
    });
  } else {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const rect = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const { x, y, width, height } = rect;
      return { x, y, width, height };
    });

    const mouse = page.mouse;
    const posX = rect.x + rect.width / 2;
    const posY = rect.y + rect.height / 2;
    await mouse.move(posX, posY);
    await mouse.click(posX, posY, {
      button: "left",
      clickCount: 1,
      delay: 0,
    });
  }
});

pypress.registerCommand("rightClick", async (command, api) => {
  const { page } = api.context;
  if (!page) {
    throw new Error(
      "No page present; I need a page to move the mouse so I can click"
    );
  }

  if (command.args.length === 1) {
    py.get(command.args[0]).click();
    return;
  } else if (command.args.length === 2) {
    const [posX, posY] = command.args;
    const mouse = page.mouse;
    await mouse.move(posX, posY);
    await mouse.click(posX, posY, {
      button: "right",
      clickCount: 1,
      delay: 0,
    });
  } else {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const rect = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const { x, y, width, height } = rect;
      return { x, y, width, height };
    });

    const mouse = page.mouse;
    const posX = rect.x + rect.width / 2;
    const posY = rect.y + rect.height / 2;
    await mouse.move(posX, posY);
    await mouse.click(posX, posY, {
      button: "right",
      clickCount: 1,
      delay: 0,
    });
  }
});

pypress.registerCommand("middleClick", async (command, api) => {
  const { page } = api.context;
  if (!page) {
    throw new Error(
      "No page present; I need a page to move the mouse so I can click"
    );
  }

  if (command.args.length === 1) {
    py.get(command.args[0]).click();
    return;
  } else if (command.args.length === 2) {
    const [posX, posY] = command.args;
    const mouse = page.mouse;
    await mouse.move(posX, posY);
    await mouse.click(posX, posY, {
      button: "middle",
      clickCount: 1,
      delay: 0,
    });
  } else {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const rect = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const { x, y, width, height } = rect;
      return { x, y, width, height };
    });

    const mouse = page.mouse;
    const posX = rect.x + rect.width / 2;
    const posY = rect.y + rect.height / 2;
    await mouse.move(posX, posY);
    await mouse.click(posX, posY, {
      button: "middle",
      clickCount: 1,
      delay: 0,
    });
  }
});

pypress.registerCommand("hover", async (command, api) => {
  const { page } = api.context;
  if (!page) {
    throw new Error("No page present; I need a page to move the mouse");
  }

  if (command.args.length === 1) {
    py.get(command.args[0]).hover();
    return;
  } else if (command.args.length === 2) {
    const [posX, posY] = command.args;
    const mouse = page.mouse;
    await mouse.move(posX, posY);
  } else {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const rect = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const { x, y, width, height } = rect;
      return { x, y, width, height };
    });

    const mouse = page.mouse;
    const posX = rect.x + rect.width / 2;
    const posY = rect.y + rect.height / 2;
    await mouse.move(posX, posY);
  }
});

pypress.registerCommand("doubleClick", async (command, api) => {
  py.click(...command.args);
  py.click(...command.args);
});

py.dblclick = py.doubleClick;
py.rightclick = py.rightClick;
py.moveMouse = py.hover;
