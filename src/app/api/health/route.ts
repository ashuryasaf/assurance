import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionSecretSource } from "@/lib/session";

// Liveness / readiness endpoint.
//
// Status semantics (Railway's healthcheck reads HTTP status):
//   200 ok        — process is up AND the database is reachable.
//                   An empty `User` table is *not* fatal — the operator may
//                   bootstrap accounts via `npm run admin:create-admin` or by
//                   re-running the seed once the data volume is mounted. We
//                   surface that situation as a warning, not as 503, so the
//                   container is not killed for a recoverable misconfig.
//   503 degraded  — the database is unreachable. This is the only case where
//                   the platform should restart the container, because there
//                   is nothing the running app can do about it.
export async function GET() {
  let dbOk = false;
  let userCount: number | null = null;
  let leadCount: number | null = null;
  let dbError: string | undefined;
  try {
    userCount = await prisma.user.count();
    leadCount = await prisma.lead.count();
    dbOk = true;
  } catch (err) {
    dbError = (err as Error).message;
  }

  const sessionSource = getSessionSecretSource();
  const sessionEnvSet = !!process.env.SESSION_SECRET;
  const databaseUrlSet = !!process.env.DATABASE_URL;

  const warnings: string[] = [];
  if (!sessionEnvSet) {
    warnings.push(
      "SESSION_SECRET is not set. A persisted secret in the data volume is being used. Set SESSION_SECRET in the environment for production.",
    );
  }
  if (sessionSource === "ephemeral") {
    warnings.push(
      "Session secret is process-ephemeral; sessions will be invalidated on every restart. Mount a persistent volume on /app/data or set SESSION_SECRET.",
    );
  }
  if (dbOk && userCount === 0) {
    warnings.push(
      "Database is reachable but has no users. Re-run the seed or create the first admin via `npm run admin:create-admin -- <email> <password>`.",
    );
  }
  if (!dbOk) {
    warnings.push(
      `Database is unreachable: ${dbError ?? "unknown error"}. Check DATABASE_URL and the data volume mount.`,
    );
  }

  const body = {
    status: dbOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    service: "assurance",
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    setup: {
      databaseConnected: dbOk,
      databaseError: dbError,
      databaseUrlSet,
      userCount,
      leadCount,
      sessionSecretSource: sessionSource,
      sessionSecretEnvSet: sessionEnvSet,
    },
    warnings,
  };

  return NextResponse.json(body, { status: dbOk ? 200 : 503 });
}
