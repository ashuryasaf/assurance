import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/dal";
import { canAccessClient } from "@/lib/scope";
import { handleError, err } from "@/lib/api";
import { readUpload } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return err(404, "Document not found");
    if (!(await canAccessClient(me, doc.clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    if (!doc.storagePath) return err(404, "No file attached");
    const buf = await readUpload(doc.storagePath);
    const arrBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    return new Response(arrBuf, {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.name)}"`,
        "Content-Length": String(buf.length),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
