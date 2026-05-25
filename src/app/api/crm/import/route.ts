import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { handleError, ok, err } from "@/lib/api";
import { parseCustomerFile, type ParsedRow } from "@/lib/crm/parse";
import { canModifyLead } from "@/lib/scope";

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

      const idNumber = row.lead.idNumber;
      const existing = await prisma.lead.findUnique({ where: { idNumber } });

      if (existing && !canModifyLead(me, existing)) {
        errorCount++;
        await prisma.leadImportRow.create({
          data: {
            importId: job.id,
            rowIndex: row.rowIndex,
            status: "error",
            raw: JSON.stringify(row.raw),
            error: "Lead belongs to another tenant",
            idNumber,
          },
        });
        continue;
      }

      const baseData = {
        firstName: row.lead.firstName,
        lastName: row.lead.lastName,
        email: row.lead.email,
        phone: row.lead.phone,
        altPhone: row.lead.altPhone,
        address: row.lead.address,
        city: row.lead.city,
        birthDate: row.lead.birthDate ? new Date(row.lead.birthDate) : null,
        gender: row.lead.gender,
        source: row.lead.source ?? job.fileName,
        status: row.lead.status,
        notes: row.lead.notes,
      };

      let leadId: string;
      let rowStatus: "created" | "updated";

      if (existing) {
        let merged: Record<string, unknown> = {};
        try {
          merged = JSON.parse(existing.metadata) as Record<string, unknown>;
        } catch {
          merged = {};
        }
        merged = { ...merged, ...row.metadata };
        const updated = await prisma.lead.update({
          where: { id: existing.id },
          data: {
            ...stripUndefined(baseData),
            metadata: JSON.stringify(merged),
            agentId: existing.agentId ?? me.id,
            agencyId: existing.agencyId ?? me.agencyId,
          },
        });
        leadId = updated.id;
        rowStatus = "updated";
        updatedCount++;
      } else {
        const created = await prisma.lead.create({
          data: {
            idNumber,
            ...stripUndefined(baseData),
            status: row.lead.status ?? "new",
            metadata: JSON.stringify(row.metadata ?? {}),
            agentId: me.id,
            agencyId: me.agencyId,
          },
        });
        leadId = created.id;
        rowStatus = "created";
        createdCount++;
      }

      // Optional 1:N data attached to the same id.
      if (row.policy) {
        await prisma.leadPolicy.create({
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
        await prisma.leadCommunication.create({
          data: {
            leadId,
            channel: row.communication.channel,
            direction: row.communication.direction ?? "outbound",
            summary: row.communication.summary,
            occurredAt: row.communication.occurredAt ? new Date(row.communication.occurredAt) : new Date(),
          },
        });
      }

      await prisma.leadImportRow.create({
        data: {
          importId: job.id,
          leadId,
          idNumber,
          rowIndex: row.rowIndex,
          status: rowStatus,
          raw: JSON.stringify(row.raw),
        },
      });
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
