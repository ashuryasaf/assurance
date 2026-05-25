import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionSecretSource } from "@/lib/session";

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

  const ready = dbOk && (userCount ?? 0) > 0;
  const warnings: string[] = [];
  if (!sessionEnvSet) {
    warnings.push(
      "SESSION_SECRET is not set. A persisted secret in /app/data/.session-secret is being used. Set SESSION_SECRET in the environment for production.",
    );
  }
  if (sessionSource === "ephemeral") {
    warnings.push(
      "Session secret is process-ephemeral; sessions will be invalidated on every restart. Mount a persistent volume or set SESSION_SECRET.",
    );
  }
  if (dbOk && userCount === 0) {
    warnings.push(
      "Database has no users. The seed did not run (or the database was reset). Run `npm run admin:create-admin <email> <password>`.",
    );
  }

  const body = {
    status: ready ? "ok" : "degraded",
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

  return NextResponse.json(body, { status: ready ? 200 : 503 });
}
