const path = require("path");
const { expect } = require("expect");
const child_process = require("child_process");
const { sleep } = require("a-mimir");
const { makePypress } = require("..");

globalThis.expect = expect;

const child = child_process.exec(`npx http-server fixtures --port 3000`, {
  cwd: path.resolve(__dirname, ".."),
});

// wait for http-server to come up
sleep.sync(400);

globalThis.FIXTURES = "http://localhost:3000";

const py = makePypress();
globalThis.py = py;

afterEach(async () => {
  py.close();
  await py;
});

expect.extend({
  async toHaveSelector(received, selector) {
    const exists = await py.checkIfExists(selector);
    const pass = exists;
    return {
      pass,
      message: pass
        ? `expected element matching selector ${selector} not to exist`
        : `expected element matching selector ${selector} to exist`,
    };
  },
});

const realIt = globalThis.it;
globalThis.it = (description, testerFn) => {
  realIt(description, async () => {
    await testerFn();
    await py;
  });
};
globalThis.it.only = (description, testerFn) => {
  realIt.only(description, async () => {
    await testerFn();
    await py;
  });
};
globalThis.it.skip = (description, testerFn) => {
  realIt.skip(description, async () => {
    await testerFn();
    await py;
  });
};

process.on("exit", () => {
  child.kill("SIGTERM");
});
