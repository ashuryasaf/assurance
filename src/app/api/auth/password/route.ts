import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { handleError, ok, parseJSON, err } from "@/lib/api";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const { currentPassword, newPassword } = await parseJSON(req, schema);

    const user = await prisma.user.findUnique({ where: { id: me.id } });
    if (!user) return err(404, "User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return err(401, "Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: me.id }, data: { passwordHash } });
    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
