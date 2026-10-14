import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(projectRoot);

const [command, ...args] = process.argv.slice(2);
const target = command === "seed"
  ? path.join(projectRoot, "prisma", "seed.mjs")
  : path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
const childArgs = command === "seed" ? [target] : [target, command, ...args];

const child = spawn(process.execPath, childArgs, {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start Prisma: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
