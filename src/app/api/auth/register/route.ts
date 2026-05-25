import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { toCurrentUser } from "@/lib/dal";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  idNumber: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const data = await parseJSON(req, schema);
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return err(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        idNumber: data.idNumber,
        role: "client",
        permissions: JSON.stringify(["view_own"]),
        isActive: true,
        lastLogin: new Date(),
      },
    });

    await createSession({ userId: user.id, role: user.role });
    return ok({ user: toCurrentUser(user) });
  } catch (error) {
    return handleError(error);
  }
}
