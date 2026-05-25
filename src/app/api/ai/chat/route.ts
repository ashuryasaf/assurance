import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, type CurrentUser } from "@/lib/dal";
import { clientScopeIdsFor } from "@/lib/scope";
import { handleError, ok, parseJSON } from "@/lib/api";

const schema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

type Topic = "policies" | "regulatory" | "investments" | "documents" | "affiliate" | "default";

function classify(message: string): Topic {
  const lower = message.toLowerCase();
  if (
    lower.includes("policies") ||
    lower.includes("פוליס") ||
    lower.includes("ביטוח") ||
    lower.includes("חיסכון")
  )
    return "policies";
  if (
    lower.includes("regulatory") ||
    lower.includes("מסלקה") ||
    lower.includes("פנסיה") ||
    lower.includes("הר ") ||
    lower.includes("גמל")
  )
    return "regulatory";
  if (
    lower.includes("investments") ||
    lower.includes("השקע") ||
    lower.includes("תיק") ||
    lower.includes("תשואה")
  )
    return "investments";
  if (
    lower.includes("documents") ||
    lower.includes("מסמך") ||
    lower.includes("נתח") ||
    lower.includes("קובץ")
  )
    return "documents";
  if (
    lower.includes("affiliate") ||
    lower.includes("שותף") ||
    lower.includes("עמלה") ||
    lower.includes("הפניה")
  )
    return "affiliate";
  return "default";
}

function clientWhereFilter(scopeIds: string[] | undefined): { clientId?: string | { in: string[] } } {
  if (!scopeIds) return {};
  if (scopeIds.length === 1) return { clientId: scopeIds[0] };
  return { clientId: { in: scopeIds } };
}

async function buildResponse(user: CurrentUser, topic: Topic): Promise<string> {
  const scopeIds = await clientScopeIdsFor(user);
  const filter = clientWhereFilter(scopeIds);

  switch (topic) {
    case "policies": {
      const policies = await prisma.policy.findMany({ where: filter });
      const total = policies.reduce((s, p) => s + p.premium, 0);
      const types = new Set(policies.map((p) => p.type));
      return `יש לך ${policies.length} פוליסות (${Array.from(types).join(", ")}). פרמיה חודשית כוללת: ₪${total.toLocaleString()}.`;
    }
    case "regulatory": {
      const reports = await prisma.regulatoryReport.findMany({ where: filter });
      if (reports.length === 0)
        return "טרם נטענו נתונים רגולטוריים. גש לעמוד 'הר הביטוח / מסלקה' כדי להתחיל.";
      const summary = reports.map((r) => `${r.type}: ${r.status}`).join(", ");
      return `נתונים רגולטוריים מעודכנים: ${summary}.`;
    }
    case "investments": {
      const portfolios = await prisma.investmentPortfolio.findMany({
        where: filter,
        include: { investments: true },
      });
      if (portfolios.length === 0) return "לא נמצא תיק השקעות עבורך.";
      const totalValue = portfolios.reduce((s, p) => s + p.totalValue, 0);
      const totalReturns = portfolios.flatMap((p) => p.investments).reduce((s, i) => s + i.returns, 0);
      return `תיק ההשקעות שלך: ₪${totalValue.toLocaleString()}, רווח כולל: ₪${totalReturns.toLocaleString()}.`;
    }
    case "documents": {
      const counts = await prisma.document.groupBy({
        by: ["status"],
        where: filter,
        _count: { _all: true },
      });
      const labels = counts.map((c) => `${c.status}: ${c._count._all}`).join(", ");
      const total = counts.reduce((s, c) => s + c._count._all, 0);
      return `יש לך ${total} מסמכים. ${labels}.`;
    }
    case "affiliate": {
      const affiliates = await prisma.affiliate.findMany({ where: { agentId: user.id } });
      if (affiliates.length === 0) return "טרם הוגדרו שותפים.";
      const earnings = affiliates.reduce((s, a) => s + a.earnings, 0);
      const referrals = affiliates.reduce((s, a) => s + a.referrals, 0);
      return `${affiliates.length} שותפים פעילים, ${referrals} הפניות, רווח כולל: ₪${earnings.toLocaleString()}.`;
    }
    default:
      return "אני כאן לעזור לך עם שאלות בנושא ביטוח, פנסיה, מסמכים והשקעות. נסה לשאול על 'הפוליסות שלי', 'תיק השקעות' או 'מסמכים'.";
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireUser();
    const { message, conversationId } = await parseJSON(req, schema);

    let conversation = conversationId
      ? await prisma.aIConversation.findUnique({
          where: { id: conversationId },
        })
      : null;
    if (!conversation || conversation.userId !== me.id) {
      conversation = await prisma.aIConversation.create({
        data: { userId: me.id, context: "general" },
      });
    }

    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const response = await buildResponse(me, classify(message));
    const assistant = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: response,
      },
    });

    return ok({
      conversationId: conversation.id,
      message: {
        id: assistant.id,
        role: "assistant" as const,
        content: assistant.content,
        timestamp: assistant.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
