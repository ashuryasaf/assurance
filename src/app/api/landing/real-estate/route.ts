import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { requireRole } from "@/lib/dal";
import { checkRate, clientIp } from "@/lib/throttle";

const CAMPAIGN_TYPES = ["real-estate", "insurance", "investments", "kadima-real-estate"] as const;

const submissionSchema = z.object({
  fullName: z.string().trim().min(2, "נדרש שם מלא").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "נא להזין מספר טלפון תקין")
    .max(25)
    .regex(/^[+\d\s\-()]+$/, "המספר מכיל תווים לא חוקיים"),
  email: z
    .string()
    .trim()
    .max(120)
    .email("כתובת אימייל לא תקינה")
    .optional()
    .or(z.literal("")),
  preferredTime: z.enum(["morning", "noon", "evening"]),
  notes: z.string().trim().max(800).optional(),
  campaignType: z.enum(CAMPAIGN_TYPES).optional(),
  source: z.string().trim().max(60).optional(),
  utm: z
    .object({
      source: z.string().trim().max(60).optional(),
      medium: z.string().trim().max(60).optional(),
      campaign: z.string().trim().max(60).optional(),
      term: z.string().trim().max(60).optional(),
      content: z.string().trim().max(60).optional(),
    })
    .optional(),
  referrer: z.string().trim().max(300).optional(),
  consent: z.literal(true, { message: "נדרש לאשר את תנאי השימוש" }),
});

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRate(`landing-real-estate:${ip}`, 5, 60_000)) {
      return err(429, "נשלחו יותר מדי בקשות. נסה שוב בעוד דקה.");
    }

    const body = await parseJSON(req, submissionSchema);
    const userAgent = req.headers.get("user-agent")?.slice(0, 255) ?? null;
    const campaignType = body.campaignType ?? "real-estate";

    const CAMPAIGN_DEFAULTS: Record<string, { source: string; icon: string; label: string }> = {
      "real-estate": { source: "real-estate-landing", icon: "🏘️", label: "נדל\"ן" },
      insurance: { source: "insurance-landing", icon: "🛡️", label: "ביטוח" },
      investments: { source: "investments-landing", icon: "📈", label: "השקעות" },
      "kadima-real-estate": { source: "kadima-real-estate-landing", icon: "🏗️", label: "קדימה נדל\"ן" },
    };
    const defaults = CAMPAIGN_DEFAULTS[campaignType] ?? CAMPAIGN_DEFAULTS["real-estate"];

    const created = await prisma.realEstateLead.create({
      data: {
        fullName: body.fullName,
        phone: normalisePhone(body.phone),
        email: body.email && body.email.length > 0 ? body.email.toLowerCase() : null,
        preferredTime: body.preferredTime,
        notes: body.notes && body.notes.length > 0 ? body.notes : null,
        campaignType,
        source: body.source ?? defaults.source,
        utmSource: body.utm?.source,
        utmMedium: body.utm?.medium,
        utmCampaign: body.utm?.campaign,
        utmTerm: body.utm?.term,
        utmContent: body.utm?.content,
        referrer: body.referrer,
        ipAddress: ip === "anonymous" ? null : ip,
        userAgent,
      },
      select: { id: true, createdAt: true },
    });

    await prisma.activityLog.create({
      data: {
        type: "landing",
        message: `פנייה חדשה מדף הנחיתה (${defaults.label}): ${body.fullName}`,
        icon: defaults.icon,
      },
    });

    return ok(
      {
        ok: true,
        id: created.id,
        receivedAt: created.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}

// Authenticated listing for agents+, used by the internal review page.
export async function GET(req: Request) {
  try {
    const me = await requireRole("agent");
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const campaignTypeFilter = url.searchParams.get("campaignType");
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (campaignTypeFilter) where.campaignType = campaignTypeFilter;
    if (me.role !== "super_admin" && me.role !== "admin") {
      if (me.role === "agency_owner" && me.agencyId) {
        const agencyAgents = await prisma.user.findMany({
          where: { agencyId: me.agencyId },
          select: { id: true },
        });
        const agentIds = agencyAgents.map((a) => a.id);
        where.OR = [{ assignedAgentId: { in: agentIds } }, { assignedAgentId: null }];
      } else {
        where.OR = [{ assignedAgentId: me.id }, { assignedAgentId: null }];
      }
    }
    const leads = await prisma.realEstateLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return ok({
      leads: leads.map((l) => ({
        id: l.id,
        fullName: l.fullName,
        phone: l.phone,
        email: l.email ?? undefined,
        preferredTime: l.preferredTime,
        notes: l.notes ?? undefined,
        campaignType: l.campaignType,
        source: l.source ?? undefined,
        status: l.status,
        utm: {
          source: l.utmSource ?? undefined,
          medium: l.utmMedium ?? undefined,
          campaign: l.utmCampaign ?? undefined,
          term: l.utmTerm ?? undefined,
          content: l.utmContent ?? undefined,
        },
        referrer: l.referrer ?? undefined,
        assignedAgentId: l.assignedAgentId ?? undefined,
        convertedLeadId: l.convertedLeadId ?? undefined,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

function normalisePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  return digits.length > 0 ? digits : input;
}
