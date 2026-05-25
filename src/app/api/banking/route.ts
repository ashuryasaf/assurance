import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { handleError, ok, parseJSON } from "@/lib/api";
import { serializeBank } from "@/lib/serializers";

export async function GET() {
  try {
    const me = await requireUser();
    const banks = await prisma.bankConnection.findMany({
      where: { userId: me.id },
      orderBy: { lastSync: "desc" },
    });
    return ok({ banks: banks.map((b) => serializeBank(b)) });
  } catch (error) {
    return handleError(error);
  }
}

const schema = z.object({
  bankName: z.string().min(1),
  accountType: z.string().min(1),
  balance: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const data = await parseJSON(req, schema);
    const created = await prisma.bankConnection.create({
      data: {
        userId: me.id,
        bankName: data.bankName,
        accountType: data.accountType,
        balance: data.balance ?? null,
        status: "connected",
      },
    });
    return ok({ bank: serializeBank(created) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
