import chokidar from "chokidar";
import { spawn, spawnSync, ChildProcess } from "child_process";
import { ArgumentParser } from "argparse";

function sequence<T>(fa: () => any, fb: () => T): (...args: any) => T {
  return () => {
    fa();
    return fb();
  };
}

class Watcher {
  private logger: (...x: any) => void;

  private watchPath: string;
  private reactCommand: string[];

  private fsWatcher: chokidar.FSWatcher | undefined;

  private rerunQueued = false;
  private commandProcess: ChildProcess | undefined;
  private commandPromise = Promise.resolve();

  constructor(watchPath: string, reactCommand: string[], verbose: boolean) {
    this.logger = verbose ? (...x) => console.log("[watch.ts]", ...x) : () => { };

    this.watchPath = watchPath;
    this.reactCommand = reactCommand;

  }

  private killCurrent(): void {
    if (this.commandProcess) {
      const { pid } = this.commandProcess;
      this.logger("Killing", pid);
      // Negating the PID kills the process group.
      // Process must be detached!
      spawnSync("kill", ["-INT", `-${pid}`], { stdio: 'inherit' });
    }
  }

  private runCommand(): Promise<void> {
    return new Promise((resolve) => {
      this.logger("Running", this.reactCommand);
      this.rerunQueued = false;
      this.commandProcess = spawn(
        this.reactCommand[0],
        this.reactCommand.slice(1), { stdio: 'inherit', detached: true });
      this.commandProcess.on("exit", () => {
        this.logger("Command exited");
        this.commandProcess = undefined;
        resolve();
      });
    });
  }

  private queueRerun(): void {
    if (this.rerunQueued) {
      this.logger("Ignoring change, command already queued");
      return;
    }

    this.rerunQueued = true;
    this.killCurrent();
    this.commandPromise = this.commandPromise.then(this.runCommand.bind(this));
  }

  public run(): void {
    const killAndClose = sequence(this.killCurrent.bind(this), () => this.fsWatcher?.close());

    process.on('SIGINT', killAndClose);
    process.on('SIGQUIT', killAndClose);
    process.on('SIGTERM', killAndClose);

    this.fsWatcher = chokidar.watch(this.watchPath, { ignoreInitial: true })
    this.fsWatcher.on('all', (event, path) => {
      this.logger(path, event);
      this.queueRerun();
    });
    this.queueRerun();
  }
};

function main(): void {
  const parser = new ArgumentParser({ description: 'Argparse example' });
  parser.add_argument('-p', '--path', { help: 'watch path', required: true });
  parser.add_argument('-c', '--commandArgs', { help: 'the command to execute', nargs: '+', required: true });
  parser.add_argument('-v', '--verbose', { help: 'be verbose', action: 'store_true' });

  const args = parser.parse_args();

  const watchPath = args.path;
  const reactCommand = args.commandArgs;
  const verbose = Boolean(args.verbose);

  const watcher = new Watcher(watchPath, reactCommand, verbose);
  watcher.run();
}

main();
