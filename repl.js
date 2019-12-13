#!/usr/bin/env node
const chalk = require("chalk");
const repl = require("repl");
const makePypress = require("./index");

const py = makePypress({
  log: (message) => {
    switch (message.type) {
      case "RUN": {
        if (message.command.name === "evaluate") {
          delete message.command.args;
        }

        console.log(chalk.blue("RUN:"), message.command);
        break;
      }
      case "ERROR": {
        console.log(
          chalk.red("ERROR:"),
          message.error && message.error.stack
            ? message.error.stack
            : message.error
        );
        break;
      }
    }
  },
});

py.launch({ headless: false });

const replServer = repl.start();
Object.assign(replServer.context, {
  py,
});
