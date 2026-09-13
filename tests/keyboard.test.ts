export {};

const valueOf = (id: string): Promise<string> =>
  py.evaluate(
    (id: any) => (document.getElementById(id) as HTMLInputElement).value,
    id,
  );

const recordedEvents = (): Promise<Array<string>> =>
  py.evaluate(() => (window as any).events);

const activeId = (): Promise<string> =>
  py.evaluate(() => (document.activeElement as HTMLElement).id);

// Assertions here go through document.activeElement rather than focus/blur
// events: the page has no system focus until a real input event arrives, and
// Chrome withholds those events from a document that doesn't have focus.
it("focus", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").focus();

  expect(await activeId()).toBe("username");
});

it("focus throws when nothing is selected", async () => {
  py.goto(FIXTURES + "/form.html");

  await expect(py.focus()).rejects.toThrow("No element selected");

  // re-arm the chain so the `await py` in the test wrapper doesn't re-throw
  await py.sleep(1);
});

it("blur", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").focus();
  py.blur();

  expect(await activeId()).toBe("");
});

it("blur throws when nothing is selected", async () => {
  py.goto(FIXTURES + "/form.html");

  await expect(py.blur()).rejects.toThrow("No element selected");

  await py.sleep(1);
});

it("type", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").type("hello");

  expect(await valueOf("username")).toBe("hello");
});

it("type focuses the selected element first", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").type("abc");
  expect(await activeId()).toBe("username");

  py.get("#alias").type("xyz");
  expect(await activeId()).toBe("alias");
  expect(await valueOf("username")).toBe("abc");
});

it("type inserts at the caret, which focusing leaves at the start", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#alias").type("!");

  expect(await valueOf("alias")).toBe("!preset");
});

it("keyPress", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").keyPress("a");

  expect(await valueOf("username")).toBe("a");

  const events = await recordedEvents();
  expect(events).toContain("keydown:a");
  expect(events).toContain("keyup:a");
});

it("keyPress with a non-printing key", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").type("hi");
  py.keyPress("Enter");

  const events = await recordedEvents();
  expect(events).toContain("keydown:Enter");
  expect(events).toContain("keyup:Enter");
  expect(await valueOf("username")).toBe("hi");
});

it("keyDown", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").keyDown("a");

  const events = await recordedEvents();
  expect(events).toContain("keydown:a");
  expect(events).not.toContain("keyup:a");
});

it("keyUp", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").keyDown("Shift");
  py.keyUp("Shift");

  const events = await recordedEvents();
  expect(events).toContain("keydown:Shift:shift");
  expect(events).toContain("keyup:Shift");
});

it("a key held by keyDown stays held for later commands", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").keyDown("Shift");
  py.keyPress("a");

  expect(await recordedEvents()).toContain("keydown:a:shift");

  py.keyUp("Shift");
  py.keyPress("a");

  expect(await recordedEvents()).toContain("keydown:a");
});

it("keyCharacter", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").keyCharacter("ü");

  expect(await valueOf("username")).toBe("ü");
});

it("keyCharacter does not dispatch key events", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").keyCharacter("z");

  expect(await valueOf("username")).toBe("z");

  const events = await recordedEvents();
  expect(events.some((event) => event.startsWith("keydown:"))).toBe(false);
  expect(events.some((event) => event.startsWith("keyup:"))).toBe(false);
});

it("clear", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#alias").clear();

  expect(await valueOf("alias")).toBe("");
});

it("clear then type replaces the value", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#alias").clear();
  py.type("replaced");

  expect(await valueOf("alias")).toBe("replaced");
});
