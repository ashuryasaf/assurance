import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, toCurrentUser } from "@/lib/dal";
import { createSession } from "@/lib/session";
import { handleError, ok, parseJSON, err } from "@/lib/api";

// Issue a new invitation token (agents+).
const issueSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["client", "sub_agent", "agent"]).default("client"),
  expiresInDays: z.number().int().min(1).max(90).default(14),
});

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const body = await parseJSON(req, issueSchema);
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000);

    const invite = await prisma.inviteToken.create({
      data: {
        token,
        email: body.email,
        role: body.role,
        agencyId: me.agencyId,
        parentAgentId: me.id,
        issuedById: me.id,
        expiresAt,
      },
    });

    return ok({ token: invite.token, expiresAt: invite.expiresAt.toISOString() });
  } catch (error) {
    return handleError(error);
  }
}

// Consume an invitation token to register a new user.
const consumeSchema = z.object({
  token: z.string().min(8),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  idNumber: z.string().min(1),
});

export async function PUT(req: Request) {
  try {
    const data = await parseJSON(req, consumeSchema);
    const invite = await prisma.inviteToken.findUnique({ where: { token: data.token } });
    if (!invite) return err(404, "Invite not found");
    if (invite.usedAt) return err(410, "Invite already used");
    if (invite.expiresAt < new Date()) return err(410, "Invite expired");

    const email = data.email.toLowerCase().trim();
    if (invite.email && invite.email.toLowerCase().trim() !== email) {
      return err(403, "This invite was issued for a different email address");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return err(409, "Email already registered");

    const passwordHash = await bcrypt.hash(data.password, 10);

    const defaultPermissions: Record<string, string[]> = {
      client: ["view_own"],
      sub_agent: ["view_clients", "view_policies"],
      agent: ["manage_clients", "view_reports", "manage_policies"],
    };

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        idNumber: data.idNumber,
        role: invite.role,
        permissions: JSON.stringify(defaultPermissions[invite.role] ?? ["view_own"]),
        agencyId: invite.agencyId,
        parentAgentId: invite.parentAgentId,
        isActive: true,
        lastLogin: new Date(),
      },
    });
    await prisma.inviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    await createSession({ userId: user.id, role: user.role });
    return ok({ user: toCurrentUser(user) });
  } catch (error) {
    return handleError(error);
  }
}
