import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, requireRole } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLeadPolicy } from "@/lib/crm/serializers";
import { canSeeLead, loadLead } from "@/lib/crm/access";

const schema = z.object({
  policyNumber: z.string().optional(),
  type: z.string().optional(),
  provider: z.string().optional(),
  status: z.string().optional(),
  premium: z.number().nonnegative().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  raw: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");
    const body = await parseJSON(req, schema);

    const created = await prisma.leadPolicy.create({
      data: {
        leadId: lead.id,
        policyNumber: body.policyNumber,
        type: body.type,
        provider: body.provider,
        status: body.status,
        premium: body.premium,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        raw: JSON.stringify(body.raw ?? {}),
      },
    });
    return ok({ policy: serializeLeadPolicy(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
