const makePypress = require("..");

const py = makePypress();
global.py = py;

afterEach(async () => {
  py.close();
  await py.asPromise();
});

global.FIXTURES = "http://localhost:3000";

expect.extend({
  async toHaveSelector(received, selector) {
    const exists = await py.checkIfExists(selector).asPromise();
    const pass = exists;
    return {
      pass,
      message: pass
        ? `expected element matching selector ${selector} not to exist`
        : `expected element matching selector ${selector} to exist`,
    };
  },
});

const realTest = test;
global.test = (description, testerFn) => {
  realTest(description, async () => {
    await testerFn();
    await py.asPromise();
  });
};
global.test.only = (description, testerFn) => {
  realTest.only(description, async () => {
    await testerFn();
    await py.asPromise();
  });
};
global.test.skip = (description, testerFn) => {
  realTest.skip(description, async () => {
    await testerFn();
    await py.asPromise();
  });
};

const realIt = it;
global.it = (description, testerFn) => {
  realIt(description, async () => {
    await testerFn();
    await py.asPromise();
  });
};
global.it.only = (description, testerFn) => {
  realIt.only(description, async () => {
    await testerFn();
    await py.asPromise();
  });
};
global.it.skip = (description, testerFn) => {
  realIt.skip(description, async () => {
    await testerFn();
    await py.asPromise();
  });
};
