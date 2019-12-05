const pypress = require("./pypress");
require("./commands/browser");
require("./commands/chaining");
require("./commands/cookies");
require("./commands/forms");
require("./commands/keyboard");
require("./commands/local-storage");
require("./commands/misc");
require("./commands/mouse");
require("./commands/query");
require("./commands/should");

const py = pypress.api;
module.exports = py;
