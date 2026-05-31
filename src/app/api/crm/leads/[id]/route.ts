import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, requireRole } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLead, serializeLeadPolicy, serializeLeadComm, serializeLeadAppointment } from "@/lib/crm/serializers";
import { canSeeLead, loadLead } from "@/lib/crm/access";
import { CUSTOMER_TYPES, LEAD_STATUSES, parseRequiredDate } from "@/lib/crm/workflow";
import { safeJSON } from "@/lib/json";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");

    const [policies, communications, appointments, importRows] = await Promise.all([
      prisma.leadPolicy.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: "desc" } }),
      prisma.leadCommunication.findMany({ where: { leadId: lead.id }, orderBy: { occurredAt: "desc" } }),
      prisma.leadAppointment.findMany({ where: { leadId: lead.id }, orderBy: { scheduledAt: "asc" } }),
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
      appointments: appointments.map(serializeLeadAppointment),
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
  customerType: z.enum(CUSTOMER_TYPES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
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
    const birthDate = body.birthDate !== undefined && body.birthDate ? parseRequiredDate(body.birthDate) : null;
    if (body.birthDate && !birthDate) return err(400, "Invalid birth date");

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
        ...(body.birthDate !== undefined && { birthDate }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.customerType !== undefined && { customerType: body.customerType }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.metadata !== undefined && { metadata: JSON.stringify({ ...safeJSON<Record<string, unknown>>(lead.metadata, {}), ...body.metadata }) }),
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
