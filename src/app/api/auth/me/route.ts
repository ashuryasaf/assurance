import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser, toCurrentUser } from "@/lib/dal";
import { handleError, ok, parseJSON } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user });
  } catch (error) {
    return handleError(error);
  }
}

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  idNumber: z.string().min(1).optional(),
});

export async function PATCH(req: Request) {
  try {
    const me = await requireUser();
    const patch = await parseJSON(req, updateSchema);
    const updated = await prisma.user.update({
      where: { id: me.id },
      data: patch,
    });
    return ok({ user: toCurrentUser(updated) });
  } catch (error) {
    return handleError(error);
  }
}
