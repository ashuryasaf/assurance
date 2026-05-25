import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, HttpError } from "@/lib/dal";
import { clientScopeIdsFor, canAccessClient } from "@/lib/scope";
import { handleError, ok, parseJSON } from "@/lib/api";
import { serializePolicy } from "@/lib/serializers";

export async function GET() {
  try {
    const me = await requireUser();
    const ids = await clientScopeIdsFor(me);
    const where = ids ? { clientId: { in: ids } } : {};
    const policies = await prisma.policy.findMany({
      where,
      orderBy: { lastUpdated: "desc" },
    });
    return ok({ policies: policies.map((p) => serializePolicy(p)) });
  } catch (error) {
    return handleError(error);
  }
}

const createSchema = z.object({
  policyNumber: z.string().min(1),
  type: z.enum([
    "life",
    "health",
    "car",
    "home",
    "pension",
    "travel",
    "business",
    "investment",
    "gemel",
    "kranot",
  ]),
  provider: z.string().min(1),
  status: z.enum(["active", "expired", "pending", "cancelled"]).default("active"),
  premium: z.number().nonnegative(),
  premiumFrequency: z.enum(["monthly", "quarterly", "annual"]),
  startDate: z.string(),
  endDate: z.string(),
  coverageAmount: z.number().nonnegative(),
  clientId: z.string(),
  agentId: z.string().optional(),
  details: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export async function POST(req: Request) {
  try {
    const me = await requireRole("agent");
    const data = await parseJSON(req, createSchema);
    if (!(await canAccessClient(me, data.clientId))) {
      throw new HttpError(403, "Cannot create policy for this client");
    }
    const policy = await prisma.policy.create({
      data: {
        policyNumber: data.policyNumber,
        type: data.type,
        provider: data.provider,
        status: data.status,
        premium: data.premium,
        premiumFrequency: data.premiumFrequency,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        coverageAmount: data.coverageAmount,
        clientId: data.clientId,
        agentId: data.agentId ?? me.id,
        details: JSON.stringify(data.details ?? {}),
      },
    });
    return ok({ policy: serializePolicy(policy) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
