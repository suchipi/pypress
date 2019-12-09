const fs = require("fs");
const sizzleScript = fs.readFileSync(require.resolve("sizzle"));

module.exports = (pypress) => {
  const py = pypress.api;

  pypress.registerCommand("_loadSizzle", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      py._loadSizzle(...command.args);
      return;
    }

    py.evaluate(
      `(function() {
        ${sizzleScript};

        Sizzle.selectors.pseudos.withText = Sizzle.selectors.createPseudo((searchTerm) => {
          return (el) => {
            return [
              () => el.textContent || "",
              () => el.innerText || "",
              () => el.getAttribute("aria-label") || "",
              () => el.title || "",
              () => {
                if (el.tagName === "INPUT" && el.type === "submit") {
                  return el.value || "";
                } else {
                  return "";
                }
              },
            ].some(textGetter => {
              const maybeText = textGetter();
              return maybeText && maybeText.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
            });
          }
        });
      })()`
    );
  });

  pypress.registerCommand("_updateTargetUI", async (command, api) => {
    const { el, els, page } = api.context;
    if (!page) {
      return;
    }

    await page.evaluate(() => {
      var Py = (window.Pypress = window.Pypress || {});

      if (Py.els) {
        Py.els.forEach((el) => {
          el.style.outline = el.originalOutline || "";
        });
      }
      Py.els = [];

      if (Py.el) {
        Py.el.style.outline = Py.el.originalOutline || "";
      }
      Py.el = null;
    });

    if (els) {
      for (const el of els) {
        await el.evaluate((node) => {
          var Py = window.Pypress;
          Py.els.push(node);

          node.originalOutline = node.style.outline;
          node.style.outline = "2px dotted yellow";
        });
      }
    }

    if (el) {
      await el.evaluate((node) => {
        var Py = window.Pypress;
        Py.el = node;

        node.originalOutline = node.style.outline;
        node.style.outline = "2px dotted red";
      });
    }
  });

  pypress.registerCommand("get", async (command, api) => {
    py._loadSizzle();
    py.then(async () => {
      const { page, within } = api.context;
      if (!page) {
        py.getDefaultPage();
        py.get(...command.args);
        return;
      }

      const selector = command.args[0];
      const options = command.args[1] || {};
      let length;
      try {
        length = await page.evaluate(
          (selector, within) => {
            window.SizzleResult = window.Sizzle(selector);

            if (within) {
              window.SizzleResult = window.SizzleResult.filter((el) =>
                within.contains(el)
              );
            }
            return window.SizzleResult.length;
          },
          selector,
          within
        );

        if (!options.allowNonExistent && length === 0) {
          throw new Error("No elements found");
        }
      } catch (error) {
        await api.sleep(100);
        return api.retry({ error, maxRetries: 40 });
      }

      const els = await Promise.all(
        Array(length)
          .fill()
          .map(async (_, index) => {
            const el = await page.evaluateHandle((index) => {
              return window.SizzleResult[index];
            }, index);
            return el;
          })
      );

      api.writeContext({ els });

      if (selector.match(/:withText/)) {
        api.writeContext({ el: els[els.length - 1] });
      } else {
        api.writeContext({ el: els[0] });
      }

      py._updateTargetUI();

      return els;
    });
  });

  pypress.registerCommand("checkIfExists", async (command, api) => {
    py.get(command.args[0], { allowNonExistent: true });
    py.then(({ els }) => {
      if (els.length === 0) {
        api.writeContext({ exists: false });
        return false;
      } else {
        api.writeContext({ exists: true });
        return true;
      }
    });
  });

  pypress.registerCommand("getByText", async (command, api) => {
    const text = command.args[0];
    py.get(`:withText(${JSON.stringify(text)})`);
  });

  py.contains = py.getByText;

  pypress.registerCommand("getInputForLabel", async (command, api) => {
    const text = command.args[0] || "";
    py.get(`label:withText(${JSON.stringify(text)})`);
    py.then(async ({ el }) => {
      const forAttr = await el.evaluate((node) => node.htmlFor);

      py.get(`input[id=${forAttr}]`);
    });
  });

  pypress.registerCommand("first", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[0];
    api.writeContext({ el, els: undefined });
    py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("second", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[1];
    api.writeContext({ el, els: undefined });
    py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("third", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[2];
    api.writeContext({ el, els: undefined });
    py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("at", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[command.args[0]];
    api.writeContext({ el, els: undefined });
    py._updateTargetUI();
    return el;
  });

  py.eq = py.at;

  pypress.registerCommand("last", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[els.length - 1];
    api.writeContext({ el, els: undefined });
    py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("filter", async (command, api) => {
    py._loadSizzle();
    py.then(() => {
      const { els } = api.context;
      if (!els) {
        throw new Error("No elements selected");
      }

      const selector = command.args[0];
      const newEls = [];

      for (const el of els) {
        const isIn = el.evaluate((node) => {
          const results = window.Sizzle(selector);
          return results.indexOf(node) != -1;
        }, selector);
        if (isIn) {
          newEls.push(el);
        }
      }

      api.writeContext({ els: newEls });
      py._updateTargetUI();
      return els;
    });
  });

  pypress.registerCommand("not", async (command, api) => {
    py.filter(`:not(${command.args[0]})`);
  });

  pypress.registerCommand("closest", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const selector = command.args[0];

    try {
      const exists = await el.evaluate((node, selector) => {
        let el = node;

        while (el) {
          if (el && window.Sizzle(selector).indexOf(el) != -1) {
            return true;
          }
          el = el.parentElement;
        }

        return false;
      }, selector);

      if (!exists) {
        throw new Error(
          `Could not find a parent element matching the selector '${selector}'.`
        );
      }
    } catch (error) {
      await api.sleep(100);
      return api.retry({ error, maxRetries: 40 });
    }

    const parent = await el.evaluateHandle((node, selector) => {
      let el = node;

      while (el) {
        if (el && window.Sizzle(selector).indexOf(el) != -1) {
          return el;
        }
        el = el.parentElement;
      }

      return node;
    }, selector);

    api.writeContext({ el: parent });
    py._updateTargetUI();
    return parent;
  });

  pypress.registerCommand("within", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    api.writeContext({ within: el });

    await command.args[0](api.context);

    py.then(() => {
      api.writeContext({ within: null });
    });

    return el;
  });

  pypress.registerCommand("find", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    py.within(() => {
      py.get(...command.args);
    });
  });

  pypress.registerCommand("focused", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      py.focused(...command.args);
      return;
    }

    const el = await page.evaluateHandle(() => document.activeElement);

    api.writeContext({ el });
    py._updateTargetUI();
    return el;
  });
};
