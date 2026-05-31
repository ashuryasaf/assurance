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
    const me = await requireRole("admin");
    await reconcileStaleAppointments(me);
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

    const rows: string[][] = [[...CRM_CSV_HEADERS]];
    const pageSize = 500;
    let skip = 0;

    while (true) {
      const leads = await prisma.lead.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        skip,
        take: pageSize,
        include: {
          communications: { orderBy: { occurredAt: "desc" }, take: 50 },
          appointments: { orderBy: { scheduledAt: "asc" }, take: 50 },
          policies: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      });
      if (leads.length === 0) break;

      const filtered = search
        ? leads.filter((lead) => {
            const blob = `${lead.idNumber} ${lead.firstName ?? ""} ${lead.lastName ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""} ${lead.city ?? ""}`.toLowerCase();
            return blob.includes(search.toLowerCase());
          })
        : leads;

      for (const lead of filtered) {
        rows.push(rowFor(lead));
      }

      skip += leads.length;
      if (leads.length < pageSize) break;
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

type ExportLead = {
  idNumber: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  altPhone: string | null;
  address: string | null;
  city: string | null;
  birthDate: Date | null;
  gender: string | null;
  customerType: string;
  status: string;
  source: string | null;
  notes: string | null;
  communications: Array<{
    channel: string;
    direction: string;
    outcome: string | null;
    summary: string;
    occurredAt: Date;
  }>;
  appointments: Array<{
    title: string;
    scheduledAt: Date;
    status: string;
    notes: string | null;
  }>;
  policies: Array<{
    policyNumber: string | null;
    type: string | null;
    provider: string | null;
    status: string | null;
    premium: number | null;
    startDate: Date | null;
    endDate: Date | null;
  }>;
};

function rowFor(lead: ExportLead): string[] {
  const latestPolicy = lead.policies[0];
  const nextAppointment = lead.appointments.find((appointment) => appointment.status === "scheduled") ?? lead.appointments[0];
  const communicationDate = joinValues(lead.communications.map((communication) => toIso(communication.occurredAt)));
  const communicationOutcome = lead.communications.map((communication) => communication.outcome ?? "").join(" | ");
  const communicationSummary = joinValues(
    lead.communications.map((communication) => {
      const date = toIso(communication.occurredAt);
      return [date, communication.outcome, communication.summary].filter(Boolean).join(" - ");
    }),
  );
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
    latestPolicy?.policyNumber ?? "",
    latestPolicy?.type ?? "",
    latestPolicy?.provider ?? "",
    latestPolicy?.status ?? "",
    latestPolicy?.premium?.toString() ?? "",
    toDate(latestPolicy?.startDate),
    toDate(latestPolicy?.endDate),
    joinValues(lead.communications.map((communication) => communication.channel)),
    joinValues(lead.communications.map((communication) => communication.direction)),
    communicationDate,
    communicationOutcome,
    communicationSummary,
    nextAppointment?.title ?? "",
    toIso(nextAppointment?.scheduledAt),
    nextAppointment?.status ?? "",
    nextAppointment?.notes ?? "",
    lead.notes ?? "",
  ];
}

function joinValues(values: Array<string | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(" | ");
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
