import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, requireRole, type CurrentUser } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLead, serializeLeadPolicy, serializeLeadComm } from "@/lib/crm/serializers";

function canSeeLead(me: CurrentUser, lead: { agencyId: string | null; agentId: string | null }): boolean {
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (me.agencyId && lead.agencyId === me.agencyId) return true;
  if (lead.agentId === me.id) return true;
  return false;
}

async function loadLead(idOrIdNumber: string) {
  // Allow looking up by either internal cuid id or by the unique idNumber.
  const byId = await prisma.lead.findUnique({ where: { id: idOrIdNumber } });
  if (byId) return byId;
  return prisma.lead.findUnique({ where: { idNumber: idOrIdNumber } });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");

    const [policies, communications, importRows] = await Promise.all([
      prisma.leadPolicy.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: "desc" } }),
      prisma.leadCommunication.findMany({ where: { leadId: lead.id }, orderBy: { occurredAt: "desc" } }),
      prisma.leadImportRow.findMany({
        where: { leadId: lead.id },
        orderBy: { id: "desc" },
        include: { import: { select: { id: true, fileName: true, createdAt: true } } },
        take: 50,
      }),
    ]);

    return ok({
      lead: serializeLead(lead),
      policies: policies.map(serializeLeadPolicy),
      communications: communications.map(serializeLeadComm),
      imports: importRows.map((r) => ({
        id: r.id,
        rowIndex: r.rowIndex,
        status: r.status,
        error: r.error ?? undefined,
        importId: r.importId,
        fileName: r.import.fileName,
        importedAt: r.import.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

const patchSchema = z.object({
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

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");
    const body = await parseJSON(req, patchSchema);
    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.altPhone !== undefined && { altPhone: body.altPhone }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.birthDate !== undefined && { birthDate: body.birthDate ? new Date(body.birthDate) : null }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.metadata !== undefined && { metadata: JSON.stringify(body.metadata) }),
      },
    });
    return ok({ lead: serializeLead(updated) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");
    await prisma.lead.delete({ where: { id: lead.id } });
    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
