import type {
  Policy as ApiPolicy,
  Document as ApiDocument,
  Report as ApiReport,
  RegulatoryReport as ApiRegulatoryReport,
  Affiliate as ApiAffiliate,
  BankConnection as ApiBankConnection,
  Recording as ApiRecording,
  Investment as ApiInvestment,
  InvestmentPortfolio as ApiInvestmentPortfolio,
  AIDocumentAnalysis,
  SignatureData,
  PolicyType,
  DocumentType,
  ReportType,
} from "./types";
import { safeJSON } from "./json";

type DBPolicy = {
  id: string;
  policyNumber: string;
  type: string;
  provider: string;
  status: string;
  premium: number;
  premiumFrequency: string;
  startDate: Date;
  endDate: Date;
  coverageAmount: number;
  clientId: string;
  agentId: string;
  details: string;
  lastUpdated: Date;
};

export function serializePolicy(p: DBPolicy, documents: ApiDocument[] = []): ApiPolicy {
  return {
    id: p.id,
    policyNumber: p.policyNumber,
    type: p.type as PolicyType,
    provider: p.provider,
    status: p.status as ApiPolicy["status"],
    premium: p.premium,
    premiumFrequency: p.premiumFrequency as ApiPolicy["premiumFrequency"],
    startDate: p.startDate.toISOString().split("T")[0],
    endDate: p.endDate.toISOString().split("T")[0],
    coverageAmount: p.coverageAmount,
    clientId: p.clientId,
    agentId: p.agentId,
    documents,
    lastUpdated: p.lastUpdated.toISOString().split("T")[0],
    details: safeJSON(p.details, {}),
  };
}

type DBDocument = {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  uploadedById: string;
  status: string;
  policyId: string | null;
  clientId: string;
  storagePath: string | null;
  aiAnalysis: string | null;
  signatureData: string | null;
  tags: string;
};

export function serializeDocument(d: DBDocument): ApiDocument {
  return {
    id: d.id,
    name: d.name,
    type: d.type as DocumentType,
    mimeType: d.mimeType,
    size: d.size,
    uploadDate: d.uploadDate.toISOString().split("T")[0],
    uploadedBy: d.uploadedById,
    status: d.status as ApiDocument["status"],
    policyId: d.policyId ?? undefined,
    clientId: d.clientId,
    url: d.storagePath ? `/api/documents/${d.id}/file` : undefined,
    aiAnalysis: d.aiAnalysis ? safeJSON<AIDocumentAnalysis | undefined>(d.aiAnalysis, undefined) : undefined,
    signatureData: d.signatureData
      ? safeJSON<SignatureData | undefined>(d.signatureData, undefined)
      : undefined,
    tags: safeJSON<string[]>(d.tags, []),
  };
}

type DBReport = {
  id: string;
  title: string;
  type: string;
  status: string;
  format: string;
  filters: string | null;
  data: string;
  generatedById: string;
  generatedAt: Date;
};

export function serializeReport(r: DBReport): ApiReport {
  return {
    id: r.id,
    title: r.title,
    type: r.type as ReportType,
    status: r.status as ApiReport["status"],
    format: r.format as ApiReport["format"],
    filters: r.filters ? safeJSON<Record<string, string>>(r.filters, {}) : undefined,
    data: safeJSON<Record<string, unknown>>(r.data, {}),
    generatedAt: r.generatedAt.toISOString().split("T")[0],
    generatedBy: r.generatedById,
  };
}

type DBRegulatory = {
  id: string;
  type: string;
  clientId: string;
  status: string;
  data: string;
  aiInsights: string;
  fetchedAt: Date | null;
  analyzedAt: Date | null;
};

export function serializeRegulatory(r: DBRegulatory): ApiRegulatoryReport {
  return {
    id: r.id,
    type: r.type as ApiRegulatoryReport["type"],
    clientId: r.clientId,
    status: r.status as ApiRegulatoryReport["status"],
    data: safeJSON(r.data, {}) as ApiRegulatoryReport["data"],
    fetchedAt: r.fetchedAt?.toISOString().split("T")[0],
    analyzedAt: r.analyzedAt?.toISOString().split("T")[0],
    aiInsights: safeJSON<string[]>(r.aiInsights, []),
  };
}

type DBAffiliate = {
  id: string;
  name: string;
  code: string;
  agentId: string;
  commissionRate: number;
  referrals: number;
  earnings: number;
  isActive: boolean;
  createdAt: Date;
};

export function serializeAffiliate(a: DBAffiliate): ApiAffiliate {
  return {
    id: a.id,
    name: a.name,
    code: a.code,
    agentId: a.agentId,
    commissionRate: a.commissionRate,
    referrals: a.referrals,
    earnings: a.earnings,
    isActive: a.isActive,
    createdAt: a.createdAt.toISOString().split("T")[0],
  };
}

type DBBank = {
  id: string;
  bankName: string;
  accountType: string;
  status: string;
  balance: number | null;
  lastSync: Date;
};

export function serializeBank(b: DBBank): ApiBankConnection {
  return {
    id: b.id,
    bankName: b.bankName,
    accountType: b.accountType,
    status: b.status as ApiBankConnection["status"],
    balance: b.balance ?? undefined,
    lastSync: b.lastSync.toISOString().split("T")[0],
  };
}

type DBRecording = {
  id: string;
  type: string;
  duration: number;
  storagePath: string | null;
  transcription: string | null;
  relatedTo: string | null;
  createdById: string;
  createdAt: Date;
};

export function serializeRecording(r: DBRecording): ApiRecording {
  return {
    id: r.id,
    type: r.type as ApiRecording["type"],
    duration: r.duration,
    url: r.storagePath ? `/api/recordings/${r.id}/file` : undefined,
    transcription: r.transcription ?? undefined,
    relatedTo: r.relatedTo ?? undefined,
    createdAt: r.createdAt.toISOString().split("T")[0],
    createdBy: r.createdById,
  };
}

type DBInvestment = {
  id: string;
  name: string;
  type: string;
  value: number;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  returns: number;
  returnsPercentage: number;
};

type DBPortfolio = {
  id: string;
  clientId: string;
  totalValue: number;
  lastUpdated: Date;
  investments: DBInvestment[];
};

export function serializePortfolio(p: DBPortfolio): ApiInvestmentPortfolio {
  return {
    id: p.id,
    clientId: p.clientId,
    totalValue: p.totalValue,
    lastUpdated: p.lastUpdated.toISOString().split("T")[0],
    investments: p.investments.map(
      (inv): ApiInvestment => ({
        id: inv.id,
        name: inv.name,
        type: inv.type as ApiInvestment["type"],
        value: inv.value,
        quantity: inv.quantity,
        purchasePrice: inv.purchasePrice,
        currentPrice: inv.currentPrice,
        returns: inv.returns,
        returnsPercentage: inv.returnsPercentage,
      }),
    ),
  };
}
