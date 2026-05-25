import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/dal";
import { canAccessClient } from "@/lib/scope";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeRegulatory } from "@/lib/serializers";

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId") || me.id;
    if (!(await canAccessClient(me, clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    const reports = await prisma.regulatoryReport.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
    return ok({ reports: reports.map((r) => serializeRegulatory(r)) });
  } catch (error) {
    return handleError(error);
  }
}

const fetchSchema = z.object({
  type: z.enum(["maslaka", "har_bituach", "gamal_net"]),
  clientId: z.string().optional(),
});

// Trigger a "fetch" of regulatory data. In production this would call the
// Israeli Ministry of Finance / מסלקה / הר הביטוח / גמל נט APIs. For now we
// re-stamp the existing record's fetchedAt and analyzedAt timestamps.
export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const body = await parseJSON(req, fetchSchema);
    const clientId = body.clientId || me.id;
    if (!(await canAccessClient(me, clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    const existing = await prisma.regulatoryReport.findUnique({
      where: { clientId_type: { clientId, type: body.type } },
    });
    if (!existing) return err(404, "No regulatory data on file. Connect first.");
    const updated = await prisma.regulatoryReport.update({
      where: { id: existing.id },
      data: {
        status: "analyzed",
        fetchedAt: new Date(),
        analyzedAt: new Date(),
      },
    });
    return ok({ report: serializeRegulatory(updated) });
  } catch (error) {
    return handleError(error);
  }
}
