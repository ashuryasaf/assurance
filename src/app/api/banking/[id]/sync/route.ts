import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { handleError, ok, err } from "@/lib/api";
import { serializeBank } from "@/lib/serializers";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const bank = await prisma.bankConnection.findUnique({ where: { id } });
    if (!bank || bank.userId !== me.id) return err(404, "Bank connection not found");
    const updated = await prisma.bankConnection.update({
      where: { id },
      data: { lastSync: new Date(), status: "connected" },
    });
    return ok({ bank: serializeBank(updated) });
  } catch (error) {
    return handleError(error);
  }
}
