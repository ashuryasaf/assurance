import "server-only";
import type { CurrentUser } from "@/lib/dal";

export function canModifyLead(me: CurrentUser, lead: { agencyId: string | null; agentId: string | null }): boolean {
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (lead.agentId === me.id) return true;
  if (me.agencyId && lead.agencyId === me.agencyId) return true;
  return false;
}

// Returns the set of client IDs the user is allowed to read/write.
// - clients: only themselves
// - sub_agents/agents/agency_owners: clients in their agency (or themselves)
// - admin/super_admin: undefined (meaning unrestricted)
export async function clientScopeIdsFor(user: CurrentUser): Promise<string[] | undefined> {
  if (user.role === "super_admin" || user.role === "admin") return undefined;
  if (user.role === "client") return [user.id];

  // Agents: their own clients = anyone in same agency with role 'client', plus themselves
  const { prisma } = await import("@/lib/db");
  const agencyId = user.agencyId;
  if (!agencyId) return [user.id];
  const clients = await prisma.user.findMany({
    where: { agencyId, role: "client" },
    select: { id: true },
  });
  return [user.id, ...clients.map((c) => c.id)];
}

// Returns whether a user can act on (own or be assigned to) a given clientId.
export async function canAccessClient(user: CurrentUser, clientId: string): Promise<boolean> {
  const ids = await clientScopeIdsFor(user);
  if (!ids) return true;
  return ids.includes(clientId);
}
