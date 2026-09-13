import { vi, afterEach } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

it("sleep", async () => {
  const before = Date.now();
  await py.sleep(200);
  const elapsed = Date.now() - before;

  expect(elapsed).toBeGreaterThanOrEqual(190);
});

it("sleep defaults to 100ms", async () => {
  const before = Date.now();
  await py.sleep();
  const elapsed = Date.now() - before;

  expect(elapsed).toBeGreaterThanOrEqual(90);
});

it("getContext", async () => {
  py.goto(FIXTURES + "/index.html");

  const context = await py.getContext();

  expect(context.browser).toBeDefined();
  expect(context.page).toBeDefined();
});

it("getContext reflects the current selection", async () => {
  py.goto(FIXTURES + "/list.html");
  py.getAll("li.fruit").first();

  const context = await py.getContext();

  expect(context.els).toBe(undefined);
  expect(context.el).toBeDefined();
});

it("logContext", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  py.goto(FIXTURES + "/index.html");

  await py.logContext();

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0][0]).toHaveProperty("page");
});

it("logContext with a key", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  py.goto(FIXTURES + "/list.html");
  py.checkIfExists("h1");

  await py.logContext("exists");

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0][0]).toBe(true);
});

it("log", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});

  await py.log("hello", 42);

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0]).toEqual(["hello", 42]);
});

it("debug", async () => {
  py.goto(FIXTURES + "/index.html");

  await expect(py.debug()).resolves.toBeUndefined();
});

it("exec", async () => {
  const result = await py.exec("echo");

  expect(result.code).toBe(0);
  expect(Buffer.isBuffer(result.stdout)).toBe(true);
  expect(result.stdout.toString()).toBe("\n");
  expect(result.stderr.toString()).toBe("");
});

it("exec reports a nonzero exit code", async () => {
  const result = await py.exec("false");

  expect(result.code).toBe(1);
});
