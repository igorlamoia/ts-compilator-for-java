import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const ideDir = path.resolve(scriptDir, "..");
const ideNodeModules = path.resolve(ideDir, "node_modules");
const localPrismaScope = path.resolve(ideNodeModules, "@prisma");
const localClientDir = path.resolve(localPrismaScope, "client");
const rootClientDir = path.resolve(
  ideDir,
  "..",
  "..",
  "node_modules",
  "@prisma",
  "client",
);

function ensureLocalClientLink() {
  if (fs.existsSync(localClientDir)) {
    return;
  }

  if (!fs.existsSync(rootClientDir)) {
    return;
  }

  fs.mkdirSync(localPrismaScope, { recursive: true });

  try {
    fs.symlinkSync(rootClientDir, localClientDir, "dir");
  } catch (error) {
    if (error && error.code === "EEXIST") {
      fs.rmSync(localClientDir, { recursive: true, force: true });
      fs.symlinkSync(rootClientDir, localClientDir, "dir");
      return;
    }

    throw error;
  }
}

ensureLocalClientLink();

const prismaArgs = process.argv.slice(2);
const commandArgs = prismaArgs.length > 0 ? prismaArgs : ["generate"];

const result = spawnSync("npx", ["prisma", ...commandArgs], {
  cwd: ideDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
