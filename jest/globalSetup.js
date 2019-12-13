const { setup: setupDevServer } = require("jest-dev-server");

module.exports = async function globalSetup() {
  await setupDevServer({
    command: `http-server fixtures --port 3000`,
    launchTimeout: 2000,
    port: 3000,
  });
};
