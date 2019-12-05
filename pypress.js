const CypressStyleAsync = require("cypress-style-async");

const pypress = new CypressStyleAsync({
  onError(error) {
    if (pypress.api.onError) {
      pypress.api.onError(error);
    }
  },
  onCommandRun(error) {
    if (pypress.api.onCommandRun) {
      pypress.api.onCommandRun(error);
    }
  },
});

module.exports = pypress;
