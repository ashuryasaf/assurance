#!/usr/bin/env node
// Production startup: applies migrations, optionally seeds, then runs Next.
// Works both with `output: 'standalone'` builds and plain `next start` builds.
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

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

function banner(lines) {
  const sep = "=".repeat(64);
  console.log(`\n${sep}`);
  for (const line of lines) console.log(line);
  console.log(`${sep}\n`);
}

async function preflight() {
  const issues = [];
  const notes = [];

  if (!process.env.SESSION_SECRET) {
    notes.push(
      "SESSION_SECRET is not set in env. The app will generate (or reuse) a random secret on the data volume so login still works, but you should set this for production.",
    );
  } else if (process.env.SESSION_SECRET.length < 16) {
    issues.push(
      `SESSION_SECRET is only ${process.env.SESSION_SECRET.length} chars; need 16+. Generate a new one: openssl rand -base64 32`,
    );
  }

  if (!process.env.DATABASE_URL) {
    // Set a sensible default so prisma.config.ts can resolve env() during
    // migrate / generate / seed without the operator having to configure it.
    process.env.DATABASE_URL = "file:./data/app.db";
    notes.push("DATABASE_URL was not set; defaulted to file:./data/app.db");
  }

  // Verify the data dir is writable; SQLite + uploads need it.
  const dataDir = process.env.DATA_DIR || path.resolve(root, "data");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const probe = path.join(dataDir, ".write-test");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
  } catch (err) {
    issues.push(
      `Data directory ${dataDir} is not writable: ${err.message}. On Railway attach a Volume on /app/data.`,
    );
  }

  banner([
    "Assurance — production startup",
    `data dir : ${dataDir}`,
    `session  : ${process.env.SESSION_SECRET ? "from env" : "auto-generated (persisted to data dir)"}`,
    `database : ${process.env.DATABASE_URL || "file:./data/app.db (default)"}`,
    ...(notes.length ? ["", "notes:", ...notes.map((n) => `  • ${n}`)] : []),
    ...(issues.length ? ["", "blocking issues:", ...issues.map((i) => `  ✗ ${i}`)] : []),
  ]);

  if (issues.length) {
    console.error("[start] aborting: please fix the issues above and redeploy.");
    process.exit(1);
  }
}

async function main() {
  await preflight();

  try {
    console.log("[start] applying pending Prisma migrations ...");
    await run("npx", ["prisma", "migrate", "deploy"]);
  } catch (err) {
    console.warn("[start] migrate deploy failed:", err.message);
  }

  if (!process.env.SKIP_SEED) {
    try {
      console.log("[start] seeding database (idempotent) ...");
      await run("npx", ["tsx", "prisma/seed.ts"]);
    } catch (err) {
      console.warn("[start] seed failed:", err.message);
    }
  }

  const standalone = path.join(root, ".next", "standalone", "server.js");
  if (fs.existsSync(standalone)) {
    console.log("[start] launching standalone Next.js server ...");
    await run("node", [standalone], {
      env: { ...process.env, PORT: process.env.PORT || "3000", HOSTNAME: process.env.HOSTNAME || "0.0.0.0" },
    });
  } else {
    console.log("[start] launching Next.js production server ...");
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
