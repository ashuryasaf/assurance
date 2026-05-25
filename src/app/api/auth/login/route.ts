import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { toCurrentUser } from "@/lib/dal";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { email, password } = await parseJSON(req, schema);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user || !user.isActive) {
      return err(401, "Invalid credentials");
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return err(401, "Invalid credentials");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await createSession({ userId: updated.id, role: updated.role });
    return ok({ user: toCurrentUser(updated) });
  } catch (error) {
    return handleError(error);
  }
}
