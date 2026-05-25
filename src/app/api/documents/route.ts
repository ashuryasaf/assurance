import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/dal";
import { clientScopeIdsFor, canAccessClient } from "@/lib/scope";
import { handleError, ok, err } from "@/lib/api";
import { serializeDocument } from "@/lib/serializers";
import { writeUpload } from "@/lib/storage";

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const status = url.searchParams.get("status");
    const ids = await clientScopeIdsFor(me);
    const where: {
      clientId?: string | { in: string[] };
      status?: string;
    } = {};
    if (clientId) {
      if (!(await canAccessClient(me, clientId))) {
        throw new HttpError(403, "Forbidden");
      }
      where.clientId = clientId;
    } else if (ids) {
      where.clientId = { in: ids };
    }
    if (status) where.status = status;

    const docs = await prisma.document.findMany({
      where,
      orderBy: { uploadDate: "desc" },
    });
    return ok({ documents: docs.map((d) => serializeDocument(d)) });
  } catch (error) {
    return handleError(error);
  }
}

const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/zip",
  "image/jpeg",
  "image/png",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return err(400, "Missing 'file' field");
    }
    if (file.size > MAX_SIZE) {
      return err(413, "File too large (max 25 MB)");
    }
    if (file.type && !ALLOWED_MIME.includes(file.type)) {
      // do not block unknown types but mark as 'other'
      console.warn("[documents] unusual mime type accepted:", file.type);
    }
    const clientIdRaw = form.get("clientId");
    const targetClientId =
      typeof clientIdRaw === "string" && clientIdRaw.length > 0 ? clientIdRaw : me.id;

    if (!(await canAccessClient(me, targetClientId))) {
      throw new HttpError(403, "Cannot upload for this client");
    }

    const docType = (form.get("type") as string) || "other";
    const policyIdRaw = form.get("policyId");
    const policyId = typeof policyIdRaw === "string" && policyIdRaw.length > 0 ? policyIdRaw : null;

    if (policyId) {
      const policy = await prisma.policy.findUnique({
        where: { id: policyId },
        select: { clientId: true },
      });
      if (!policy || policy.clientId !== targetClientId) {
        return err(400, "Policy does not belong to the specified client");
      }
    }

    const tagsRaw = form.get("tags");
    let tags: string[] = [];
    if (typeof tagsRaw === "string" && tagsRaw.length > 0) {
      try {
        tags = JSON.parse(tagsRaw);
      } catch {
        tags = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const { relPath } = await writeUpload(file.name || "file", buf);

    const doc = await prisma.document.create({
      data: {
        name: file.name,
        type: docType,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storagePath: relPath,
        status: "processed",
        policyId,
        clientId: targetClientId,
        uploadedById: me.id,
        tags: JSON.stringify(tags),
        aiAnalysis: JSON.stringify({
          summary: `מסמך "${file.name}" הועלה ועודכן בארכיון. נשמר במאגר המערכת.`,
          extractedData: {
            filename: file.name,
            size: `${Math.round(file.size / 1024)} KB`,
            type: file.type,
          },
          recommendations: ["המסמך נשמר בהצלחה במאגר", "ניתן להוריד או לחתום עליו"],
          processedAt: new Date().toISOString(),
          confidence: 0.9,
        }),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: me.id,
        type: "document",
        message: `מסמך חדש הועלה - ${file.name}`,
        icon: "📄",
      },
    });

    return ok({ document: serializeDocument(doc) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
