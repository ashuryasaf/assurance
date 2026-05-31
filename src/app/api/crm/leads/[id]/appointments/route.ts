import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, requireRole } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLeadAppointment } from "@/lib/crm/serializers";
import { canSeeLead, loadLead } from "@/lib/crm/access";
import { parseRequiredDate } from "@/lib/crm/workflow";

const schema = z.object({
  title: z.string().trim().max(120).optional(),
  scheduledAt: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");

    const appointments = await prisma.leadAppointment.findMany({
      where: { leadId: lead.id },
      orderBy: { scheduledAt: "asc" },
    });

    return ok({ appointments: appointments.map(serializeLeadAppointment) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");

    const body = await parseJSON(req, schema);
    const scheduledAt = parseRequiredDate(body.scheduledAt);
    if (!scheduledAt) return err(400, "Invalid appointment date");
    const now = new Date();
    if (scheduledAt.getTime() < now.getTime() - 60_000) return err(400, "Appointment must be in the future");

    const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.idNumber;
    const title = body.title?.trim() || `Follow-up call with ${name}`;
    const customerDetails = [`ID: ${lead.idNumber}`, lead.phone ? `Phone: ${lead.phone}` : null, lead.email ? `Email: ${lead.email}` : null]
      .filter(Boolean)
      .join(" | ");
    const notes = [customerDetails, body.notes?.trim()].filter(Boolean).join("\n");

    const created = await prisma.$transaction(async (tx) => {
      const appointment = await tx.leadAppointment.create({
        data: {
          leadId: lead.id,
          title,
          scheduledAt,
          notes: notes || null,
          createdById: me.id,
        },
      });

      const next = await tx.leadAppointment.findFirst({
        where: { leadId: lead.id, status: "scheduled", scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
      });

      await tx.lead.update({
        where: { id: lead.id },
        data: {
          nextFollowUpAt: next?.scheduledAt ?? null,
          lastCallOutcome: "appointment_scheduled",
          ...(lead.status !== "customer" && { status: "scheduled" }),
        },
      });

      return appointment;
    });

    return ok({ appointment: serializeLeadAppointment(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
