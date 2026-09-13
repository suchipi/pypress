export {};

const storageLength = (): Promise<number> =>
  py.evaluate(() => localStorage.length);

it("clearLocalStorage", async () => {
  py.goto(FIXTURES + "/storage.html");

  expect(await storageLength()).toBe(2);

  py.clearLocalStorage();

  expect(await storageLength()).toBe(0);
});

it("clearLocalStorage removes every key", async () => {
  py.goto(FIXTURES + "/storage.html");
  py.evaluate(() => {
    localStorage.setItem("added", "later");
  });

  py.clearLocalStorage();

  const stored = await py.evaluate(() => localStorage.getItem("stored"));
  const added = await py.evaluate(() => localStorage.getItem("added"));

  expect(stored).toBe(null);
  expect(added).toBe(null);
});

it("clearLocalStorage on a page with nothing stored", async () => {
  py.goto(FIXTURES + "/index.html");

  py.clearLocalStorage();

  expect(await storageLength()).toBe(0);
});
