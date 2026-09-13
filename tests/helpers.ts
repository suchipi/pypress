import type { ElementHandle } from "puppeteer";

/** Trimmed textContent of an element handle. */
export const textOf = (el: ElementHandle | any): Promise<string> =>
  el.evaluate((node: any) => (node.textContent || "").trim());

/** Uppercase tag name of an element handle, eg. "LI". */
export const tagOf = (el: ElementHandle | any): Promise<string> =>
  el.evaluate((node: any) => node.tagName);

/** id attribute of an element handle, or "" when it has none. */
export const idOf = (el: ElementHandle | any): Promise<string> =>
  el.evaluate((node: any) => node.id);
