import "server-only";
import { prisma } from "@/lib/db";

// There is no background worker in this app, so CRM read paths opportunistically
// reconcile overdue appointments before returning calendar/list/export data.
export async function reconcileStaleAppointments(now = new Date()) {
  await prisma.leadAppointment.updateMany({
    where: { status: "scheduled", scheduledAt: { lt: now } },
    data: { status: "completed" },
  });

  const staleScheduledLeads = await prisma.lead.findMany({
    where: {
      status: "scheduled",
      OR: [{ nextFollowUpAt: null }, { nextFollowUpAt: { lt: now } }],
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
