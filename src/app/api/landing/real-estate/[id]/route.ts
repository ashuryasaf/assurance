import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { HttpError, requireRole } from "@/lib/dal";

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "scheduled", "qualified", "converted", "lost"]).optional(),
  assignedAgentId: z.string().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await prisma.realEstateLead.findUnique({ where: { id } });
    if (!lead) return err(404, "Lead not found");

    if (me.role === "agent" || me.role === "sub_agent") {
      // Agents can only touch their own / unassigned leads.
      if (lead.assignedAgentId && lead.assignedAgentId !== me.id) {
        throw new HttpError(403, "Lead is assigned to another agent");
      }
    }

    const body = await parseJSON(req, patchSchema);
    const updated = await prisma.realEstateLead.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.assignedAgentId !== undefined && { assignedAgentId: body.assignedAgentId }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
    return ok({
      lead: {
        id: updated.id,
        status: updated.status,
        assignedAgentId: updated.assignedAgentId ?? undefined,
        notes: updated.notes ?? undefined,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

const convertSchema = z.object({
  idNumber: z.string().min(3),
});

// Promote a landing-page submission into a CRM `Lead` (which is keyed by
// Israeli ID number). Agents typically run this once they've spoken to the
// prospect and captured the ת.ז.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await prisma.realEstateLead.findUnique({ where: { id } });
    if (!lead) return err(404, "Lead not found");
    if (me.role === "agent" || me.role === "sub_agent") {
      if (lead.assignedAgentId && lead.assignedAgentId !== me.id) {
        throw new HttpError(403, "Lead is assigned to another agent");
      }
    }

    const body = await parseJSON(req, convertSchema);
    const idNumberDigits = body.idNumber.replace(/[^\d]/g, "").padStart(9, "0");
    const [firstName, ...rest] = lead.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ") || undefined;

    const crmLead = await prisma.lead.upsert({
      where: { idNumber: idNumberDigits },
      create: {
        idNumber: idNumberDigits,
        firstName,
        lastName,
        phone: lead.phone,
        email: lead.email,
        notes: lead.notes,
        source: lead.source ?? "real-estate-landing",
        status: "new",
        agentId: me.id,
        agencyId: me.agencyId ?? null,
        metadata: JSON.stringify({
          preferredTime: lead.preferredTime,
          utm: {
            source: lead.utmSource,
            medium: lead.utmMedium,
            campaign: lead.utmCampaign,
            term: lead.utmTerm,
            content: lead.utmContent,
          },
          referrer: lead.referrer,
          landingLeadId: lead.id,
        }),
      },
      update: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        phone: lead.phone,
        email: lead.email ?? undefined,
        notes: lead.notes ?? undefined,
      },
    });

    const updated = await prisma.realEstateLead.update({
      where: { id },
      data: {
        status: "converted",
        convertedLeadId: crmLead.id,
        assignedAgentId: lead.assignedAgentId ?? me.id,
      },
    });

    return ok({
      crmLeadId: crmLead.id,
      idNumber: crmLead.idNumber,
      status: updated.status,
    });
  } catch (error) {
    return handleError(error);
  }
}
