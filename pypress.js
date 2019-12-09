const CypressStyleAsync = require("cypress-style-async");

function makeLeakyPromise() {
  let resolve, reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}

class Pypress extends CypressStyleAsync {
  constructor({ log = () => {} } = {}) {
    super({
      onError: (error) => {
        log({
          type: "ERROR",
          error,
        });

        this.handleError(error);
      },
      onCommandRun: (command) => {
        log({
          type: "RUN",

          // Clone the command so they can't mess with it
          // and accidentally break the CypressStyleAsync
          command: {
            name: command.name,
            args: [...command.args],
            retryCount: command.retryCount,
          },
        });
      },
    });

    this._pendingPromises = [];

    this.api.asPromise = () => {
      const leakyPromise = makeLeakyPromise();

      this._pendingPromises.push(leakyPromise);

      this.api.then(() => leakyPromise.resolve());

      return leakyPromise.promise;
    };
  }

  handleError(err) {
    this._pendingPromises.forEach((leakyPromise) => {
      leakyPromise.reject(err);
    });
    this._pendingPromises = [];
  }
}

module.exports = Pypress;
