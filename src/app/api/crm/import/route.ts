import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { handleError, ok, err } from "@/lib/api";
import { parseCustomerFile, type ParsedRow } from "@/lib/crm/parse";
import { canModifyLead } from "@/lib/scope";
import { CUSTOMER_TYPES, customerTypeFromSource } from "@/lib/crm/workflow";
import { canAccessCustomerType } from "@/lib/crm/access";
import { safeJSON } from "@/lib/json";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ROWS = 5000;

export async function GET() {
  try {
    const me = await requireRole("agent");
    let filter: Record<string, unknown> = {};
    if (me.role !== "super_admin" && me.role !== "admin") {
      if (me.role === "agency_owner" && me.agencyId) {
        const agencyUsers = await prisma.user.findMany({
          where: { agencyId: me.agencyId },
          select: { id: true },
        });
        filter = { uploadedById: { in: agencyUsers.map((u) => u.id) } };
      } else {
        filter = { uploadedById: me.id };
      }
    }

    const imports = await prisma.customerImport.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return ok({
      imports: imports.map((i) => ({
        id: i.id,
        fileName: i.fileName,
        rowCount: i.rowCount,
        createdCount: i.createdCount,
        updatedCount: i.updatedCount,
        errorCount: i.errorCount,
        uploadedById: i.uploadedById,
        createdAt: i.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const form = await req.formData();
    const file = form.get("file");
    const requestedCustomerTypeValue = form.get("customerType");
    const requestedCustomerType = typeof requestedCustomerTypeValue === "string" && requestedCustomerTypeValue.length > 0
      ? requestedCustomerTypeValue
      : undefined;
    if (requestedCustomerType && !(CUSTOMER_TYPES as readonly string[]).includes(requestedCustomerType)) {
      return err(400, "Invalid CRM data allocation");
    }
    if (requestedCustomerType && !canAccessCustomerType(me, requestedCustomerType)) {
      return err(403, "Agent is not allowed to import this CRM data type");
    }
    if (!(file instanceof File)) return err(400, "Missing 'file' field");
    if (file.size === 0) return err(400, "File is empty");
    if (file.size > MAX_SIZE) return err(413, "File too large (max 10 MB)");

    const buffer = Buffer.from(await file.arrayBuffer());
    let parsed: ParsedRow[];
    try {
      parsed = parseCustomerFile(buffer, file.name || "upload");
    } catch (parseErr) {
      return err(400, `Could not parse file: ${(parseErr as Error).message}`);
    }
    if (parsed.length === 0) return err(400, "No rows found in the uploaded file");
    if (parsed.length > MAX_ROWS) {
      return err(413, `Too many rows (got ${parsed.length}, max ${MAX_ROWS}). Split the file into smaller batches.`);
    }

    const job = await prisma.customerImport.create({
      data: {
        fileName: file.name || "upload",
        uploadedById: me.id,
        rowCount: parsed.length,
      },
    });

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const row of parsed) {
      if (row.error || !row.lead) {
        errorCount++;
        await prisma.leadImportRow.create({
          data: {
            importId: job.id,
            rowIndex: row.rowIndex,
            status: "error",
            raw: JSON.stringify(row.raw),
            error: row.error ?? "Unknown error",
            idNumber: row.lead?.idNumber ?? null,
          },
        });
        continue;
      }

      const leadRow = row.lead;
      const idNumber = leadRow.idNumber;
      const source = leadRow.source ?? job.fileName;
      const inferredCustomerType = requestedCustomerType ?? leadRow.customerType ?? customerTypeFromSource(source);
      // Imports never create appointments, so they can't establish the
      // "scheduled" status, which is owned by the appointment flow.
      const importedStatus = leadRow.status === "scheduled" ? undefined : leadRow.status;
      const baseData = {
        firstName: leadRow.firstName,
        lastName: leadRow.lastName,
        email: leadRow.email,
        phone: leadRow.phone,
        altPhone: leadRow.altPhone,
        address: leadRow.address,
        city: leadRow.city,
        birthDate: leadRow.birthDate ? new Date(leadRow.birthDate) : null,
        gender: leadRow.gender,
        source,
        status: importedStatus,
        // A lost lead is terminal and must not retain a future follow-up.
        nextFollowUpAt: importedStatus === "lost" ? null : undefined,
        notes: leadRow.notes,
      };

      let result: { rowStatus: "created" | "updated" | "error" };
      try {
        result = await prisma.$transaction(async (tx) => {
          const existing = await tx.lead.findUnique({ where: { idNumber } });

          if (!canAccessCustomerType(me, inferredCustomerType)) {
          await tx.leadImportRow.create({
            data: {
              importId: job.id,
              rowIndex: row.rowIndex,
              status: "error",
              raw: JSON.stringify(row.raw),
              error: "Agent is not allowed to import this CRM data type",
              idNumber,
            },
          });
          return { rowStatus: "error" as const };
        }

        if (existing && !canModifyLead(me, existing)) {
            await tx.leadImportRow.create({
              data: {
                importId: job.id,
                rowIndex: row.rowIndex,
                status: "error",
                raw: JSON.stringify(row.raw),
                error: "Lead belongs to another tenant",
                idNumber,
              },
            });
            return { rowStatus: "error" as const };
          }

          let leadId: string;
          let rowStatus: "created" | "updated";

          if (existing) {
            const merged = { ...safeJSON<Record<string, unknown>>(existing.metadata, {}), ...row.metadata };
            const updated = await tx.lead.update({
              where: { id: existing.id },
              data: {
                ...stripUndefined(baseData),
                customerType: inferredCustomerType,
                metadata: JSON.stringify(merged),
                agentId: existing.agentId ?? me.id,
                agencyId: existing.agencyId ?? me.agencyId,
              },
            });
            leadId = updated.id;
            rowStatus = "updated";
          } else {
            const created = await tx.lead.create({
              data: {
                idNumber,
                ...stripUndefined(baseData),
                customerType: inferredCustomerType,
                status: importedStatus ?? "new",
                metadata: JSON.stringify(row.metadata ?? {}),
                agentId: me.id,
                agencyId: me.agencyId,
              },
            });
            leadId = created.id;
            rowStatus = "created";
          }

          // A lost lead is terminal: cancel any future follow-up meetings so
          // they don't linger on the agent calendar.
          if (importedStatus === "lost") {
            await tx.leadAppointment.updateMany({
              where: { leadId, status: "scheduled" },
              data: { status: "cancelled" },
            });
          }

          // Optional 1:N data attached to the same id.
          if (row.policy) {
            await tx.leadPolicy.create({
              data: {
                leadId,
                policyNumber: row.policy.policyNumber,
                type: row.policy.type,
                provider: row.policy.provider,
                status: row.policy.status,
                premium: row.policy.premium ?? null,
                startDate: row.policy.startDate ? new Date(row.policy.startDate) : null,
                endDate: row.policy.endDate ? new Date(row.policy.endDate) : null,
                raw: JSON.stringify(row.raw),
              },
            });
          }
          if (row.communication) {
            await tx.leadCommunication.create({
              data: {
                leadId,
                channel: row.communication.channel,
                direction: row.communication.direction ?? "outbound",
                outcome: row.communication.outcome,
                summary: row.communication.summary,
                occurredAt: row.communication.occurredAt ? new Date(row.communication.occurredAt) : new Date(),
              },
            });
          }
          if (row.appointment && importedStatus !== "lost") {
            const scheduledAt = new Date(row.appointment.scheduledAt);
            if (!Number.isNaN(scheduledAt.getTime())) {
              await tx.leadAppointment.create({
                data: {
                  leadId,
                  title: row.appointment.title,
                  scheduledAt,
                  status: row.appointment.status ?? "scheduled",
                  notes: row.appointment.notes,
                  createdById: me.id,
                },
              });
              await tx.lead.update({
                where: { id: leadId },
                data: { nextFollowUpAt: scheduledAt, status: "scheduled" },
              });
            }
          }

          await tx.leadImportRow.create({
            data: {
              importId: job.id,
              leadId,
              idNumber,
              rowIndex: row.rowIndex,
              status: rowStatus,
              raw: JSON.stringify(row.raw),
            },
          });

          return { rowStatus };
        });
      } catch (rowError) {
        errorCount++;
        await prisma.leadImportRow.create({
          data: {
            importId: job.id,
            rowIndex: row.rowIndex,
            status: "error",
            raw: JSON.stringify(row.raw),
            error: (rowError as Error).message ?? "Unexpected error",
            idNumber,
          },
        });
        continue;
      }

      if (result.rowStatus === "created") createdCount++;
      else if (result.rowStatus === "updated") updatedCount++;
      else errorCount++;
    }

    const finalised = await prisma.customerImport.update({
      where: { id: job.id },
      data: { createdCount, updatedCount, errorCount },
    });

    await prisma.activityLog.create({
      data: {
        userId: me.id,
        type: "crm",
        message: `קובץ לקוחות "${finalised.fileName}" נטען: ${createdCount} חדשים, ${updatedCount} עדכונים`,
        icon: "📇",
      },
    });

    return ok(
      {
        import: {
          id: finalised.id,
          fileName: finalised.fileName,
          rowCount: finalised.rowCount,
          createdCount: finalised.createdCount,
          updatedCount: finalised.updatedCount,
          errorCount: finalised.errorCount,
          createdAt: finalised.createdAt.toISOString(),
        },
        sampleErrors: parsed
          .filter((r) => r.error)
          .slice(0, 10)
          .map((r) => ({ rowIndex: r.rowIndex, error: r.error })),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (result as Record<string, unknown>)[k] = v;
  }
  return result;
}
