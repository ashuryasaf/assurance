import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { clientScopeIdsFor } from "@/lib/scope";
import { handleError, ok, err } from "@/lib/api";
import { serializeRecording } from "@/lib/serializers";
import { writeUpload } from "@/lib/storage";

export async function GET() {
  try {
    const me = await requireUser();
    const ids = await clientScopeIdsFor(me);
    const where = ids ? { createdById: { in: ids } } : {};
    const recordings = await prisma.recording.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return ok({ recordings: recordings.map((r) => serializeRecording(r)) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    const duration = Number(form.get("duration") ?? 0);
    const type = (form.get("type") as string) || "audio";
    const relatedTo = (form.get("relatedTo") as string) || null;
    let storagePath: string | null = null;
    if (file instanceof File && file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer());
      const { relPath } = await writeUpload(file.name || "recording", buf);
      storagePath = relPath;
    } else if (!duration) {
      return err(400, "Provide either a file or non-zero duration");
    }
    const created = await prisma.recording.create({
      data: {
        type,
        duration,
        storagePath,
        relatedTo,
        createdById: me.id,
      },
    });
    return ok({ recording: serializeRecording(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
