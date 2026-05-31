import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, err } from "@/lib/api";
import { requireRole } from "@/lib/dal";
import { leadScopeFilter } from "@/lib/crm/access";
import { CUSTOMER_TYPES, LEAD_STATUSES } from "@/lib/crm/workflow";

const HEADERS = [
  "record_type",
  "customer_id",
  "id_number",
  "first_name",
  "last_name",
  "full_name",
  "customer_type",
  "lead_status",
  "last_call_outcome",
  "next_follow_up_at",
  "phone",
  "alt_phone",
  "email",
  "city",
  "address",
  "source",
  "customer_notes",
  "record_date",
  "record_status",
  "record_channel",
  "record_direction",
  "record_outcome",
  "record_title",
  "record_notes",
  "policy_number",
  "policy_type",
  "policy_provider",
  "policy_premium",
  "import_file",
  "import_row",
  "created_at",
  "updated_at",
];

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
        communications: { orderBy: { occurredAt: "desc" } },
        appointments: { orderBy: { scheduledAt: "asc" } },
        policies: { orderBy: { createdAt: "desc" } },
        importRows: {
          orderBy: { rowIndex: "asc" },
          include: { import: { select: { fileName: true, createdAt: true } } },
        },
      },
    });

    const filtered = search
      ? leads.filter((lead) => {
          const blob = `${lead.idNumber} ${lead.firstName ?? ""} ${lead.lastName ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""} ${lead.city ?? ""}`.toLowerCase();
          return blob.includes(search.toLowerCase());
        })
      : leads;

    const rows = [HEADERS];
    for (const lead of filtered) {
      rows.push(baseRow(lead, "customer", {
        recordDate: lead.updatedAt,
        recordStatus: lead.status,
        recordNotes: lead.notes ?? "",
      }));

      for (const communication of lead.communications) {
        rows.push(baseRow(lead, "communication", {
          recordDate: communication.occurredAt,
          recordChannel: communication.channel,
          recordDirection: communication.direction,
          recordOutcome: communication.outcome ?? "",
          recordNotes: communication.summary,
          createdAt: communication.createdAt,
        }));
      }

      for (const appointment of lead.appointments) {
        rows.push(baseRow(lead, "appointment", {
          recordDate: appointment.scheduledAt,
          recordStatus: appointment.status,
          recordTitle: appointment.title,
          recordNotes: appointment.notes ?? "",
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        }));
      }

      for (const policy of lead.policies) {
        rows.push(baseRow(lead, "policy", {
          recordDate: policy.createdAt,
          recordStatus: policy.status ?? "",
          policyNumber: policy.policyNumber ?? "",
          policyType: policy.type ?? "",
          policyProvider: policy.provider ?? "",
          policyPremium: policy.premium?.toString() ?? "",
          createdAt: policy.createdAt,
        }));
      }

      for (const importRow of lead.importRows) {
        rows.push(baseRow(lead, "import_reference", {
          recordDate: importRow.import.createdAt,
          recordStatus: importRow.status,
          recordNotes: importRow.error ?? "",
          importFile: importRow.import.fileName,
          importRow: String(importRow.rowIndex + 1),
          createdAt: importRow.import.createdAt,
        }));
      }
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
  lastCallOutcome: string | null;
  nextFollowUpAt: Date | null;
};

type RecordFields = {
  recordDate?: Date | null;
  recordStatus?: string;
  recordChannel?: string;
  recordDirection?: string;
  recordOutcome?: string;
  recordTitle?: string;
  recordNotes?: string;
  policyNumber?: string;
  policyType?: string;
  policyProvider?: string;
  policyPremium?: string;
  importFile?: string;
  importRow?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

function baseRow(lead: ExportLead, recordType: string, fields: RecordFields): string[] {
  return [
    recordType,
    lead.id,
    lead.idNumber,
    lead.firstName ?? "",
    lead.lastName ?? "",
    [lead.firstName, lead.lastName].filter(Boolean).join(" "),
    lead.customerType,
    lead.status,
    lead.lastCallOutcome ?? "",
    toIso(lead.nextFollowUpAt),
    lead.phone ?? "",
    lead.altPhone ?? "",
    lead.email ?? "",
    lead.city ?? "",
    lead.address ?? "",
    lead.source ?? "",
    lead.notes ?? "",
    toIso(fields.recordDate),
    fields.recordStatus ?? "",
    fields.recordChannel ?? "",
    fields.recordDirection ?? "",
    fields.recordOutcome ?? "",
    fields.recordTitle ?? "",
    fields.recordNotes ?? "",
    fields.policyNumber ?? "",
    fields.policyType ?? "",
    fields.policyProvider ?? "",
    fields.policyPremium ?? "",
    fields.importFile ?? "",
    fields.importRow ?? "",
    toIso(fields.createdAt ?? lead.createdAt),
    toIso(fields.updatedAt ?? lead.updatedAt),
  ];
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
