import "server-only";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/dal";
import { leadScopeFilter } from "@/lib/crm/access";

// There is no background worker in this app, so CRM read paths opportunistically
// reconcile overdue appointments before returning calendar/list/export data.
// Reconciliation is scoped to the leads the caller is allowed to see, so one
// tenant's browsing never mutates another agency's appointments or pipeline.
export async function reconcileStaleAppointments(me: CurrentUser, now = new Date()) {
  const scope = leadScopeFilter(me);

  await prisma.leadAppointment.updateMany({
    where: { status: "scheduled", scheduledAt: { lt: now }, lead: scope },
    data: { status: "completed" },
  });

  const staleScheduledLeads = await prisma.lead.findMany({
    where: {
      AND: [
        scope,
        { status: "scheduled", OR: [{ nextFollowUpAt: null }, { nextFollowUpAt: { lt: now } }] },
      ],
    },
    select: { id: true },
    take: 500,
  });

  for (const lead of staleScheduledLeads) {
    const next = await prisma.leadAppointment.findFirst({
      where: { leadId: lead.id, status: "scheduled", scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      select: { scheduledAt: true },
    });
    await prisma.lead.update({
      where: { id: lead.id },
      data: next
        ? { nextFollowUpAt: next.scheduledAt }
        : { status: "contacted", nextFollowUpAt: null },
    });
  }
}
