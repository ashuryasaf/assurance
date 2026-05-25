#!/usr/bin/env node
// Production startup: applies migrations, optionally seeds, then runs Next.
// Works both with `output: 'standalone'` builds and plain `next start` builds.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...opts,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    child.on("error", reject);
  });
}

async function main() {
  console.log("[start] applying pending Prisma migrations ...");
  await run("npx", ["prisma", "migrate", "deploy"]);

  if (!process.env.SKIP_SEED) {
    try {
      console.log("[start] seeding database (idempotent) ...");
      await run("npx", ["tsx", "prisma/seed.ts"]);
    } catch (err) {
      console.warn("[start] seed failed:", err.message);
    }
  }

  const standalone = path.join(root, ".next", "standalone", "server.js");
  if (existsSync(standalone)) {
    console.log("[start] launching standalone Next.js server ...");
    await run("node", [standalone], {
      env: { ...process.env, PORT: process.env.PORT || "3000", HOSTNAME: process.env.HOSTNAME || "0.0.0.0" },
    });
  } else {
    console.log("[start] launching Next.js dev/prod server ...");
    await run("npx", [
      "next",
      "start",
      "-p",
      process.env.PORT || "3000",
      "-H",
      process.env.HOSTNAME || "0.0.0.0",
    ]);
  }
}

main().catch((err) => {
  console.error("[start]", err);
  process.exit(1);
});
