import { prisma } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/dal";
import { canAccessClient } from "@/lib/scope";
import { handleError, ok } from "@/lib/api";
import { serializePortfolio } from "@/lib/serializers";

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId") || me.id;
    if (!(await canAccessClient(me, clientId))) {
      throw new HttpError(403, "Forbidden");
    }
    const portfolio = await prisma.investmentPortfolio.findUnique({
      where: { clientId },
      include: { investments: true },
    });
    return ok({ portfolio: portfolio ? serializePortfolio(portfolio) : null });
  } catch (error) {
    return handleError(error);
  }
}
