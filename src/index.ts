import { Pypress } from "./pypress";
import browser from "./commands/browser";
import chaining from "./commands/chaining";
import cookies from "./commands/cookies";
import forms from "./commands/forms";
import keyboard from "./commands/keyboard";
import storage from "./commands/local-storage";
import misc from "./commands/misc";
import mouse from "./commands/mouse";
import query from "./commands/query";
import should from "./commands/should";

export function makePypress({
  log = () => {},
}: { log?: (...args: any) => void } = {}) {
  const pypress = new Pypress({ log });

  [
    browser,
    chaining,
    cookies,
    forms,
    keyboard,
    storage,
    misc,
    mouse,
    query,
    should,
  ].forEach((builder) => {
    builder(pypress);
  });

  const py = pypress.api;

  return py;
}
