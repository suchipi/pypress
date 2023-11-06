import type { Pypress } from "../pypress";

export default (pypress: Pypress) => {
  pypress.registerCommand("each", async (command, api) => {
    const array = api.context.lastReturnValue;
    for (const item of array) {
      await command.args[0](item);
    }
    return array;
  });

  pypress.registerCommand("end", async (command, api) => {
    return null;
  });

  pypress.registerCommand("invoke", async (command, api) => {
    api.context.lastReturnValue[command.args[0]](...command.args.slice(1));
  });

  pypress.registerCommand("its", async (command, api) => {
    return api.context.lastReturnValue[command.args[0]];
  });
};
