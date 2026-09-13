import { textOf } from "./helpers";

it("each", async () => {
  py.goto(FIXTURES + "/list.html");

  const seen: Array<string> = [];
  const result = await py.getAll("li.fruit").each(async (el) => {
    seen.push(await textOf(el));
  });

  expect(seen).toEqual(["Apple", "Banana", "Cherry", "Durian"]);
  expect(result).toHaveLength(4);
});

it("each passes the elements through unchanged", async () => {
  py.goto(FIXTURES + "/list.html");

  const passedThrough = await py.getAll("li.fruit").each(() => {});

  expect(passedThrough).toHaveLength(4);
  expect(await textOf(passedThrough[0])).toBe("Apple");
});

it("each over a non-element array", async () => {
  py.goto(FIXTURES + "/list.html");

  const seen: Array<any> = [];
  await py
    .evaluate(() => [1, 2, 3])
    .each((item) => {
      seen.push(item);
    });

  expect(seen).toEqual([1, 2, 3]);
});

it("end", async () => {
  py.goto(FIXTURES + "/list.html");

  const el = await py.get("h1");
  expect(el).toBeDefined();

  const ended = await py.get("h1").end();
  expect(ended).toBe(null);
});

it("end only clears the return value, not the element context", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get("li.fruit").end();

  // `first` reads context.els, which `end` leaves alone
  const first = await py.first();
  expect(await textOf(first)).toBe("Apple");
});

it("invoke", async () => {
  py.goto(FIXTURES + "/list.html");

  py.get("#ping").invoke("click");

  // `get` retries until it matches, so this waits for the click to land
  const log = await py.get("#ping-log:withText(pinged)");
  expect(await textOf(log)).toBe("pinged");
});

it("invoke forwards its extra arguments to the method", async () => {
  py.goto(FIXTURES + "/list.html");

  const els = await py.getAll("li.fruit");
  expect(els).toHaveLength(4);

  // `invoke` calls the method on the same array object `getAll` handed back
  await py.invoke("push", "extra");

  expect(els).toHaveLength(5);
  expect(els[4] as any).toBe("extra");
});

it("its", async () => {
  py.goto(FIXTURES + "/list.html");

  const length = await py.getAll("li.fruit").its("length");
  expect(length).toBe(4);
});

it("its reads a property off of a returned object", async () => {
  py.goto(FIXTURES + "/list.html");

  const href = await py.location().its("href");
  expect(href).toBe(FIXTURES + "/list.html");

  const protocol = await py.location().its("protocol");
  expect(protocol).toBe("http:");
});

it("its can be chained repeatedly", async () => {
  py.goto(FIXTURES + "/list.html");

  const firstChar = await py.location().its("protocol").its("0");
  expect(firstChar).toBe("h");
});
