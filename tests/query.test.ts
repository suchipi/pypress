import { textOf, tagOf, idOf } from "./helpers";

it("_loadSizzle", async () => {
  py.goto(FIXTURES + "/list.html");
  py._loadSizzle();

  const typeofSizzle = await py.evaluate(() => typeof (window as any).Sizzle);
  expect(typeofSizzle).toBe("function");

  const typeofWithText = await py.evaluate(
    () => typeof (window as any).Sizzle.selectors.pseudos.withText,
  );
  expect(typeofWithText).toBe("function");
});

it("_updateTargetUI", async () => {
  py.goto(FIXTURES + "/list.html");

  // getAll marks context.els yellow
  py.getAll("li.fruit");
  const asEls = await py.evaluate(
    () =>
      (document.querySelector("li.fruit") as HTMLElement).style.outline as any,
  );
  expect(asEls).toContain("yellow");

  // first() moves it to context.el, which is marked red instead
  py.first();
  const asEl = await py.evaluate(
    () =>
      (document.querySelector("li.fruit") as HTMLElement).style.outline as any,
  );
  expect(asEl).toContain("red");
});

it("getAll", async () => {
  py.goto(FIXTURES + "/list.html");

  const els = await py.getAll("li.fruit");
  expect(els).toHaveLength(4);
  expect(await textOf(els[0])).toBe("Apple");
  expect(await textOf(els[3])).toBe("Durian");
});

it("getAll with allowNonExistent returns an empty array", async () => {
  py.goto(FIXTURES + "/list.html");

  const els = await py.getAll("#definitely-not-here", {
    allowNonExistent: true,
  });
  expect(els).toEqual([]);
});

it("get", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.get("li.fruit");
  expect(await textOf(el)).toBe("Apple");
});

it("get returns the deepest match for a :withText selector", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.get(":withText(Banana)");
  expect(await tagOf(el)).toBe("LI");
  expect(await textOf(el)).toBe("Banana");
});

it("checkIfExists", async () => {
  py.goto(FIXTURES + "/list.html");

  expect(await py.checkIfExists("h1")).toBe(true);
  expect(await py.checkIfExists("#definitely-not-here")).toBe(false);
});

it("checkIfExists records the result on the context", async () => {
  py.goto(FIXTURES + "/list.html");

  py.checkIfExists("#fruits");
  const context = await py.getContext();
  expect(context.exists).toBe(true);
});

it("getByText", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getByText("Cherry");
  expect(await tagOf(el)).toBe("LI");
  expect(await textOf(el)).toBe("Cherry");
});

it("getByText matches case-insensitively", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getByText("cHeRrY");
  expect(await textOf(el)).toBe("Cherry");
});

it("contains is an alias for getByText", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.contains("Durian");
  expect(await textOf(el)).toBe("Durian");
});

it("getInputForLabel", async () => {
  py.goto(FIXTURES + "/form.html");

  const el = await py.getInputForLabel("Username");
  expect(await tagOf(el)).toBe("INPUT");
  expect(await idOf(el)).toBe("username");
});

it("first", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").first();
  expect(await textOf(el)).toBe("Apple");
});

it("second", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").second();
  expect(await textOf(el)).toBe("Banana");
});

it("third", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").third();
  expect(await textOf(el)).toBe("Cherry");
});

it("last", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").last();
  expect(await textOf(el)).toBe("Durian");
});

it("at", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").at(1);
  expect(await textOf(el)).toBe("Banana");
});

it("eq is an alias for at", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").eq(2);
  expect(await textOf(el)).toBe("Cherry");
});

it("first throws when nothing is selected", async () => {
  py.goto(FIXTURES + "/list.html");

  await expect(py.first()).rejects.toThrow("No elements selected");

  // re-arm the chain so the `await py` in the test wrapper doesn't re-throw
  await py.sleep(1);
});

it("filter narrows context.els", async () => {
  py.goto(FIXTURES + "/list.html");

  py.getAll("li.fruit").filter(".ripe");

  const context = await py.getContext();
  expect(context.els).toHaveLength(2);
  expect(await textOf(context.els![0])).toBe("Apple");
  expect(await textOf(context.els![1])).toBe("Cherry");
});

it("filter resolves to the narrowed element list", async () => {
  py.goto(FIXTURES + "/list.html");

  const returned = await py.getAll("li.fruit").filter(".ripe");

  expect(returned).toHaveLength(2);
  expect(await textOf(returned[0])).toBe("Apple");
  expect(await textOf(returned[1])).toBe("Cherry");
});

it("filter feeds the narrowed list to the positional commands", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.getAll("li.fruit").filter(".ripe").last();
  expect(await textOf(el)).toBe("Cherry");
});

it("not", async () => {
  py.goto(FIXTURES + "/list.html");

  py.getAll("li.fruit").not(".ripe");

  const context = await py.getContext();
  expect(context.els).toHaveLength(2);
  expect(await textOf(context.els![0])).toBe("Banana");
  expect(await textOf(context.els![1])).toBe("Durian");
});

it("closest finds a matching ancestor", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get(".leaf");
  // Resolving at all means an ancestor matched; a miss retries and then throws.
  await expect(py.closest("#outer")).resolves.toBeDefined();
});

it("closest yields a usable element handle", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get(".leaf");
  const parent = await py.closest("#outer");

  expect(await idOf(parent)).toBe("outer");
  expect(await tagOf(parent)).toBe("DIV");
});

it("closest leaves a usable element on the context", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get(".leaf").closest("#outer");
  const el = await py.find(".leaf");

  expect(await textOf(el)).toBe("Inner One");
});

it("closest stops at the nearest matching ancestor", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get(".leaf");
  const parent = await py.closest("div");

  expect(await idOf(parent)).toBe("inner");
});

it("closest throws when no ancestor matches", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get(".leaf");
  await expect(py.closest("#fruits")).rejects.toThrow(
    "Could not find a parent element",
  );

  // re-arm the chain so the `await py` in the test wrapper doesn't re-throw
  await py.sleep(1);
});

it("within scopes queries to the current element", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get("#inner");
  const scoped = await py.within(() => py.getAll(".leaf"));

  expect(scoped).toHaveLength(2);
  expect(await textOf(scoped[0])).toBe("Inner One");
  expect(await textOf(scoped[1])).toBe("Inner Two");
});

it("within stops scoping once the callback is done", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get("#inner");
  await py.within(() => py.getAll(".leaf"));

  const all = await py.getAll(".leaf");
  expect(all).toHaveLength(3);
});

it("find", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.get("#inner").find(".leaf");
  expect(await textOf(el)).toBe("Inner One");
});

it("find does not reach outside of the current element", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get("#inner");
  const scoped = await py.within(() => py.getAll(".leaf"));
  const texts = await Promise.all(scoped.map(textOf));

  expect(texts).not.toContain("Outer Leaf");
});

it("focused", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#username").focus();
  const el = await py.focused();

  expect(await idOf(el)).toBe("username");
});

it("focused falls back to body when nothing is focused", async () => {
  py.goto(FIXTURES + "/form.html");

  const el = await py.focused();
  expect(await tagOf(el)).toBe("BODY");
});
