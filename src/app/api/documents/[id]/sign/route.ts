import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/dal";
import { canAccessClient } from "@/lib/scope";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { serializeDocument } from "@/lib/serializers";

const schema = z.object({
  signatureImage: z
    .string()
    .startsWith("data:image/")
    .max(5 * 1024 * 1024)
    .optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return err(404, "Document not found");
    if (!(await canAccessClient(me, doc.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    const body = await parseJSON(req, schema);
    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: "signed",
        signatureData: JSON.stringify({
          signedBy: me.id,
          signedAt: new Date().toISOString(),
          signatureImage: body.signatureImage,
          verified: true,
        }),
      },
    });
    await prisma.activityLog.create({
      data: {
        userId: me.id,
        type: "sign",
        message: `מסמך נחתם דיגיטלית - ${doc.name}`,
        icon: "✍️",
      },
    });
    return ok({ document: serializeDocument(updated) });
  } catch (error) {
    return handleError(error);
  }
}
