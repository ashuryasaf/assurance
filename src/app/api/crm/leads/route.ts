import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, type CurrentUser } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLead } from "@/lib/crm/serializers";
import { normaliseIdNumber } from "@/lib/crm/parse";

function canModifyLead(me: CurrentUser, lead: { agencyId: string | null; agentId: string | null }): boolean {
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (me.agencyId && lead.agencyId === me.agencyId) return true;
  if (lead.agentId === me.id) return true;
  return false;
}

function leadScopeFilter(me: CurrentUser) {
  if (me.role === "super_admin" || me.role === "admin") return {};
  if (me.role === "agency_owner" && me.agencyId) return { agencyId: me.agencyId };
  // agents and sub-agents: their own leads OR leads assigned to them.
  return { OR: [{ agentId: me.id }, { agencyId: me.agencyId ?? undefined }] };
}

export async function GET(req: Request) {
  try {
    const me = await requireRole("agent");
    const url = new URL(req.url);
    const search = url.searchParams.get("q")?.trim() ?? "";
    const status = url.searchParams.get("status");
    const where: Record<string, unknown> = { ...leadScopeFilter(me) };
    if (status) where.status = status;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 500,
      include: {
        _count: { select: { policies: true, communications: true } },
      },
    });

    const filtered = search
      ? leads.filter((l) => {
          const blob = `${l.idNumber} ${l.firstName ?? ""} ${l.lastName ?? ""} ${l.email ?? ""} ${l.phone ?? ""}`.toLowerCase();
          return blob.includes(search.toLowerCase());
        })
      : leads;

    return ok({
      leads: filtered.map((l) => ({
        ...serializeLead(l),
        policyCount: l._count.policies,
        communicationCount: l._count.communications,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

const createSchema = z.object({
  idNumber: z.string().min(3),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const body = await parseJSON(req, createSchema);
    const idNumber = normaliseIdNumber(body.idNumber);
    if (!idNumber) return err(400, "Invalid Israeli ID number");

    const existing = await prisma.lead.findUnique({ where: { idNumber } });
    if (existing && !canModifyLead(me, existing)) {
      return err(403, "Lead belongs to another tenant");
    }

    let lead;
    if (existing) {
      lead = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          firstName: body.firstName ?? undefined,
          lastName: body.lastName ?? undefined,
          email: body.email || undefined,
          phone: body.phone ?? undefined,
          altPhone: body.altPhone ?? undefined,
          address: body.address ?? undefined,
          city: body.city ?? undefined,
          birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
          gender: body.gender ?? undefined,
          source: body.source ?? undefined,
          status: body.status ?? undefined,
          notes: body.notes ?? undefined,
          ...(body.metadata && { metadata: JSON.stringify(body.metadata) }),
        },
      });
    } else {
      lead = await prisma.lead.create({
        data: {
          idNumber,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email || null,
          phone: body.phone,
          altPhone: body.altPhone,
          address: body.address,
          city: body.city,
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          gender: body.gender,
          source: body.source,
          status: body.status ?? "new",
          notes: body.notes,
          metadata: JSON.stringify(body.metadata ?? {}),
          agentId: me.id,
          agencyId: me.agencyId,
        },
      });
    }
    return ok({ lead: serializeLead(lead) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
