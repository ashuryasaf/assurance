import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLead } from "@/lib/crm/serializers";
import { normaliseIdNumber } from "@/lib/crm/parse";
import { canModifyLead } from "@/lib/scope";
import { safeJSON } from "@/lib/json";
import { canAccessCustomerType, leadScopeFilter } from "@/lib/crm/access";
import { CUSTOMER_TYPES, LEAD_STATUSES, customerTypeFromSource, parseRequiredDate } from "@/lib/crm/workflow";

function isLeadStatus(value: string): value is (typeof LEAD_STATUSES)[number] {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

function isCustomerType(value: string): value is (typeof CUSTOMER_TYPES)[number] {
  return (CUSTOMER_TYPES as readonly string[]).includes(value);
}

export async function GET(req: Request) {
  try {
    const me = await requireRole("agent");
    const url = new URL(req.url);
    const search = url.searchParams.get("q")?.trim() ?? "";
    const status = url.searchParams.get("status");
    const customerType = url.searchParams.get("customerType");
    const where: Record<string, unknown> = { ...leadScopeFilter(me) };
    // The next follow-up must be a genuinely upcoming appointment; an overdue
    // slot that is still "scheduled" should never be reported as the next one.
    const upcomingCutoff = new Date();
    if (status) {
      if (!isLeadStatus(status)) return err(400, "Invalid lead status");
      where.status = status;
    }
    if (customerType) {
      if (!isCustomerType(customerType)) return err(400, "Invalid customer type");
      where.customerType = customerType;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 500,
      include: {
        _count: { select: { policies: true, communications: true, appointments: true } },
        appointments: {
          where: { status: "scheduled", scheduledAt: { gte: upcomingCutoff } },
          orderBy: { scheduledAt: "asc" },
          take: 1,
        },
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
        appointmentCount: l._count.appointments,
        nextAppointment: l.appointments[0]?.scheduledAt.toISOString(),
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
  customerType: z.enum(CUSTOMER_TYPES).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
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

    const birthDate = body.birthDate ? parseRequiredDate(body.birthDate) : null;
    if (body.birthDate && !birthDate) return err(400, "Invalid birth date");
    if (body.status === "scheduled") return err(400, "Use appointment scheduling to set a lead as scheduled");

    // Appointments are the source of truth for scheduling: a lead can't be
    // marked "scheduled" without an upcoming appointment.
    if (body.status === "scheduled") {
      const upcoming = existing
        ? await prisma.leadAppointment.findFirst({
            where: { leadId: existing.id, status: "scheduled", scheduledAt: { gte: new Date() } },
            select: { id: true },
          })
        : null;
      if (!upcoming) return err(400, "Cannot mark a lead as scheduled without an upcoming appointment");
    }

    const inferredCustomerType = body.source ? customerTypeFromSource(body.source) : undefined;
    const customerType = body.customerType ?? inferredCustomerType;
    const effectiveCustomerType = customerType ?? existing?.customerType ?? "general";
    if (!canAccessCustomerType(me, effectiveCustomerType)) return err(403, "Agent is not allowed to access this CRM data type");

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
          birthDate: birthDate ?? undefined,
          gender: body.gender ?? undefined,
          source: body.source ?? undefined,
          customerType: body.customerType ?? (customerType === "real_estate" ? "real_estate" : undefined),
          status: body.status ?? undefined,
          notes: body.notes ?? undefined,
          ...(body.metadata && { metadata: JSON.stringify({ ...safeJSON<Record<string, unknown>>(existing.metadata, {}), ...body.metadata }) }),
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
          birthDate,
          gender: body.gender,
          source: body.source,
          customerType: customerType ?? "general",
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
