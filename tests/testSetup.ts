import { expect, it as realIt, afterEach } from "vitest";
import { sleep } from "a-mimir";
import { makePypress } from "..";

const globalThisAsAny = globalThis as any;

globalThisAsAny.expect = expect;
globalThisAsAny.FIXTURES = "http://localhost:3000";

const py = makePypress();
globalThisAsAny.py = py;

afterEach(async () => {
  py.close();
  await py;
  await sleep.async(100);
});

expect.extend({
  async toHaveSelector(received, selector) {
    const exists = await py.checkIfExists(selector);
    const pass = exists;
    return {
      pass,
      message: () =>
        pass
          ? `expected element matching selector ${selector} not to exist`
          : `expected element matching selector ${selector} to exist`,
    };
  },
});

globalThisAsAny.it = (
  description: string,
  testerFn: () => void | Promise<void>,
) => {
  realIt(description, async () => {
    await testerFn();
    await py;
  });
};
globalThisAsAny.it.only = (
  description: string,
  testerFn: () => void | Promise<void>,
) => {
  realIt.only(description, async () => {
    await testerFn();
    await py;
  });
};
globalThisAsAny.it.skip = (
  description: string,
  testerFn: () => void | Promise<void>,
) => {
  realIt.skip(description, async () => {
    await testerFn();
    await py;
  });
};
