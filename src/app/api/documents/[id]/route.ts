import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/dal";
import { canAccessClient } from "@/lib/scope";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeDocument } from "@/lib/serializers";
import { removeUpload } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return err(404, "Document not found");
    if (!(await canAccessClient(me, doc.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    return ok({ document: serializeDocument(doc) });
  } catch (error) {
    return handleError(error);
  }
}

const patchSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  policyId: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return err(404, "Document not found");
    if (!(await canAccessClient(me, doc.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    const patch = await parseJSON(req, patchSchema);
    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...(patch.name && { name: patch.name }),
        ...(patch.type && { type: patch.type }),
        ...(patch.status && { status: patch.status }),
        ...(patch.tags && { tags: JSON.stringify(patch.tags) }),
        ...(patch.policyId !== undefined && { policyId: patch.policyId }),
      },
    });
    return ok({ document: serializeDocument(updated) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return err(404, "Document not found");
    if (!(await canAccessClient(me, doc.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    if (doc.storagePath) await removeUpload(doc.storagePath);
    await prisma.document.delete({ where: { id } });
    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
