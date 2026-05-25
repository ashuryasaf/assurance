import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/dal";
import { handleError, ok, parseJSON } from "@/lib/api";
import { serializeAffiliate } from "@/lib/serializers";

export async function GET() {
  try {
    const me = await requireUser();
    const where = me.role === "super_admin" || me.role === "admin" ? {} : { agentId: me.id };
    // For agency owners, include affiliates of all agents in their agency
    let finalWhere = where;
    if (me.role === "agency_owner" && me.agencyId) {
      const agents = await prisma.user.findMany({
        where: { agencyId: me.agencyId },
        select: { id: true },
      });
      finalWhere = { agentId: { in: agents.map((a) => a.id) } } as never;
    }
    const affiliates = await prisma.affiliate.findMany({
      where: finalWhere,
      orderBy: { createdAt: "desc" },
    });
    return ok({ affiliates: affiliates.map((a) => serializeAffiliate(a)) });
  } catch (error) {
    return handleError(error);
  }
}

const schema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  commissionRate: z.number().min(0).max(100),
});

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const data = await parseJSON(req, schema);
    const created = await prisma.affiliate.create({
      data: {
        name: data.name,
        code: data.code,
        agentId: me.id,
        commissionRate: data.commissionRate,
      },
    });
    return ok({ affiliate: serializeAffiliate(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
