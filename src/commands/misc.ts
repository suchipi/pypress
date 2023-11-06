import { sleep } from "a-mimir";
import child_process from "child_process";
import type { Pypress } from "../pypress";

export default (pypress: Pypress) => {
  const py = pypress.api;

  pypress.registerCommand("sleep", async (command, api) => {
    await sleep.async(command.args[0] || 100);
  });

  pypress.registerCommand("logContext", async (command, api) => {
    if (command.args[0]) {
      console.log(api.context[command.args[0]]);
    } else {
      console.log(api.context);
    }
  });

  pypress.registerCommand("getContext", async (command, api) => {
    return api.context;
  });

  pypress.registerCommand("debug", async (command, api) => {
    py.getContext().then((context) => {
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
