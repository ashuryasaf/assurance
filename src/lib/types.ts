export type UserRole = 'super_admin' | 'admin' | 'agency_owner' | 'agent' | 'sub_agent' | 'client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  role: UserRole;
  avatar?: string;
  agencyId?: string;
  parentAgentId?: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  licenseNumber?: string;
  specializations?: string[];
}

export interface Agency {
  id: string;
  name: string;
  licenseNumber: string;
  parentAgencyId?: string;
  ownerId: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  subAgencies?: Agency[];
  agents?: User[];
  regulatoryStatus: 'active' | 'suspended' | 'pending';
}

export interface Policy {
  id: string;
  policyNumber: string;
  type: PolicyType;
  provider: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  coverageAmount: number;
  clientId: string;
  agentId: string;
  documents: Document[];
  lastUpdated: string;
  details: Record<string, string | number>;
}

export type PolicyType = 'life' | 'health' | 'car' | 'home' | 'pension' | 'travel' | 'business' | 'investment' | 'gemel' | 'kranot';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  status: 'pending' | 'processed' | 'signed' | 'archived' | 'rejected';
  policyId?: string;
  clientId: string;
  url?: string;
  aiAnalysis?: AIDocumentAnalysis;
  signatureData?: SignatureData;
  tags: string[];
}

export type DocumentType = 'policy' | 'claim' | 'id' | 'medical' | 'financial' | 'regulatory' | 'agreement' | 'report' | 'other';

export interface AIDocumentAnalysis {
  summary: string;
  extractedData: Record<string, string>;
  riskScore?: number;
  recommendations: string[];
  processedAt: string;
  confidence: number;
}

export interface SignatureData {
  signedBy: string;
  signedAt: string;
  signatureImage?: string;
  ipAddress?: string;
  verified: boolean;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: 'ready' | 'generating' | 'failed';
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'html';
  data: Record<string, unknown>;
  filters?: Record<string, string>;
}

export type ReportType = 'portfolio' | 'commission' | 'regulatory' | 'maslaka' | 'har_bituach' | 'gamal_net' | 'client_summary' | 'agent_performance' | 'bi_analytics';

export interface RegulatoryReport {
  id: string;
  type: 'maslaka' | 'har_bituach' | 'gamal_net';
  clientId: string;
  status: 'pending' | 'fetched' | 'analyzed' | 'error';
  data: MaslakaData | HarBituachData | GamalNetData;
  fetchedAt?: string;
  analyzedAt?: string;
  aiInsights?: string[];
}

export interface MaslakaData {
  pensionFunds: PensionFund[];
  totalSavings: number;
  lastUpdate: string;
}

export interface PensionFund {
  fundName: string;
  provider: string;
  accountNumber: string;
  balance: number;
  monthlyContribution: number;
  employerContribution: number;
  managementFee: number;
  investmentTrack: string;
  returns: { year: number; percentage: number }[];
}

export interface HarBituachData {
  policies: HarBituachPolicy[];
  totalPremium: number;
  lastUpdate: string;
}

export interface HarBituachPolicy {
  policyNumber: string;
  company: string;
  type: string;
  status: string;
  premium: number;
  startDate: string;
  endDate: string;
  coverageDetails: string;
}

export interface GamalNetData {
  accounts: GamalAccount[];
  totalBalance: number;
  lastUpdate: string;
}

export interface GamalAccount {
  accountName: string;
  provider: string;
  type: 'gemel' | 'hishtalmut' | 'kranot';
  balance: number;
  deposits: number;
  managementFee: number;
  returns: number;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface Affiliate {
  id: string;
  name: string;
  code: string;
  agentId: string;
  commissionRate: number;
  referrals: number;
  earnings: number;
  isActive: boolean;
  createdAt: string;
}

export interface BankConnection {
  id: string;
  bankName: string;
  accountType: string;
  lastSync: string;
  status: 'connected' | 'disconnected' | 'error';
  balance?: number;
}

export interface InvestmentPortfolio {
  id: string;
  clientId: string;
  totalValue: number;
  investments: Investment[];
  lastUpdated: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etf' | 'real_estate' | 'crypto';
  value: number;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  returns: number;
  returnsPercentage: number;
}

export interface Recording {
  id: string;
  type: 'audio' | 'video';
  duration: number;
  url?: string;
  transcription?: string;
  createdAt: string;
  createdBy: string;
  relatedTo?: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  agency_owner: 60,
  agent: 40,
  sub_agent: 20,
  client: 0,
};

export const ROLE_LABELS_HE: Record<UserRole, string> = {
  super_admin: 'מנהל על',
  admin: 'מנהל מערכת',
  agency_owner: 'בעל סוכנות',
  agent: 'סוכן',
  sub_agent: 'סוכן משנה',
  client: 'לקוח',
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
