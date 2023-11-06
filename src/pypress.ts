import { CypressStyleAsync } from "cypress-style-async";
import type { CommandsMap, ChainContext } from "./types";

export class Pypress extends CypressStyleAsync<CommandsMap, ChainContext> {
  constructor({ log = () => {} }: { log?: (...args: any) => void } = {}) {
    super({
      onError: (error) => {
        log({
          type: "ERROR",
          error,
        });
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
  }
}
