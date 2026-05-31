import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, err } from "@/lib/api";
import { requireRole } from "@/lib/dal";
import { leadScopeFilter } from "@/lib/crm/access";
import { CUSTOMER_TYPES, LEAD_STATUSES } from "@/lib/crm/workflow";

const HEADERS = [
  "customer_id",
  "id_number",
  "first_name",
  "last_name",
  "full_name",
  "customer_type",
  "status",
  "last_call_outcome",
  "next_follow_up_at",
  "phone",
  "alt_phone",
  "email",
  "city",
  "address",
  "source",
  "customer_notes",
  "communication_date",
  "communication_channel",
  "communication_direction",
  "communication_outcome",
  "communication_notes",
  "appointment_date",
  "appointment_status",
  "appointment_title",
  "appointment_notes",
  "policy_number",
  "policy_type",
  "policy_provider",
  "policy_status",
  "policy_premium",
  "import_file",
  "import_row",
  "import_status",
  "imported_at",
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
      const maxRows = Math.max(
        lead.communications.length,
        lead.appointments.length,
        lead.policies.length,
        lead.importRows.length,
        1,
      );

      for (let index = 0; index < maxRows; index++) {
        const communication = lead.communications[index];
        const appointment = lead.appointments[index];
        const policy = lead.policies[index];
        const importRow = lead.importRows[index];
        rows.push([
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
          toIso(communication?.occurredAt),
          communication?.channel ?? "",
          communication?.direction ?? "",
          communication?.outcome ?? "",
          communication?.summary ?? "",
          toIso(appointment?.scheduledAt),
          appointment?.status ?? "",
          appointment?.title ?? "",
          appointment?.notes ?? "",
          policy?.policyNumber ?? "",
          policy?.type ?? "",
          policy?.provider ?? "",
          policy?.status ?? "",
          policy?.premium?.toString() ?? "",
          importRow?.import.fileName ?? "",
          importRow ? String(importRow.rowIndex + 1) : "",
          importRow?.status ?? "",
          toIso(importRow?.import.createdAt),
          lead.createdAt.toISOString(),
          lead.updatedAt.toISOString(),
        ]);
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

function toIso(value: Date | null | undefined): string {
  return value ? value.toISOString() : "";
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
