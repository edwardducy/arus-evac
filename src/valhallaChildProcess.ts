import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { existsSync } from "node:fs";

let valhallaProcess: ChildProcessWithoutNullStreams | null = null;

function parseArgs(args: string | undefined): string[] {
  if (!args) {
    return [];
  }

  return args
    .split(" ")
    .map((arg) => arg.trim())
    .filter(Boolean);
}

export function startValhallaChildProcess() {
  if (valhallaProcess) {
    return;
  }

  const isEnabled = process.env.VALHALLA_CHILD_PROCESS !== "false";
  if (!isEnabled) {
    console.log(
      "[valhalla] child process disabled (VALHALLA_CHILD_PROCESS=false)",
    );
    return;
  }

  const configPath = process.env.VALHALLA_CONFIG;
  if (!configPath) {
    console.log("[valhalla] not started (VALHALLA_CONFIG is not set)");
    return;
  }

  if (!existsSync(configPath)) {
    console.error(
      `[valhalla] not started (config does not exist: ${configPath})`,
    );
    return;
  }

  const bin = process.env.VALHALLA_BIN || "valhalla_service";
  const workers = process.env.VALHALLA_WORKERS || "1";
  const extraArgs = parseArgs(process.env.VALHALLA_ARGS);
  const args = [configPath, workers, ...extraArgs];

  valhallaProcess = spawn(bin, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  valhallaProcess.stdout.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`[valhalla] ${text}`);
    }
  });

  valhallaProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      console.error(`[valhalla] ${text}`);
    }
  });

  valhallaProcess.on("error", (error) => {
    console.error("[valhalla] failed to start child process:", error);
    valhallaProcess = null;
  });

  valhallaProcess.on("exit", (code, signal) => {
    console.log(`[valhalla] process exited (code=${code}, signal=${signal})`);
    valhallaProcess = null;
  });

  console.log(
    `[valhalla] started child process: ${bin} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`,
  );
}

export function stopValhallaChildProcess() {
  if (!valhallaProcess) {
    return;
  }

  const child = valhallaProcess;
  valhallaProcess = null;

  child.kill("SIGTERM");
  const forceKillTimer = setTimeout(() => {
    if (child.exitCode === null) {
      child.kill("SIGKILL");
    }
  }, 3000);

  forceKillTimer.unref();
}
