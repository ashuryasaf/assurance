import "server-only";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveSqliteUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("file:")) {
    const rest = url.slice("file:".length);
    if (rest.startsWith("/") || rest.startsWith("./") || rest.startsWith("../")) {
      const abs = path.resolve(process.cwd(), rest.replace(/^\.\//, ""));
      return `file:${abs}`;
    }
    return url;
  }
  return `file:${path.resolve(process.cwd(), "data/app.db")}`;
}

function createPrisma(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
