const child_process = require("child_process");

module.exports = (pypress) => {
  const py = pypress.api;

  pypress.registerCommand("sleep", async (command, api) => {
    await api.sleep(command.args[0] || 100);
  });

  pypress.registerCommand("logContext", async (command, api) => {
    if (command.args[0]) {
      console.log(api.context[command.args[0]]);
    } else {
      console.log(api.context);
    }
  });

  pypress.registerCommand("then", async (command, api) => {
    await command.args[0](api.context);
  });

  pypress.registerCommand("debug", async (command, api) => {
    py.then((context) => {
      debugger;
    });
  });

  pypress.registerCommand("exec", async (command, api) => {
    const result = child_process.spawnSync(command.args[0]);
    return {
      code: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  });

  pypress.registerCommand("log", async (command, api) => {
    console.log(...command.args);
  });
};
