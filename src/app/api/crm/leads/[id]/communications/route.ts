import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, requireRole } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLeadComm } from "@/lib/crm/serializers";
import { canSeeLead, loadLead } from "@/lib/crm/access";
import { CALL_OUTCOMES, parseRequiredDate, statusForCallOutcome } from "@/lib/crm/workflow";

const schema = z.object({
  channel: z.string().min(1),
  direction: z.enum(["inbound", "outbound"]).optional(),
  outcome: z.enum(CALL_OUTCOMES).optional(),
  summary: z.string().min(1),
  occurredAt: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");
    const body = await parseJSON(req, schema);
    const occurredAt = body.occurredAt ? parseRequiredDate(body.occurredAt) : new Date();
    if (!occurredAt) return err(400, "Invalid communication date");

    const created = await prisma.$transaction(async (tx) => {
      const communication = await tx.leadCommunication.create({
        data: {
          leadId: lead.id,
          channel: body.channel,
          direction: body.direction ?? "outbound",
          outcome: body.outcome,
          summary: body.summary,
          occurredAt,
        },
      });

      if (body.outcome) {
        const derivedStatus = statusForCallOutcome(body.outcome);
        // Appointments are the source of truth for scheduling: a call outcome
        // must not set "scheduled" on its own, nor demote a lead that still has
        // an upcoming scheduled appointment. Check for one regardless of the
        // lead's current status, since it may have been changed manually.
        const hasUpcomingAppointment = await tx.leadAppointment.findFirst({
          where: { leadId: lead.id, status: "scheduled", scheduledAt: { gte: new Date() } },
          select: { id: true },
        });
        const nextStatus =
          derivedStatus &&
          derivedStatus !== "scheduled" &&
          lead.status !== "customer" &&
          !hasUpcomingAppointment
            ? derivedStatus
            : undefined;
        // Don't record "appointment_scheduled" as the last outcome unless an
        // appointment actually exists, otherwise the UI implies a meeting that
        // was never booked.
        const recordOutcome =
          derivedStatus === "scheduled" && !hasUpcomingAppointment ? undefined : body.outcome;
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            ...(recordOutcome && { lastCallOutcome: recordOutcome }),
            ...(nextStatus && { status: nextStatus }),
          },
        });
      }

      return communication;
    });

    return ok({ communication: serializeLeadComm(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
