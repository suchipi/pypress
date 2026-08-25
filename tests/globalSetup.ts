import path from "path";
import child_process from "child_process";
import { sleep } from "a-mimir";

let child: child_process.ChildProcess;
export const setup = () => {
  child = child_process.exec(`npx http-server fixtures --port 3000`, {
    cwd: path.resolve(__dirname, ".."),
  });

  // wait for http-server to come up
  sleep.sync(400);
};

export const teardown = () => {
  child.kill("SIGTERM");
};
