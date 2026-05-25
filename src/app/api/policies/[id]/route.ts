import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireRole, HttpError } from "@/lib/dal";
import { canAccessClient } from "@/lib/scope";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializePolicy, serializeDocument } from "@/lib/serializers";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const policy = await prisma.policy.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!policy) return err(404, "Policy not found");
    if (!(await canAccessClient(me, policy.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    return ok({
      policy: serializePolicy(
        policy,
        policy.documents.map((d) => serializeDocument(d)),
      ),
    });
  } catch (error) {
    return handleError(error);
  }
}

const patchSchema = z.object({
  policyNumber: z.string().optional(),
  type: z.string().optional(),
  provider: z.string().optional(),
  status: z.string().optional(),
  premium: z.number().nonnegative().optional(),
  premiumFrequency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coverageAmount: z.number().nonnegative().optional(),
  details: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const policy = await prisma.policy.findUnique({ where: { id } });
    if (!policy) return err(404, "Policy not found");
    if (!(await canAccessClient(me, policy.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    const patch = await parseJSON(req, patchSchema);
    const updated = await prisma.policy.update({
      where: { id },
      data: {
        ...(patch.policyNumber && { policyNumber: patch.policyNumber }),
        ...(patch.type && { type: patch.type }),
        ...(patch.provider && { provider: patch.provider }),
        ...(patch.status && { status: patch.status }),
        ...(patch.premium !== undefined && { premium: patch.premium }),
        ...(patch.premiumFrequency && { premiumFrequency: patch.premiumFrequency }),
        ...(patch.startDate && { startDate: new Date(patch.startDate) }),
        ...(patch.endDate && { endDate: new Date(patch.endDate) }),
        ...(patch.coverageAmount !== undefined && { coverageAmount: patch.coverageAmount }),
        ...(patch.details && { details: JSON.stringify(patch.details) }),
      },
    });
    return ok({ policy: serializePolicy(updated) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const policy = await prisma.policy.findUnique({ where: { id } });
    if (!policy) return err(404, "Policy not found");
    if (!(await canAccessClient(me, policy.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    await prisma.policy.delete({ where: { id } });
    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
