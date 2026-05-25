import "dotenv/config";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
type SeedData = typeof import("./seed-data");

async function loadSeedData(): Promise<SeedData | null> {
  try {
    return (await import("./seed-data")) as SeedData;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[seed] could not load ./seed-data: ${msg}. Skipping seed (the app will start with an empty database — bootstrap an admin via \`npm run admin:create-admin\`).`,
    );
    return null;
  }
}

function resolveSqliteUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("file:")) {
    const rest = url.slice("file:".length);
    if (rest.startsWith("/") || rest.startsWith("./") || rest.startsWith("../")) {
      const abs = path.resolve(process.cwd(), rest.replace(/^\.\//, ""));
      return `file:${abs}`;
    }
    return url;
  }
  return `file:${path.resolve(process.cwd(), "data/app.db")}`;
}

const adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl() });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || "Demo1234!";

function parseDate(value: string | undefined, fallback?: Date): Date {
  if (!value) return fallback ?? new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? (fallback ?? new Date()) : d;
}

async function main() {
  const data = await loadSeedData();
  if (!data) {
    return;
  }
  const {
    mockUsers,
    mockAgencies,
    mockPolicies,
    mockDocuments,
    mockReports,
    mockRegulatoryReports,
    mockMaslakaData,
    mockHarBituachData,
    mockGamalNetData,
    mockAffiliates,
    mockBankConnections,
    mockInvestmentPortfolio,
    mockRecordings,
    mockAIMessages,
    mockProducts,
    mockActivity,
  } = data;

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`[seed] Skipping seed: database already has ${existingUsers} users.`);
    return;
  }

  console.log("[seed] Hashing demo password ...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Users (without agency relation; we'll connect agencies after)
  console.log("[seed] Creating users ...");
  for (const u of mockUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        idNumber: u.idNumber,
        role: u.role,
        permissions: JSON.stringify(u.permissions ?? []),
        agencyId: null,
        parentAgentId: u.parentAgentId ?? null,
        licenseNumber: u.licenseNumber ?? null,
        specializations: u.specializations ? JSON.stringify(u.specializations) : null,
        isActive: u.isActive,
        createdAt: parseDate(u.createdAt),
        lastLogin: u.lastLogin ? parseDate(u.lastLogin) : null,
      },
    });
  }

  // 2. Agencies (top level then sub agencies)
  console.log("[seed] Creating agencies ...");
  for (const a of mockAgencies) {
    await prisma.agency.create({
      data: {
        id: a.id,
        name: a.name,
        licenseNumber: a.licenseNumber,
        ownerId: a.ownerId,
        address: a.address,
        phone: a.phone,
        email: a.email,
        isActive: a.isActive,
        regulatoryStatus: a.regulatoryStatus,
        createdAt: parseDate(a.createdAt),
      },
    });
    for (const sub of a.subAgencies ?? []) {
      await prisma.agency.create({
        data: {
          id: sub.id,
          name: sub.name,
          licenseNumber: sub.licenseNumber,
          parentAgencyId: a.id,
          ownerId: sub.ownerId,
          address: sub.address,
          phone: sub.phone,
          email: sub.email,
          isActive: sub.isActive,
          regulatoryStatus: sub.regulatoryStatus,
          createdAt: parseDate(sub.createdAt),
        },
      });
    }
  }

  // 3. Connect users to agencies
  for (const u of mockUsers) {
    if (!u.agencyId) continue;
    await prisma.user.update({
      where: { id: u.id },
      data: { agencyId: u.agencyId },
    });
  }

  // 4. Policies
  console.log("[seed] Creating policies ...");
  for (const p of mockPolicies) {
    await prisma.policy.create({
      data: {
        id: p.id,
        policyNumber: p.policyNumber,
        type: p.type,
        provider: p.provider,
        status: p.status,
        premium: p.premium,
        premiumFrequency: p.premiumFrequency,
        startDate: parseDate(p.startDate),
        endDate: parseDate(p.endDate),
        coverageAmount: p.coverageAmount,
        clientId: p.clientId,
        agentId: p.agentId,
        details: JSON.stringify(p.details ?? {}),
      },
    });
  }

  // 5. Documents
  console.log("[seed] Creating documents ...");
  for (const d of mockDocuments) {
    await prisma.document.create({
      data: {
        id: d.id,
        name: d.name,
        type: d.type,
        mimeType: d.mimeType,
        size: d.size,
        storagePath: null,
        status: d.status,
        policyId: d.policyId ?? null,
        clientId: d.clientId,
        uploadedById: d.uploadedBy,
        tags: JSON.stringify(d.tags ?? []),
        aiAnalysis: d.aiAnalysis ? JSON.stringify(d.aiAnalysis) : null,
        signatureData: d.signatureData ? JSON.stringify(d.signatureData) : null,
        uploadDate: parseDate(d.uploadDate),
      },
    });
  }

  // 6. Reports
  console.log("[seed] Creating reports ...");
  for (const r of mockReports) {
    await prisma.report.create({
      data: {
        id: r.id,
        title: r.title,
        type: r.type,
        status: r.status,
        format: r.format,
        filters: r.filters ? JSON.stringify(r.filters) : null,
        data: JSON.stringify(r.data ?? {}),
        generatedById: r.generatedBy,
        generatedAt: parseDate(r.generatedAt),
      },
    });
  }

  // 7. Regulatory reports (one per type for demo client #4)
  console.log("[seed] Creating regulatory reports ...");
  const regulatoryPayloads: Record<string, unknown> = {
    maslaka: mockMaslakaData,
    har_bituach: mockHarBituachData,
    gamal_net: mockGamalNetData,
  };
  for (const r of mockRegulatoryReports) {
    await prisma.regulatoryReport.create({
      data: {
        id: r.id,
        type: r.type,
        clientId: r.clientId,
        status: r.status,
        data: JSON.stringify(regulatoryPayloads[r.type] ?? r.data ?? {}),
        aiInsights: JSON.stringify(r.aiInsights ?? []),
        fetchedAt: r.fetchedAt ? parseDate(r.fetchedAt) : null,
        analyzedAt: r.analyzedAt ? parseDate(r.analyzedAt) : null,
      },
    });
  }

  // 8. Affiliates
  console.log("[seed] Creating affiliates ...");
  for (const a of mockAffiliates) {
    await prisma.affiliate.create({
      data: {
        id: a.id,
        name: a.name,
        code: a.code,
        agentId: a.agentId,
        commissionRate: a.commissionRate,
        referrals: a.referrals,
        earnings: a.earnings,
        isActive: a.isActive,
        createdAt: parseDate(a.createdAt),
      },
    });
  }

  // 9. Bank connections (assign to demo client #4)
  console.log("[seed] Creating bank connections ...");
  const demoClientId = "4";
  for (const b of mockBankConnections) {
    await prisma.bankConnection.create({
      data: {
        id: b.id,
        userId: demoClientId,
        bankName: b.bankName,
        accountType: b.accountType,
        status: b.status,
        balance: b.balance ?? null,
        lastSync: parseDate(b.lastSync),
      },
    });
  }

  // 10. Investment portfolio (for demo client #4)
  console.log("[seed] Creating investment portfolio ...");
  await prisma.investmentPortfolio.create({
    data: {
      id: mockInvestmentPortfolio.id,
      clientId: mockInvestmentPortfolio.clientId,
      totalValue: mockInvestmentPortfolio.totalValue,
      investments: {
        create: mockInvestmentPortfolio.investments.map((inv) => ({
          id: inv.id,
          name: inv.name,
          type: inv.type,
          value: inv.value,
          quantity: inv.quantity,
          purchasePrice: inv.purchasePrice,
          currentPrice: inv.currentPrice,
          returns: inv.returns,
          returnsPercentage: inv.returnsPercentage,
        })),
      },
    },
  });

  // 11. Recordings
  console.log("[seed] Creating recordings ...");
  for (const r of mockRecordings) {
    await prisma.recording.create({
      data: {
        id: r.id,
        type: r.type,
        duration: r.duration,
        storagePath: null,
        transcription: r.transcription ?? null,
        relatedTo: r.relatedTo ?? null,
        createdById: r.createdBy,
        createdAt: parseDate(r.createdAt),
      },
    });
  }

  // 12. Marketplace products
  console.log("[seed] Creating marketplace products ...");
  for (const m of mockProducts) {
    await prisma.marketplaceProduct.create({
      data: {
        id: m.id,
        name: m.name,
        provider: m.provider,
        category: m.category,
        price: m.price,
        rating: m.rating,
        features: JSON.stringify(m.features ?? []),
      },
    });
  }

  // 13. CRM sample leads (assigned to the demo agent in the demo agency).
  console.log("[seed] Creating CRM leads ...");
  const sampleLeads = [
    {
      idNumber: "111222333",
      firstName: "ישראל",
      lastName: "ישראלי",
      email: "demo@assurance.co.il",
      phone: "054-1112222",
      city: "תל אביב",
      status: "customer",
      source: "demo",
    },
    {
      idNumber: "987654321",
      firstName: "משה",
      lastName: "כהן",
      email: "moshe@example.com",
      phone: "050-7654321",
      city: "ירושלים",
      status: "qualified",
      source: "lead-import",
    },
    {
      idNumber: "555555555",
      firstName: "שירה",
      lastName: "לוי",
      phone: "052-5555555",
      city: "חיפה",
      status: "new",
      source: "lead-import",
    },
  ];
  for (const l of sampleLeads) {
    await prisma.lead.upsert({
      where: { idNumber: l.idNumber },
      create: { ...l, agentId: "2", agencyId: "ag1", metadata: "{}" },
      update: {},
    });
  }
  await prisma.leadCommunication.create({
    data: {
      leadId: (await prisma.lead.findUnique({ where: { idNumber: "987654321" } }))!.id,
      channel: "phone",
      direction: "outbound",
      summary: "שיחת ייעוץ ראשונית - מתעניין בביטוח חיים משולב חיסכון",
    },
  });

  // 14. Activity log seed
  console.log("[seed] Creating activity log ...");
  for (const act of mockActivity) {
    await prisma.activityLog.create({
      data: {
        userId: demoClientId,
        type: act.type,
        message: act.message,
        icon: act.icon,
      },
    });
  }

  // 15. AI conversation seed (for demo client)
  console.log("[seed] Creating AI conversation ...");
  await prisma.aIConversation.create({
    data: {
      userId: demoClientId,
      context: "general",
      messages: {
        create: mockAIMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    },
  });

  console.log("[seed] Done.");
}

main()
  .catch((err) => {
    // Never block startup on seed failures: if the seed crashes (missing
    // sample-data file, schema drift, anything else) we log clearly and exit
    // 0 so `scripts/start.mjs` can still launch Next.js. The operator can
    // recover with `npm run admin:create-admin -- ...` if no users exist.
    console.warn("[seed] skipping seed (non-fatal):", err?.message ?? err);
    process.exitCode = 0;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
