import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleError, ok, parseJSON, err } from "@/lib/api";
import { HttpError, requireRole } from "@/lib/dal";
import { normaliseIdNumber } from "@/lib/crm/parse";
import { canModifyLead } from "@/lib/scope";
import { safeJSON } from "@/lib/json";
import { customerTypeFromSource } from "@/lib/crm/workflow";
import { canAccessCustomerType, crmCustomerTypesFromPermissions } from "@/lib/crm/access";

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "scheduled", "qualified", "lost"]).optional(),
  assignedAgentId: z.string().nullable().optional(),
  notes: z.string().max(2000).optional(),
});


async function canAssignLandingLead(
  me: { role: string; id: string; agencyId?: string },
  assignedAgentId: string | null | undefined,
  lead: { campaignType?: string },
) {
  if (assignedAgentId === undefined || assignedAgentId === null) return true;
  if (me.role !== "super_admin" && me.role !== "admin" && me.role !== "agency_owner" && assignedAgentId !== me.id) {
    return false;
  }

  const assignee = await prisma.user.findUnique({
    where: { id: assignedAgentId },
    select: { role: true, agencyId: true, isActive: true, permissions: true },
  });
  if (!assignee?.isActive || !["agent", "sub_agent", "agency_owner"].includes(assignee.role)) return false;
  // The assignee must be allowed to work the lead's CRM customer type, or they
  // would be locked out by canAccessLandingLead on every subsequent access.
  if (assignee.role !== "agency_owner") {
    const allowedTypes = crmCustomerTypesFromPermissions(safeJSON<string[]>(assignee.permissions, []));
    const leadType = customerTypeFromSource(lead.campaignType);
    if (allowedTypes && !allowedTypes.includes(leadType)) return false;
  }
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (!me.agencyId) return assignedAgentId === me.id;
  return assignee.agencyId === me.agencyId;
}

async function canAccessLandingLead(me: { role: string; id: string; agencyId?: string; permissions: string[] }, lead: { assignedAgentId: string | null; campaignType?: string }) {
  if (me.role !== "super_admin" && me.role !== "admin" && me.role !== "agency_owner") {
    const allowedTypes = crmCustomerTypesFromPermissions(me.permissions);
    const leadType = customerTypeFromSource(lead.campaignType);
    if (allowedTypes && !allowedTypes.includes(leadType)) return false;
  }
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (!lead.assignedAgentId) return true;
  if (lead.assignedAgentId === me.id) return true;
  if (me.role === "agency_owner" && me.agencyId) {
    const assignedAgent = await prisma.user.findUnique({
      where: { id: lead.assignedAgentId },
      select: { agencyId: true },
    });
    return assignedAgent?.agencyId === me.agencyId;
  }
  return false;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireRole("agent");
    const { id } = await ctx.params;
    const lead = await prisma.realEstateLead.findUnique({ where: { id } });
    if (!lead) return err(404, "Lead not found");

    if (!(await canAccessLandingLead(me, lead))) {
      throw new HttpError(403, "Lead is assigned to another agent");
    }

    if (lead.status === "converted" || lead.convertedLeadId) {
      return err(400, "Cannot modify a converted lead's status");
    }

    const body = await parseJSON(req, patchSchema);
    if (!(await canAssignLandingLead(me, body.assignedAgentId, lead))) {
      return err(403, "Cannot assign lead to that agent");
    }

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

    if (!(await canAccessLandingLead(me, lead))) {
      throw new HttpError(403, "Lead is assigned to another agent");
    }

    if (lead.status === "converted" || lead.convertedLeadId) {
      return err(400, "Lead is already converted");
    }

    const body = await parseJSON(req, convertSchema);
    const idNumberDigits = normaliseIdNumber(body.idNumber);
    if (!idNumberDigits) return err(400, "Invalid Israeli ID number");

    const existingCrmLead = await prisma.lead.findUnique({ where: { idNumber: idNumberDigits } });
    if (existingCrmLead && !canModifyLead(me, existingCrmLead)) {
      return err(403, "Lead belongs to another tenant");
    }

    const [firstName, ...rest] = lead.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ") || undefined;
    const landingMetadata = {
      campaignType: lead.campaignType,
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
    };
    const metadata = JSON.stringify({
      ...(existingCrmLead ? safeJSON<Record<string, unknown>>(existingCrmLead.metadata, {}) : {}),
      ...landingMetadata,
    });
    const customerType = customerTypeFromSource(lead.campaignType);

    const { crmLead, updated } = await prisma.$transaction(async (tx) => {
      const crmLead = await tx.lead.upsert({
        where: { idNumber: idNumberDigits },
        create: {
          idNumber: idNumberDigits,
          firstName,
          lastName,
          phone: lead.phone,
          email: lead.email,
          notes: lead.notes,
          source: lead.source ?? `${lead.campaignType}-landing`,
          customerType,
          status: "new",
          agentId: me.id,
          agencyId: me.agencyId ?? null,
          metadata,
        },
        update: {
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          phone: lead.phone,
          email: lead.email ?? undefined,
          notes: lead.notes ?? undefined,
          source: lead.source ?? `${lead.campaignType}-landing`,
          // Only move an existing CRM record into a specific data segment when
          // the actor is allowed to manage that segment; never downgrade to
          // generic from a campaign merge.
          ...(customerType !== "general" && canAccessCustomerType(me, customerType) && { customerType }),
          metadata,
        },
      });

      const updated = await tx.realEstateLead.update({
        where: { id },
        data: {
          status: "converted",
          convertedLeadId: crmLead.id,
          assignedAgentId: lead.assignedAgentId ?? me.id,
        },
      });

      return { crmLead, updated };
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
