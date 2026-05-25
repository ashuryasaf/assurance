import "server-only";
import path from "node:path";
import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "assurance_session";
const ALG = "HS256";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
  userId: string;
  role: string;
};

export type SessionSecretSource = "env" | "persisted" | "ephemeral";

let cachedKey: Uint8Array | null = null;
let cachedSource: SessionSecretSource = "env";

function persistedSecretPath(): string {
  // The data directory is mounted as a Railway Volume in production, so a
  // secret persisted here survives redeploys. Falls back to cwd/data on dev.
  const root = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
  return path.join(root, ".session-secret");
}

function loadOrCreatePersistedSecret(): string {
  const target = persistedSecretPath();
  try {
    if (fs.existsSync(target)) {
      const value = fs.readFileSync(target, "utf8").trim();
      if (value.length >= 16) {
        cachedSource = "persisted";
        return value;
      }
    }
  } catch (err) {
    console.warn("[session] could not read persisted secret:", (err as Error).message);
  }

  const generated = randomBytes(48).toString("base64");
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, generated, { mode: 0o600 });
    fs.chmodSync(target, 0o600);
    cachedSource = "persisted";
    console.warn(
      [
        "",
        "============================================================",
        "[session] SESSION_SECRET is not set in the environment.",
        `[session] A random secret has been generated and persisted to`,
        `[session]   ${target}`,
        "[session] Sessions will continue to work across restarts as long as",
        "[session] this file (and the data volume) sticks around. For real",
        "[session] production, set SESSION_SECRET via your platform's env",
        "[session] (e.g. `openssl rand -base64 32`) and remove this file.",
        "============================================================",
        "",
      ].join("\n"),
    );
    return generated;
  } catch (err) {
    cachedSource = "ephemeral";
    console.warn(
      [
        "[session] Could not write a persisted secret to",
        `         ${target}: ${(err as Error).message}`,
        "[session] Falling back to a process-lifetime random key. All",
        "[session] sessions will invalidate on the next restart.",
        "[session] Set SESSION_SECRET via your platform's env to fix this.",
      ].join("\n"),
    );
    return generated;
  }
}

function getKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 16) {
    cachedSource = "env";
    cachedKey = new TextEncoder().encode(fromEnv);
    return cachedKey;
  }
  if (fromEnv && fromEnv.length > 0) {
    console.warn(
      `[session] SESSION_SECRET is set but only ${fromEnv.length} chars; need 16+. Falling back to a persisted secret.`,
    );
  }
  const fallback = loadOrCreatePersistedSecret();
  cachedKey = new TextEncoder().encode(fallback);
  return cachedKey;
}

export function getSessionSecretSource(): SessionSecretSource {
  // Force-initialise so cachedSource reflects reality.
  void getKey();
  return cachedSource;
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getKey());
}

export async function decryptSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: [ALG] });
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decryptSession(token);
}
