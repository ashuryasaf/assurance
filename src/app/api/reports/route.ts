import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/dal";
import { clientScopeIdsFor } from "@/lib/scope";
import { handleError, ok, parseJSON } from "@/lib/api";
import { serializeReport } from "@/lib/serializers";

export async function GET() {
  try {
    const me = await requireUser();
    const ids = await clientScopeIdsFor(me);
    const where = ids ? { generatedById: { in: ids } } : {};
    const reports = await prisma.report.findMany({ where, orderBy: { generatedAt: "desc" } });
    return ok({ reports: reports.map((r) => serializeReport(r)) });
  } catch (error) {
    return handleError(error);
  }
}

const schema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  format: z.enum(["pdf", "excel", "html"]).default("pdf"),
  filters: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const data = await parseJSON(req, schema);
    const report = await prisma.report.create({
      data: {
        title: data.title,
        type: data.type,
        format: data.format,
        status: "ready",
        filters: data.filters ? JSON.stringify(data.filters) : null,
        data: JSON.stringify({ generatedAt: new Date().toISOString() }),
        generatedById: me.id,
      },
    });
    return ok({ report: serializeReport(report) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
