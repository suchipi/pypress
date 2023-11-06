import { Browser, Page, ElementHandle, KeyInput } from "puppeteer";

export type { Browser, Page, ElementHandle, KeyInput };

export type Cookie = ReturnType<Page["cookies"]> extends Promise<Array<infer R>>
  ? R
  : never;

export type ChainContext = Partial<{
  browser: Browser;
  page: Page;
  el: ElementHandle;
  els: Array<ElementHandle>;
  exists: boolean;
  within: ElementHandle;
}>;

export type Location = {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  toString: () => string;
};

export type CommandsMap = {
  // --- browser ---
  launch(options?: {
    env?: { [key: string]: string | number | undefined };
    product?: "chrome" | "firefox";
    headless?: boolean;
  }): Promise<Browser>;
  close(): Promise<void>;
  getDefaultPage(): Promise<Page>;
  newPage(): Promise<Page>;
  goto(...args: Parameters<Page["goto"]>): Promise<Page>;
  evaluate(...args: Parameters<Page["evaluate"]>): Promise<any>;
  evaluateHandle(...args: Parameters<Page["evaluateHandle"]>): Promise<any>;
  go(direction: "back" | "forward"): Promise<void>;
  hash(): Promise<string>;
  location(): Promise<Location>;
  location<Key extends keyof Location>(property: Key): Promise<Location[Key]>;
  reload(): Promise<void>;
  scrollIntoView(): Promise<void>;

  // --- chaining ---
  each(): Promise<void>;
  end(): Promise<null>;
  invoke(): Promise<any>;
  its(): Promise<any>;

  // --- cookies ---
  clearCookie(name: string): Promise<void>;
  clearCookies(): Promise<void>;
  getCookies(): Promise<Array<Cookie>>;
  getCookie(name: string): Promise<Cookie>;

  // --- forms ---
  check(): Promise<void>;

  // --- keyboard ---
  focus(): Promise<void>;
  blur(): Promise<void>;
  type(text: string): Promise<void>;
  keyPress(key: KeyInput): Promise<void>;
  keyDown(key: KeyInput): Promise<void>;
  keyUp(key: KeyInput): Promise<void>;
  keyCharacter(char: string): Promise<void>;
  clear(): Promise<void>;

  // --- local-storage ---
  clearLocalStorage(): Promise<void>;

  // --- misc ---
  sleep(ms?: number): Promise<void>;
  logContext(): Promise<void>;
  logContext(key: keyof ChainContext): Promise<void>;
  debug(): Promise<void>;
  exec(
    cmd: string,
  ): Promise<{ code: number | null; stdout: Buffer; stderr: Buffer }>;
  log(...args: Array<any>): Promise<void>;

  // --- mouse ---
  click: {
    /** Click context.el. */
    (): Promise<void>;
    /** Query for an element using the provided string, then click it. */
    (elementQuery: string): Promise<void>;
    /** Move the mouse to the specified position and then click. */
    (posX: number, posY: number): Promise<void>;
  };
  rightClick: CommandsMap["click"]; // same type signature
  middleClick: CommandsMap["click"]; // same type signature
  hover: CommandsMap["click"]; // same type signature
  doubleClick: CommandsMap["click"]; // same type signature
  dblclick: CommandsMap["doubleClick"]; // alias
  rightclick: CommandsMap["rightClick"]; // alias
  moveMouse: CommandsMap["hover"]; // alias

  // --- query ---
  /** used internally */
  _loadSizzle(): Promise<void>;
  /** used internally */
  _updateTargetUI(): Promise<void>;

  get(
    selector: string,
    options: { allowNonExistent: false },
  ): Promise<ElementHandle>;
  get(
    selector: string,
    options: { allowNonExistent: true },
  ): Promise<ElementHandle | undefined>;
  get(
    selector: string,
    options: { allowNonExistent?: boolean },
  ): Promise<ElementHandle | undefined>;
  get(selector: string): Promise<ElementHandle>;

  getAll(
    selector: string,
    options?: { allowNonExistent?: boolean },
  ): Promise<Array<ElementHandle>>;

  checkIfExists(selector: string): Promise<boolean>;
  getByText(text: string): Promise<ElementHandle>;
  contains: CommandsMap["getByText"]; // alias
  getInputForLabel(labelText: string): Promise<ElementHandle>;
  // reads from context.els
  first(): Promise<ElementHandle>;
  second: CommandsMap["first"]; // same signature
  third: CommandsMap["first"]; // same signature
  at(index: number): Promise<ElementHandle>;
  /** alias for `at` */
  eq: CommandsMap["at"]; // alias
  last: CommandsMap["first"]; // same signature
  /** remove from context.els those elements which don't match `selector` */
  // returns context.els
  filter(selector: string): Promise<Array<ElementHandle>>;
  not: CommandsMap["filter"]; // same signature
  /** search up through parents for first one that matches this selector */
  closest(selector: string): Promise<ElementHandle>;
  /** scope things so that query calls within the callback only find things within the current context.el */
  within<R>(callback: (el: ElementHandle) => R | Promise<R>): Promise<R>;
  /** query for elements that are descendants of the current context.el */
  find: CommandsMap["get"]; // same signature
  /** Set context.el to document.activeElement */
  focused(): Promise<ElementHandle | null>;

  // --- should ---
  // TODO: support more than just navigate, via chai, like cypress does
  should(assertion: "navigate"): Promise<void>;
};
