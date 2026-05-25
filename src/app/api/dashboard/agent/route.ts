import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    const me = await requireRole("agent");
    const agentScope = me.role === "super_admin" || me.role === "admin" ? {} : { agencyId: me.agencyId ?? undefined };

    const agents = await prisma.user.findMany({
      where: { ...agentScope, role: { in: ["agent", "sub_agent"] } },
    });

    const performance = await Promise.all(
      agents.map(async (agent) => {
        const [policyCount, clientCount, revenue] = await Promise.all([
          prisma.policy.count({ where: { agentId: agent.id } }),
          prisma.user.count({ where: { agencyId: agent.agencyId, role: "client" } }),
          prisma.policy.aggregate({
            where: { agentId: agent.id },
            _sum: { premium: true },
          }),
        ]);
        return {
          name: `${agent.firstName} ${agent.lastName}`,
          policies: policyCount,
          clients: clientCount,
          revenue: Math.round((revenue._sum.premium ?? 0) * 12),
        };
      }),
    );

    return ok({ agentPerformance: performance });
  } catch (error) {
    return handleError(error);
  }
}
