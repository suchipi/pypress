const py = require("./index");
const repl = require("repl");
const chalk = require("chalk");

py.launch({ headless: false });

py.onCommandRun = (command) => {
  if (command.name === "evaluate") {
    console.log("Run:", { name: command.name });
  } else {
    console.log("Run:", command);
  }
};
py.onError = (error) => console.error("Error:", chalk.red(error.stack));

const replServer = repl.start();
replServer.context.py = py;
