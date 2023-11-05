const path = require("path");
const child_process = require("child_process");
const { sleep } = require("a-mimir");

module.exports = async function globalSetup() {
  const child = child_process.exec(`http-server fixtures --port 3000`, {
    cwd: path.resolve(__dirname, "..")
  });
  globalThis._jest_http_server_child = child;

  await sleep.async(2000);
};
