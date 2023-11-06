import fs from "fs";
import type { Pypress } from "../pypress";
import { sleep } from "a-mimir";
import { ElementHandle } from "puppeteer";
import type { ChainHelpers } from "cypress-style-async";
import type { ChainContext } from "../types";

const sizzleScript = fs.readFileSync(require.resolve("sizzle"));

// to make typescript quiet
declare var window: any;
declare var document: any;

export default (pypress: Pypress) => {
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
      })()`,
    );
  });

  pypress.registerCommand("_updateTargetUI", async (command, api) => {
    try {
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
    } catch (err) {
      // ignore
    }
  });

  pypress.registerCommand("getAll", async (command, api) => {
    await py._loadSizzle();

    const { page, within } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.getAll(...command.args);
    }

    const selector = command.args[0];
    const options = command.args[1] || {};
    let length: number;
    try {
      length = await page.evaluate(
        (selector, within) => {
          window.SizzleResult = window.Sizzle(selector);

          if (within) {
            window.SizzleResult = window.SizzleResult.filter((el) =>
              within.contains(el),
            );
          }
          return window.SizzleResult.length;
        },
        selector,
        within,
      );

      if (!options.allowNonExistent && length === 0) {
        throw new Error("No elements found");
      }
    } catch (error: any) {
      await sleep.async(100);
      return api.retry({ error, maxRetries: 40 }) as any;
    }

    const els = await Promise.all(
      Array(length)
        .fill(undefined)
        .map(async (_, index) => {
          const el = await page.evaluateHandle((index) => {
            return window.SizzleResult[index];
          }, index);
          return el;
        }),
    );

    api.writeContext({ els });

    await py._updateTargetUI();

    return els;
  });

  pypress.registerCommand("get", async (command, api) => {
    const els = await py.getAll(...command.args);

    const selector = command.args[0];
    let el: ElementHandle;
    if (selector.match(/:withText/)) {
      // they usually want the *deepest* element with that text,
      // which shows up last in the list
      el = els[els.length - 1];
    } else {
      el = els[0];
    }

    api.writeContext({ el });

    return el;
  });

  pypress.registerCommand("checkIfExists", async (command, api) => {
    const els = await py.getAll(command.args[0], { allowNonExistent: true });

    const exists = els.length > 0;
    api.writeContext({ exists });
    return exists;
  });

  pypress.registerCommand("getByText", async (command, api) => {
    const text = command.args[0];
    const selector = `:withText(${JSON.stringify(text)})`;
    return py.get(selector);
  });

  py.contains = py.getByText;

  pypress.registerCommand("getInputForLabel", async (command, api) => {
    const text = command.args[0] || "";
    const label = await py.get(`label:withText(${JSON.stringify(text)})`);
    const forAttr = await label.evaluate((node) => node.htmlFor);
    return py.get(`input[id=${forAttr}]`);
  });

  pypress.registerCommand("first", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[0];
    api.writeContext({ el, els: undefined });
    await py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("second", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[1];
    api.writeContext({ el, els: undefined });
    await py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("third", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[2];
    api.writeContext({ el, els: undefined });
    await py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("at", async (command, api) => {
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const el = els[command.args[0]];
    api.writeContext({ el, els: undefined });
    await py._updateTargetUI();
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
    await py._updateTargetUI();
    return el;
  });

  pypress.registerCommand("filter", async (command, api) => {
    await py._loadSizzle();
    const { els } = api.context;
    if (!els) {
      throw new Error("No elements selected");
    }

    const selector = command.args[0];
    const newEls: Array<ElementHandle> = [];

    for (const el of els) {
      const isIn = await el.evaluate((node, selector) => {
        const results = window.Sizzle(selector);
        return results.indexOf(node) != -1;
      }, selector);
      if (isIn) {
        newEls.push(el);
      }
    }

    api.writeContext({ els: newEls });
    await py._updateTargetUI();
    return els;
  });

  pypress.registerCommand("not", async (command, api) => {
    const selector = command.args[0];
    return py.filter(`:not(${selector})`);
  });

  pypress.registerCommand("closest", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const selector = command.args[0];

    let parent: ElementHandle;
    try {
      const maybeParent = await el.evaluate((node, selector) => {
        let el = node;

        while (el) {
          if (el && window.Sizzle(selector).indexOf(el) != -1) {
            return el;
          }
          el = el.parentElement;
        }

        return null;
      }, selector);

      if (!maybeParent) {
        throw new Error(
          `Could not find a parent element matching the selector '${selector}'.`,
        );
      }

      parent = maybeParent;
    } catch (error: any) {
      await sleep.async(100);
      return api.retry({ error, maxRetries: 40 }) as any;
    }

    api.writeContext({ el: parent });
    await py._updateTargetUI();
    return parent;
  });

  pypress.registerCommand("within", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    const [callback] = command.args;

    api.writeContext({ within: el });

    const result = await callback(el);

    api.writeContext({ within: undefined });

    return result;
  });

  pypress.registerCommand("find", async (command, api) => {
    const { el } = api.context;
    if (!el) {
      throw new Error("No element selected");
    }

    return py.within(() => {
      return py.get(...command.args);
    });
  });

  pypress.registerCommand("focused", async (command, api) => {
    const { page } = api.context;
    if (!page) {
      py.getDefaultPage();
      return py.focused(...command.args);
    }

    const el = await page.evaluateHandle(() => document.activeElement);

    api.writeContext({ el });
    await py._updateTargetUI();
    return el;
  });
};

export const clearPageContext = (api: ChainHelpers<ChainContext>) => {
  api.writeContext({
    el: undefined,
    els: undefined,
    within: undefined,
    exists: undefined,
  });
};
