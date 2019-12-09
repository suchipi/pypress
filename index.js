const Pypress = require("./pypress");

module.exports = function makePypress({ log = () => {} } = {}) {
  const pypress = new Pypress({ log });

  [
    require("./commands/browser"),
    require("./commands/chaining"),
    require("./commands/cookies"),
    require("./commands/forms"),
    require("./commands/keyboard"),
    require("./commands/local-storage"),
    require("./commands/misc"),
    require("./commands/mouse"),
    require("./commands/query"),
    require("./commands/should"),
  ].forEach((builder) => {
    builder(pypress);
  });

  const py = pypress.api;

  return py;
};
