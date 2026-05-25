import { safeJSON } from "@/lib/json";

type DbLead = {
  id: string;
  idNumber: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  altPhone: string | null;
  address: string | null;
  city: string | null;
  birthDate: Date | null;
  gender: string | null;
  source: string | null;
  status: string;
  agentId: string | null;
  agencyId: string | null;
  metadata: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiLead = {
  id: string;
  idNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  source?: string;
  status: string;
  agentId?: string;
  agencyId?: string;
  metadata: Record<string, unknown>;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function serializeLead(l: DbLead): ApiLead {
  return {
    id: l.id,
    idNumber: l.idNumber,
    firstName: l.firstName ?? undefined,
    lastName: l.lastName ?? undefined,
    email: l.email ?? undefined,
    phone: l.phone ?? undefined,
    altPhone: l.altPhone ?? undefined,
    address: l.address ?? undefined,
    city: l.city ?? undefined,
    birthDate: l.birthDate ? l.birthDate.toISOString().split("T")[0] : undefined,
    gender: l.gender ?? undefined,
    source: l.source ?? undefined,
    status: l.status,
    agentId: l.agentId ?? undefined,
    agencyId: l.agencyId ?? undefined,
    metadata: safeJSON<Record<string, unknown>>(l.metadata, {}),
    notes: l.notes ?? undefined,
    isActive: l.isActive,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

type DbLeadPolicy = {
  id: string;
  leadId: string;
  policyNumber: string | null;
  type: string | null;
  provider: string | null;
  status: string | null;
  premium: number | null;
  startDate: Date | null;
  endDate: Date | null;
  raw: string;
  createdAt: Date;
};

export function serializeLeadPolicy(p: DbLeadPolicy) {
  return {
    id: p.id,
    leadId: p.leadId,
    policyNumber: p.policyNumber ?? undefined,
    type: p.type ?? undefined,
    provider: p.provider ?? undefined,
    status: p.status ?? undefined,
    premium: p.premium ?? undefined,
    startDate: p.startDate ? p.startDate.toISOString().split("T")[0] : undefined,
    endDate: p.endDate ? p.endDate.toISOString().split("T")[0] : undefined,
    raw: safeJSON<Record<string, unknown>>(p.raw, {}),
    createdAt: p.createdAt.toISOString(),
  };
}

type DbLeadComm = {
  id: string;
  leadId: string;
  channel: string;
  direction: string;
  summary: string;
  occurredAt: Date;
  createdAt: Date;
};

export function serializeLeadComm(c: DbLeadComm) {
  return {
    id: c.id,
    leadId: c.leadId,
    channel: c.channel,
    direction: c.direction,
    summary: c.summary,
    occurredAt: c.occurredAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  };
}
