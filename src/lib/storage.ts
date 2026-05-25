import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";

export function uploadsRoot(): string {
  return path.resolve(process.cwd(), "data/uploads");
}

export async function ensureUploadsDir(): Promise<string> {
  const dir = uploadsRoot();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export async function writeUpload(originalName: string, data: Buffer): Promise<{ relPath: string; absPath: string }> {
  const dir = await ensureUploadsDir();
  const sub = randomBytes(8).toString("hex");
  const subDir = path.join(dir, sub);
  await fs.mkdir(subDir, { recursive: true });
  const absPath = path.join(subDir, safeFilename(originalName) || "file");
  await fs.writeFile(absPath, data);
  return { relPath: path.relative(dir, absPath), absPath };
}

export async function readUpload(relPath: string): Promise<Buffer> {
  const dir = await ensureUploadsDir();
  const abs = path.resolve(dir, relPath);
  if (!abs.startsWith(dir)) throw new Error("Path traversal blocked");
  return fs.readFile(abs);
}

export async function removeUpload(relPath: string): Promise<void> {
  const dir = await ensureUploadsDir();
  const abs = path.resolve(dir, relPath);
  if (!abs.startsWith(dir)) return;
  try {
    await fs.unlink(abs);
  } catch {
    // ignore
  }
}
