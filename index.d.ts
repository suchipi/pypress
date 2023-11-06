import type {
  Browser,
  Page,
  ElementHandle,
  KeyInput,
  PuppeteerLaunchOptions,
  KeyboardTypeOptions,
  KeyPressOptions,
  KeyDownOptions,
} from "puppeteer";

export type {
  Browser,
  Page,
  ElementHandle,
  KeyInput,
  PuppeteerLaunchOptions,
  KeyboardTypeOptions,
  KeyPressOptions,
  KeyDownOptions,
};

export type Cookie = ReturnType<Page["cookies"]> extends Promise<Array<infer R>>
  ? R
  : never;

type ForceShowFullType<T> = T extends object ? { [K in keyof T]: T[K] } : never;

type Ret<ContextIn extends {}, ContextOut extends {} = {}> = Pypress<
  ForceShowFullType<
    Omit<ContextIn, keyof ContextOut | "lastReturnValue"> &
      ContextOut &
      (ContextOut extends { lastReturnValue: infer R }
        ? { lastReturnValue: R }
        : { lastReturnValue: undefined })
  >
>;

type BrowserAndPage = {
  browser: Browser;
  page: Page;
};

type ClearPageContext = {
  el: undefined;
  els: undefined;
  within: undefined;
  exists: undefined;
};

type Returned<T> = { lastReturnValue: T };

type Location = {
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

type Callable = (...args: any) => any;

type ElContext = {
  el: ElementHandle;
};

type ElsContext = {
  els: Array<ElementHandle>;
};

export interface Pypress<Context extends {} = {}> {
  // --- browser ---
  launch(options?: {
    env?: { [key: string]: string | number | undefined };
    product?: "chrome" | "firefox";
    headless?: boolean;
  }): Ret<Context, { browser: Browser }>;
  close(): Ret<Context, { browser: undefined; page: undefined }>;
  getDefaultPage(): Ret<Context, BrowserAndPage>;
  newPage(): Ret<BrowserAndPage & ClearPageContext>;
  goto(
    ...args: Parameters<Page["goto"]>
  ): Ret<Context, BrowserAndPage & ClearPageContext>;
  evaluate(...args: Parameters<Page["evaluate"]>): Ret<Context, Returned<any>>;
  evaluateHandle(
    ...args: Parameters<Page["evaluateHandle"]>
  ): Ret<Context, Returned<any>>;
  go(
    direction: "back" | "forward",
  ): Ret<Context, BrowserAndPage & ClearPageContext>;
  hash(): Ret<Context, BrowserAndPage & Returned<string>>;
  location(): Ret<Context, BrowserAndPage & Returned<Location>>;
  location<Key extends keyof Location>(
    property: Key,
  ): Ret<Context, BrowserAndPage & Returned<Location[Key]>>;
  reload(): Ret<Context, BrowserAndPage & ClearPageContext>;
  scrollIntoView: Context extends ElContext ? () => Ret<Context> : never;

  // --- chaining ---
  each: Context extends Returned<Array<infer R>>
    ? (callback: (item: R) => void | Promise<void>) => Ret<Context>
    : never;
  end(): Ret<Context, Returned<null>>;
  invoke: Context extends Returned<object>
    ? <
        Key extends keyof Context["lastReturnValue"],
        Value = Context["lastReturnValue"][Key],
      >(
        key: Key,
        ...params: Value extends Callable ? Parameters<Value> : []
      ) => Value extends Callable
        ? Ret<Context, Returned<ReturnType<Value>>>
        : never
    : never;
  its: Context extends Returned<object>
    ? <
        Key extends keyof Context["lastReturnValue"],
        Value = Context["lastReturnValue"][Key],
      >(
        key: Key,
      ) => Ret<Context, Returned<Value>>
    : never;

  // --- cookies ---
  clearCookie(name: string): Ret<Context>;
  clearCookies(): Ret<Context>;
  getCookies(): Ret<Context, { cookies: Array<Cookie> }>;
  getCookie(
    name: string,
  ): Ret<Context, { cookies: Array<Cookie> } & Returned<Cookie | null>>;

  // --- forms ---
  check: Context extends ElContext ? () => Ret<Context> : never;

  // --- keyboard ---
  focus: Context extends ElContext ? () => Ret<Context> : never;
  blur: Context extends ElContext ? () => Ret<Context> : never;
  type: Context extends ElContext
    ? (text: string) => Ret<Context, BrowserAndPage>
    : never;
  keyPress: Context extends ElContext
    ? (key: KeyInput) => Ret<Context, BrowserAndPage>
    : never;
  keyDown: Context extends ElContext
    ? (key: KeyInput) => Ret<Context, BrowserAndPage>
    : never;
  keyUp: Context extends ElContext
    ? (key: KeyInput) => Ret<Context, BrowserAndPage>
    : never;
  keyCharacter: Context extends ElContext
    ? (char: string) => Ret<Context, BrowserAndPage>
    : never;
  clear: Context extends ElContext ? () => Ret<Context, BrowserAndPage> : never;

  // --- local-storage ---
  clearLocalStorage(): Ret<Context, BrowserAndPage>;

  // --- misc ---
  sleep(ms?: number): Ret<Context>;
  logContext(): Ret<Context>;
  logContext(key: keyof Context): Ret<Context>;
  then(callback: (context: Context) => void | Promise<void>): Ret<Context>;
  debug(): Ret<Context>;
  exec(
    cmd: string,
  ): Ret<
    Context,
    Returned<{ code: number | null; stdout: Buffer; stderr: Buffer }>
  >;
  log(...args: Array<any>): Ret<Context>;

  // --- mouse ---
  click: Context extends BrowserAndPage & ElContext
    ? {
        /** Click context.el. */
        (): Ret<Context>;
        /** Query for an element using the provided string, then click it. */
        (elementQuery: string): Ret<Context, ElContext & ElsContext>;
        /** Move the mouse to the specified position and then click. */
        (posX: number, posY: number): Ret<Context>;
      }
    : Context extends BrowserAndPage
    ? {
        /** Query for an element using the provided string, then click it. */
        (elementQuery: string): Ret<Context, ElContext & ElsContext>;
        /** Move the mouse to the specified position and then click. */
        (posX: number, posY: number): Ret<Context>;
      }
    : never;
  rightClick: Pypress<Context>["click"]; // same type signature
  middleClick: Pypress<Context>["click"]; // same type signature
  hover: Pypress<Context>["click"]; // same type signature
  doubleClick: Pypress<Context>["click"]; // same type signature
  dblclick: Pypress<Context>["doubleClick"]; // alias
  rightclick: Pypress<Context>["rightClick"]; // alias
  moveMouse: Pypress<Context>["hover"]; // alias

  // --- query ---
  get(selector: string): Ret<Context, ElContext & ElsContext>;
  get(
    selector: string,
    options: { allowNonExistent?: boolean },
  ): Ret<Context, ElContext & { el: undefined } & ElsContext>;
  get(
    selector: string,
    options: { allowNonExistent: false },
  ): Ret<Context, ElContext & ElsContext>;
  get(
    selector: string,
    options: { allowNonExistent: true },
  ): Ret<Context, ElContext & { el: undefined } & ElsContext>;

  checkIfExists(
    selector: string,
  ): Ret<
    Context,
    | (ElsContext & ElContext & { exists: true })
    | (ElsContext & { el: undefined; exists: false })
  >;
  getByText(text: string): Ret<Context, ElContext & ElsContext>;
  contains: Pypress<Context>["getByText"]; // alias
  getInputForLabel(labelText: string): Ret<Context, ElContext & ElsContext>;
  first: Context extends ElsContext
    ? () => Ret<Context, ElContext & { els: undefined }>
    : never;
  second: Pypress<Context>["first"]; // same signature
  third: Pypress<Context>["first"]; // same signature
  at: Context extends ElsContext
    ? (index: number) => Ret<Context, ElContext & { els: undefined }>
    : never;
  /** alias for `at` */
  eq: Pypress<Context>["at"]; // alias
  last: Pypress<Context>["first"]; // same signature
  /** remove from context.els those elements which don't match `selector` */
  filter: Context extends ElsContext
    ? (selector: string) => Ret<Context>
    : never;
  not: Pypress<Context>["filter"]; // same signature
  /** search up through parents for first one that matches this selector */
  closest: Context extends ElContext
    ? (selector: string) => Ret<Context>
    : never;
  /** scope things so that query calls within the callback only find things within the current context.el */
  within: Context extends ElContext
    ? (
        callback: (context: Context) => void | Promise<void>,
      ) => Ret<Context, Returned<ElementHandle>>
    : never;
  /** query for elements that are descendants of the current context.el */
  find: Pypress<Context>["get"]; // same signature
  /** Set context.el to document.activeElement */
  focused(): Ret<Context, BrowserAndPage & (ElContext | { el: null })>;

  // --- should ---
  should(assertion: "navigate"): Ret<Context, BrowserAndPage>;

  asPromise(): Promise<void>;
}

declare function makePypress(options?: {
  log?: (...args: any) => void;
}): Pypress;

export { makePypress };
