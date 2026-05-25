import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, requireRole, type CurrentUser } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeLeadComm } from "@/lib/crm/serializers";

function canSeeLead(me: CurrentUser, lead: { agencyId: string | null; agentId: string | null }): boolean {
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (me.agencyId && lead.agencyId === me.agencyId) return true;
  if (lead.agentId === me.id) return true;
  return false;
}

async function loadLead(idOrIdNumber: string) {
  const byId = await prisma.lead.findUnique({ where: { id: idOrIdNumber } });
  if (byId) return byId;
  return prisma.lead.findUnique({ where: { idNumber: idOrIdNumber } });
}

const schema = z.object({
  channel: z.string().min(1),
  direction: z.enum(["inbound", "outbound"]).optional(),
  summary: z.string().min(1),
  occurredAt: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await loadLead(id);
    if (!lead) return err(404, "Lead not found");
    if (!canSeeLead(me, lead)) throw new HttpError(403, "Forbidden");
    const body = await parseJSON(req, schema);

    const created = await prisma.leadCommunication.create({
      data: {
        leadId: lead.id,
        channel: body.channel,
        direction: body.direction ?? "outbound",
        summary: body.summary,
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
      },
    });
    return ok({ communication: serializeLeadComm(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
