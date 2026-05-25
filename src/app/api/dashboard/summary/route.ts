import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { clientScopeIdsFor } from "@/lib/scope";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    const me = await requireUser();
    const ids = await clientScopeIdsFor(me);
    const clientFilter = ids ? { clientId: { in: ids } } : {};

    const [policies, documents, portfolios, activity, regulatoryCount] = await Promise.all([
      prisma.policy.findMany({ where: clientFilter }),
      prisma.document.findMany({ where: clientFilter }),
      prisma.investmentPortfolio.findMany({
        where: clientFilter,
        include: { investments: true },
      }),
      prisma.activityLog.findMany({
        where: ids
          ? { OR: [{ userId: { in: ids } }, { userId: null }] }
          : {},
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.regulatoryReport.count({ where: clientFilter }),
    ]);

    const totalInvestments = portfolios.reduce((s, p) => s + p.totalValue, 0);
    const totalReturns = portfolios.reduce(
      (s, p) => s + p.investments.reduce((si, i) => si + i.returns, 0),
      0,
    );
    const totalPremium = policies.reduce((s, p) => s + p.premium, 0);
    const policyDistribution = aggregateByType(policies);
    const monthlyPremiums = generateMonthlyPremiums(totalPremium);
    const investmentPerformance = generateInvestmentTimeline(totalInvestments);

    return ok({
      summary: {
        totalPolicies: policies.length,
        totalPremium,
        totalDocuments: documents.length,
        totalInvestments,
        totalReturns,
        regulatoryFeeds: regulatoryCount,
      },
      policyDistribution,
      monthlyPremiums,
      investmentPerformance,
      activity: activity.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        icon: a.icon ?? "•",
        time: relativeTime(a.createdAt),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

function aggregateByType(policies: { type: string; premium: number }[]) {
  const map = new Map<string, number>();
  for (const p of policies) {
    map.set(p.type, (map.get(p.type) ?? 0) + p.premium);
  }
  const colors: Record<string, string> = {
    life: "#1e3a6e",
    health: "#2451a0",
    car: "#3468c4",
    home: "#5b8ed8",
    pension: "#c9a227",
    investment: "#d4b44a",
    business: "#93b8ea",
    gemel: "#0f2244",
    travel: "#22c55e",
    kranot: "#8b5cf6",
  };
  const labels: Record<string, string> = {
    life: "חיים",
    health: "בריאות",
    car: "רכב",
    home: "דירה",
    pension: "פנסיה",
    investment: "השקעות",
    business: "עסק",
    gemel: "גמל",
    travel: "נסיעות",
    kranot: "קרנות",
  };
  return Array.from(map.entries()).map(([type, value]) => ({
    name: labels[type] ?? type,
    value,
    color: colors[type] ?? "#1e3a6e",
  }));
}

const HE_MONTHS = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"];

function generateMonthlyPremiums(current: number) {
  return HE_MONTHS.map((month, i) => ({
    month,
    value: Math.max(0, current - (11 - i) * Math.round(current * 0.005)),
  }));
}

function generateInvestmentTimeline(currentValue: number) {
  if (!currentValue) {
    return HE_MONTHS.map((month) => ({ month, value: 0 }));
  }
  const start = currentValue * 0.85;
  return HE_MONTHS.map((month, i) => ({
    month,
    value: Math.round(start + ((currentValue - start) * i) / 11),
  }));
}

function relativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "ממש עכשיו";
  if (diffSec < 3600) return `לפני ${Math.floor(diffSec / 60)} דקות`;
  if (diffSec < 86400) return `לפני ${Math.floor(diffSec / 3600)} שעות`;
  if (diffSec < 86400 * 7) return `לפני ${Math.floor(diffSec / 86400)} ימים`;
  if (diffSec < 86400 * 30) return `לפני ${Math.floor(diffSec / 86400 / 7)} שבועות`;
  return date.toISOString().split("T")[0];
}
