import "server-only";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/dal";

type LeadAccessShape = { agencyId: string | null; agentId: string | null };

export function canSeeLead(me: CurrentUser, lead: LeadAccessShape): boolean {
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (me.agencyId && lead.agencyId === me.agencyId) return true;
  if (lead.agentId === me.id) return true;
  return false;
}

export function leadScopeFilter(me: CurrentUser) {
  if (me.role === "super_admin" || me.role === "admin") return {};
  if (me.role === "agency_owner" && me.agencyId) return { agencyId: me.agencyId };
  if (me.agencyId) return { OR: [{ agentId: me.id }, { agencyId: me.agencyId }] };
  return { agentId: me.id };
}

export async function loadLead(idOrIdNumber: string) {
  const byId = await prisma.lead.findUnique({ where: { id: idOrIdNumber } });
  if (byId) return byId;
  return prisma.lead.findUnique({ where: { idNumber: idOrIdNumber } });
}
