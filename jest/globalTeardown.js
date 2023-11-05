module.exports = async function globalTeardown() {
  const child = globalThis._jest_http_server_child;
  if (!child) {
    throw new Error("_jest_http_server_child global was not present");
  }

  const succeeded = child.kill("SIGTERM");
  if (!succeeded) {
    console.log(child);
    throw new Error("kill failed");
  }
};
