import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { handleError, ok, err } from "@/lib/api";
import { leadScopeFilter } from "@/lib/crm/access";
import { CUSTOMER_TYPES } from "@/lib/crm/workflow";
import { reconcileStaleAppointments } from "@/lib/crm/reconcile";

function isCustomerType(value: string): value is (typeof CUSTOMER_TYPES)[number] {
  return (CUSTOMER_TYPES as readonly string[]).includes(value);
}

export async function GET(req: Request) {
  try {
    const me = await requireRole("agent");
    await reconcileStaleAppointments();
    const url = new URL(req.url);
    const customerType = url.searchParams.get("customerType");
    const status = url.searchParams.get("status") ?? "scheduled";
    if (status !== "scheduled" && status !== "completed" && status !== "cancelled") {
      return err(400, "Invalid appointment status");
    }
    if (customerType && !isCustomerType(customerType)) return err(400, "Invalid customer type");

    const leadWhere: Record<string, unknown> = { ...leadScopeFilter(me) };
    if (customerType) leadWhere.customerType = customerType;

    const appointments = await prisma.leadAppointment.findMany({
      where: {
        status,
        ...(status === "scheduled" && { scheduledAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } }),
        lead: leadWhere,
      },
      orderBy: { scheduledAt: "asc" },
      take: 100,
      include: {
        lead: {
          select: {
            id: true,
            idNumber: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            city: true,
            customerType: true,
            status: true,
          },
        },
      },
    });

    return ok({
      appointments: appointments.map((a) => ({
        id: a.id,
        leadId: a.leadId,
        title: a.title,
        scheduledAt: a.scheduledAt.toISOString(),
        status: a.status,
        notes: a.notes ?? undefined,
        createdById: a.createdById ?? undefined,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        lead: {
          id: a.lead.id,
          idNumber: a.lead.idNumber,
          firstName: a.lead.firstName ?? undefined,
          lastName: a.lead.lastName ?? undefined,
          phone: a.lead.phone ?? undefined,
          email: a.lead.email ?? undefined,
          city: a.lead.city ?? undefined,
          customerType: a.lead.customerType,
          status: a.lead.status,
        },
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
