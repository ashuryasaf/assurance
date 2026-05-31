import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, err } from "@/lib/api";
import { requireRole } from "@/lib/dal";
import { CRM_CSV_HEADERS } from "@/lib/crm/parse";
import { CUSTOMER_TYPES, LEAD_STATUSES } from "@/lib/crm/workflow";
import { reconcileStaleAppointments } from "@/lib/crm/reconcile";

function isLeadStatus(value: string): value is (typeof LEAD_STATUSES)[number] {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

function isCustomerType(value: string): value is (typeof CUSTOMER_TYPES)[number] {
  return (CUSTOMER_TYPES as readonly string[]).includes(value);
}

export async function GET(req: Request) {
  try {
    // Full customer exports are backups and may contain broad PII, so only
    // admins/super-admins may download them.
    await requireRole("admin");
    await reconcileStaleAppointments();
    const url = new URL(req.url);
    const search = url.searchParams.get("q")?.trim() ?? "";
    const status = url.searchParams.get("status");
    const customerType = url.searchParams.get("customerType");
    const where: Record<string, unknown> = {};

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
      orderBy: [{ updatedAt: "desc" }, { idNumber: "asc" }],
      take: 500,
      include: {
        communications: { orderBy: { occurredAt: "desc" }, take: 200 },
        appointments: { orderBy: { scheduledAt: "asc" }, take: 200 },
        policies: { orderBy: { createdAt: "desc" }, take: 200 },
      },
    });

    const filtered = search
      ? leads.filter((lead) => {
          const blob = `${lead.idNumber} ${lead.firstName ?? ""} ${lead.lastName ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""} ${lead.city ?? ""}`.toLowerCase();
          return blob.includes(search.toLowerCase());
        })
      : leads;

    const rows: string[][] = [[...CRM_CSV_HEADERS]];
    for (const lead of filtered) {
      let wroteRelatedRow = false;
      const push = (fields: Partial<CsvRecord>) => {
        rows.push(rowFor(lead, fields));
        wroteRelatedRow = true;
      };

      for (const communication of lead.communications) {
        push({
          channel: communication.channel,
          direction: communication.direction,
          communicationDate: toIso(communication.occurredAt),
          communicationOutcome: communication.outcome ?? "",
          communicationSummary: communication.summary,
        });
      }
      for (const appointment of lead.appointments) {
        push({
          appointmentTitle: appointment.title,
          appointmentDate: toIso(appointment.scheduledAt),
          appointmentStatus: appointment.status,
          appointmentNotes: appointment.notes ?? "",
        });
      }
      for (const policy of lead.policies) {
        push({
          policyNumber: policy.policyNumber ?? "",
          policyType: policy.type ?? "",
          policyProvider: policy.provider ?? "",
          policyStatus: policy.status ?? "",
          premium: policy.premium?.toString() ?? "",
          startDate: toDate(policy.startDate),
          endDate: toDate(policy.endDate),
        });
      }
      if (!wroteRelatedRow) rows.push(rowFor(lead, {}));
    }

    const csv = "\uFEFF" + rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="crm-customers-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

type ExportLead = Awaited<ReturnType<typeof prisma.lead.findMany>>[number] & {
  customerType: string;
};

type CsvRecord = {
  policyNumber: string;
  policyType: string;
  policyProvider: string;
  policyStatus: string;
  premium: string;
  startDate: string;
  endDate: string;
  channel: string;
  direction: string;
  communicationDate: string;
  communicationOutcome: string;
  communicationSummary: string;
  appointmentTitle: string;
  appointmentDate: string;
  appointmentStatus: string;
  appointmentNotes: string;
};

function rowFor(lead: ExportLead, fields: Partial<CsvRecord>): string[] {
  return [
    lead.customerType,
    lead.idNumber,
    lead.firstName ?? "",
    lead.lastName ?? "",
    lead.email ?? "",
    lead.phone ?? "",
    lead.altPhone ?? "",
    lead.address ?? "",
    lead.city ?? "",
    toDate(lead.birthDate),
    lead.gender ?? "",
    lead.status,
    lead.source ?? "",
    fields.policyNumber ?? "",
    fields.policyType ?? "",
    fields.policyProvider ?? "",
    fields.policyStatus ?? "",
    fields.premium ?? "",
    fields.startDate ?? "",
    fields.endDate ?? "",
    fields.channel ?? "",
    fields.direction ?? "",
    fields.communicationDate ?? "",
    fields.communicationOutcome ?? "",
    fields.communicationSummary ?? "",
    fields.appointmentTitle ?? "",
    fields.appointmentDate ?? "",
    fields.appointmentStatus ?? "",
    fields.appointmentNotes ?? "",
    lead.notes ?? "",
  ];
}

function toDate(value: Date | null | undefined): string {
  return value ? value.toISOString().split("T")[0] : "";
}

function toIso(value: Date | null | undefined): string {
  return value ? value.toISOString() : "";
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
