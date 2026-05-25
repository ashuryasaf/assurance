// Operator CLI for the Assurance backend.
//
// Run with:
//   npx tsx scripts/admin.ts <command> [args...]
//   # or via npm aliases:
//   npm run admin:reset-password -- <email> <newPassword>
//   npm run admin:create-admin   -- <email> <password> [firstName] [lastName]
//   npm run admin:list-users
//   npm run admin:promote        -- <email> <role>
//
// Designed to be run on the server (e.g. `railway run`, `docker exec`) so the
// operator can recover access without having to log in through the UI first.
import "dotenv/config";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

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

const adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl() });
const prisma = new PrismaClient({ adapter });

const ROLES = new Set([
  "super_admin",
  "admin",
  "agency_owner",
  "agent",
  "sub_agent",
  "client",
]);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["all"],
  admin: ["all"],
  agency_owner: ["manage_agency", "manage_agents", "manage_clients", "view_reports"],
  agent: ["manage_clients", "view_reports", "manage_policies"],
  sub_agent: ["view_clients", "view_policies"],
  client: ["view_own"],
};

function bail(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(2);
}

function usage(): never {
  console.error(
    [
      "usage: tsx scripts/admin.ts <command> [...]",
      "",
      "commands:",
      "  reset-password <email> <newPassword>",
      "  create-admin   <email> <password> [firstName] [lastName]",
      "  list-users",
      "  promote        <email> <role>",
      "",
      "  roles: super_admin, admin, agency_owner, agent, sub_agent, client",
    ].join("\n"),
  );
  process.exit(2);
}

async function resetPassword(email: string, newPassword: string) {
  if (!email || !newPassword) bail("reset-password requires <email> and <newPassword>");
  if (newPassword.length < 8) bail("password must be at least 8 characters");
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) bail(`no user with email ${email}`);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, isActive: true },
  });
  console.log(`✔ password updated for ${user.email} (role: ${user.role})`);
}

async function createAdmin(
  email: string,
  password: string,
  firstName = "Admin",
  lastName = "User",
) {
  if (!email || !password) bail("create-admin requires <email> and <password>");
  if (password.length < 8) bail("password must be at least 8 characters");
  const lowered = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: lowered } });
  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: "super_admin",
        permissions: JSON.stringify(ROLE_PERMISSIONS.super_admin),
        isActive: true,
      },
    });
    console.log(`✔ promoted existing user ${lowered} to super_admin`);
  } else {
    const created = await prisma.user.create({
      data: {
        email: lowered,
        passwordHash,
        firstName,
        lastName,
        phone: "",
        idNumber: "",
        role: "super_admin",
        permissions: JSON.stringify(ROLE_PERMISSIONS.super_admin),
        isActive: true,
      },
    });
    console.log(`✔ created super_admin ${created.email} (id: ${created.id})`);
  }
}

async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLogin: true,
    },
  });
  if (users.length === 0) {
    console.log("(no users in database)");
    return;
  }
  for (const u of users) {
    const last = u.lastLogin ? u.lastLogin.toISOString() : "never";
    console.log(
      `${u.email.padEnd(36)} ${u.role.padEnd(13)} ${u.isActive ? "active" : "DISABLED"}  last:${last}  ${u.firstName} ${u.lastName}`.trim(),
    );
  }
}

async function promote(email: string, role: string) {
  if (!email || !role) bail("promote requires <email> and <role>");
  if (!ROLES.has(role)) bail(`unknown role '${role}'. Allowed: ${[...ROLES].join(", ")}`);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) bail(`no user with email ${email}`);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role,
      permissions: JSON.stringify(ROLE_PERMISSIONS[role] ?? ["view_own"]),
      isActive: true,
    },
  });
  console.log(`✔ ${user.email} is now ${role}`);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd) usage();
  try {
    switch (cmd) {
      case "reset-password":
        await resetPassword(rest[0], rest[1]);
        break;
      case "create-admin":
        await createAdmin(rest[0], rest[1], rest[2], rest[3]);
        break;
      case "list-users":
        await listUsers();
        break;
      case "promote":
        await promote(rest[0], rest[1]);
        break;
      default:
        console.error(`unknown command: ${cmd}`);
        usage();
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
