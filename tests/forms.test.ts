export {};

const isChecked = (id: string): Promise<boolean> =>
  py.evaluate(
    (id: any) => (document.getElementById(id) as HTMLInputElement).checked,
    id,
  );

it("check", async () => {
  py.goto(FIXTURES + "/form.html");

  expect(await isChecked("agree")).toBe(false);

  py.get("#agree").check();

  expect(await isChecked("agree")).toBe(true);
});

it("check is idempotent", async () => {
  py.goto(FIXTURES + "/form.html");

  py.get("#agree").check();
  py.check();

  expect(await isChecked("agree")).toBe(true);
});

it("check throws when nothing is selected", async () => {
  py.goto(FIXTURES + "/form.html");

  await expect(py.check()).rejects.toThrow("No element selected");

  // re-arm the chain so the `await py` in the test wrapper doesn't re-throw
  await py.sleep(1);
});
