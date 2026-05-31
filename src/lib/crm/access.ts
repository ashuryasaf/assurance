import "server-only";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/dal";
import { CUSTOMER_TYPES, type CustomerType } from "@/lib/crm/workflow";

const CRM_CUSTOMER_TYPE_PERMISSION_PREFIX = "crm:customer_type:";
const CUSTOMER_TYPE_SET = new Set<string>(CUSTOMER_TYPES);

type LeadAccessShape = { agencyId: string | null; agentId: string | null; customerType?: string | null };

export function crmCustomerTypePermission(type: CustomerType): string {
  return `${CRM_CUSTOMER_TYPE_PERMISSION_PREFIX}${type}`;
}

export function crmCustomerTypesFromPermissions(permissions: string[]): CustomerType[] | undefined {
  const restricted = permissions
    .filter((permission) => permission.startsWith(CRM_CUSTOMER_TYPE_PERMISSION_PREFIX))
    .map((permission) => permission.slice(CRM_CUSTOMER_TYPE_PERMISSION_PREFIX.length))
    .filter((type): type is CustomerType => CUSTOMER_TYPE_SET.has(type));

  if (restricted.length === 0 || restricted.length === CUSTOMER_TYPES.length) return undefined;
  return Array.from(new Set(restricted));
}

export function crmCustomerTypeLabelsFromPermissions(permissions: string[]): string[] {
  return crmCustomerTypesFromPermissions(permissions) ?? [...CUSTOMER_TYPES];
}

export function canAccessCustomerType(me: CurrentUser, customerType: string | null | undefined): boolean {
  if (!customerType) return true;
  if (me.role === "super_admin" || me.role === "admin" || me.role === "agency_owner") return true;
  const allowed = crmCustomerTypesFromPermissions(me.permissions);
  return !allowed || allowed.includes(customerType as CustomerType);
}

export function canSeeLead(me: CurrentUser, lead: LeadAccessShape): boolean {
  if (!canAccessCustomerType(me, lead.customerType)) return false;
  if (me.role === "super_admin" || me.role === "admin") return true;
  if (lead.agentId === me.id) return true;
  if (me.agencyId && lead.agencyId === me.agencyId) return true;
  return false;
}

export function crmCustomerTypeWhere(me: CurrentUser): Record<string, unknown> {
  const allowed = crmCustomerTypesFromPermissions(me.permissions);
  if (!allowed) return {};
  return { customerType: allowed.length === 1 ? allowed[0] : { in: allowed } };
}

export function leadScopeFilter(me: CurrentUser) {
  const customerTypeWhere = crmCustomerTypeWhere(me);
  if (me.role === "super_admin" || me.role === "admin") return customerTypeWhere;
  if (me.role === "agency_owner" && me.agencyId) return { agencyId: me.agencyId, ...customerTypeWhere };
  return { OR: [{ agentId: me.id }, { agencyId: me.agencyId ?? undefined }], ...customerTypeWhere };
}

export async function loadLead(idOrIdNumber: string) {
  const byId = await prisma.lead.findUnique({ where: { id: idOrIdNumber } });
  if (byId) return byId;
  return prisma.lead.findUnique({ where: { idNumber: idOrIdNumber } });
}
