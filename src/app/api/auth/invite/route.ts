import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, toCurrentUser, type CurrentUser } from "@/lib/dal";
import { createSession } from "@/lib/session";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { safeJSON } from "@/lib/json";
import { CUSTOMER_TYPES, type CustomerType } from "@/lib/crm/workflow";
import { crmCustomerTypePermission } from "@/lib/crm/access";

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  client: ["view_own"],
  sub_agent: ["view_clients", "view_policies"],
  agent: ["manage_clients", "view_reports", "manage_policies"],
};

// Issue a new invitation token (agents+).
const issueSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["client", "sub_agent", "agent"]).default("client"),
  agencyId: z.string().optional(),
  crmCustomerTypes: z.array(z.enum(CUSTOMER_TYPES)).optional(),
  expiresInDays: z.number().int().min(1).max(90).default(14),
});

function canManageAgentInvites(me: CurrentUser): boolean {
  return me.role === "super_admin" || me.role === "admin" || me.role === "agency_owner";
}

function buildPermissions(role: string, customerTypes: CustomerType[] | undefined): string[] {
  const permissions = [...(DEFAULT_PERMISSIONS[role] ?? ["view_own"])]
  const uniqueTypes = Array.from(new Set(customerTypes ?? []));
  if ((role === "agent" || role === "sub_agent") && uniqueTypes.length > 0 && uniqueTypes.length < CUSTOMER_TYPES.length) {
    permissions.push(...uniqueTypes.map(crmCustomerTypePermission));
  }
  return permissions;
}

async function resolveInviteAgencyId(me: CurrentUser, requestedAgencyId: string | undefined, role: string): Promise<string | null> {
  const agencyId = requestedAgencyId ?? me.agencyId ?? null;
  if (role !== "client" && !agencyId) throw new InviteValidationError("Agent invites require an agency");
  if ((me.role === "agent" || me.role === "sub_agent") && requestedAgencyId && requestedAgencyId !== me.agencyId) {
    throw new InviteValidationError("Cannot invite users to another agency");
  }
  if (me.role === "agency_owner" && requestedAgencyId && requestedAgencyId !== me.agencyId) {
    throw new InviteValidationError("Cannot invite users to another agency");
  }
  if (agencyId) {
    const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { id: true } });
    if (!agency) throw new InviteValidationError("Agency not found");
  }
  return agencyId;
}

class InviteValidationError extends Error {}

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const body = await parseJSON(req, issueSchema);
    if ((body.role === "agent" || body.role === "sub_agent") && !canManageAgentInvites(me)) {
      return err(403, "Only agency owners and admins can invite agents");
    }

    const agencyId = await resolveInviteAgencyId(me, body.agencyId, body.role);
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000);
    const permissions = buildPermissions(body.role, body.crmCustomerTypes);

    const invite = await prisma.inviteToken.create({
      data: {
        token,
        email: body.email,
        role: body.role,
        agencyId,
        parentAgentId: body.role === "client" ? me.id : null,
        permissions: JSON.stringify(permissions),
        issuedById: me.id,
        expiresAt,
      },
    });

    return ok({ token: invite.token, expiresAt: invite.expiresAt.toISOString(), permissions });
  } catch (error) {
    if (error instanceof InviteValidationError) return err(400, error.message);
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
    const permissions = invite.permissions
      ? safeJSON<string[]>(invite.permissions, DEFAULT_PERMISSIONS[invite.role] ?? ["view_own"])
      : DEFAULT_PERMISSIONS[invite.role] ?? ["view_own"];

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        idNumber: data.idNumber,
        role: invite.role,
        permissions: JSON.stringify(permissions),
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
