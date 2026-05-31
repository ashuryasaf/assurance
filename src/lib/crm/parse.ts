import "server-only";
import Papa from "papaparse";
import { CUSTOMER_TYPES, customerTypeFromSource, type CustomerType } from "@/lib/crm/workflow";

export type RawRow = Record<string, unknown>;

export const CRM_CSV_HEADERS = [
  "שימוש נתונים",
  "ת.ז",
  "שם פרטי",
  "שם משפחה",
  "אימייל",
  "טלפון",
  "טלפון נוסף",
  "כתובת",
  "עיר",
  "תאריך לידה",
  "מין",
  "סטטוס",
  "מקור",
  "מספר פוליסה",
  "סוג ביטוח",
  "חברה",
  "סטטוס פוליסה",
  "פרמיה",
  "תאריך התחלה",
  "תאריך סיום",
  "ערוץ",
  "כיוון",
  "תאריך שיחה",
  "אינדיקציית שיחה",
  "סיכום שיחה",
  "כותרת פגישה",
  "תאריך פגישה",
  "סטטוס פגישה",
  "הערות פגישה",
  "הערות",
] as const;

export type LeadCore = {
  idNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  birthDate?: string; // ISO yyyy-mm-dd
  gender?: string;
  notes?: string;
  status?: string;
  source?: string;
  customerType?: CustomerType;
};

export type ParsedRow = {
  rowIndex: number;
  raw: RawRow;
  lead?: LeadCore;
  policy?: {
    policyNumber?: string;
    type?: string;
    provider?: string;
    status?: string;
    premium?: number;
    startDate?: string;
    endDate?: string;
  };
  communication?: {
    channel: string;
    direction?: string;
    summary: string;
    occurredAt?: string;
    outcome?: string;
  };
  appointment?: {
    title: string;
    scheduledAt: string;
    status?: string;
    notes?: string;
  };
  metadata: RawRow;
  error?: string;
};

// -------------- column mapping --------------

const FIELD_ALIASES: Record<keyof LeadCore, string[]> = {
  idNumber: [
    "idnumber",
    "id_number",
    "id",
    "תעודת זהות",
    "תעודה",
    'ת"ז',
    "תז",
    "ת.ז",
    "ת.ז.",
    "מספר זהות",
    "national id",
    "personal id",
  ],
  firstName: ["firstname", "first_name", "first", "שם פרטי", "שם"],
  lastName: ["lastname", "last_name", "last", "surname", "שם משפחה", "משפחה"],
  email: ["email", "mail", "e-mail", "דואל", "דוא\"ל", "אימייל"],
  phone: ["phone", "mobile", "cell", "telephone", "טלפון", "נייד", "פלאפון", "סלולרי"],
  altPhone: ["altphone", "alternatephone", "phone2", "טלפון נוסף", "טלפון בית", "טלפון 2"],
  address: ["address", "street", "כתובת", "רחוב"],
  city: ["city", "town", "עיר", "ישוב", "יישוב"],
  birthDate: ["birthdate", "dob", "birth", "date_of_birth", "תאריך לידה"],
  gender: ["gender", "sex", "מין"],
  notes: ["notes", "comment", "comments", "remarks", "הערות", "תיאור", "פרטים"],
  status: ["status", "stage", "state", "סטטוס", "מצב"],
  source: ["source", "channel", "מקור"],
  customerType: ["customertype", "customer_type", "datause", "data_use", "database", "databaseuse", "שימוש נתונים", "סוג נתונים", "מאגר", "מאגר נתונים"],
};

const POLICY_ALIASES: Record<string, string[]> = {
  policyNumber: ["policy", "policynumber", "policy_no", "מספר פוליסה", "פוליסה", "מס פוליסה"],
  type: ["policytype", "type", "סוג", "סוג ביטוח", "ענף"],
  provider: ["provider", "company", "carrier", "ספק", "חברה", "חברת ביטוח"],
  status: ["policystatus", "status", "סטטוס פוליסה"],
  premium: ["premium", "monthly", "פרמיה", "פרמיה חודשית"],
  startDate: ["startdate", "start", "from", "תאריך התחלה"],
  endDate: ["enddate", "end", "to", "תאריך סיום", "תאריך תפוגה"],
};

const COMM_ALIASES: Record<string, string[]> = {
  channel: ["channel", "ערוץ", "ערוץ תקשורת"],
  direction: ["direction", "כיוון"],
  summary: ["communication", "summary", "call_summary", "תקשורת", "סיכום", "סיכום שיחה", "תיאור שיחה"],
  occurredAt: ["communicationdate", "calldate", "תאריך שיחה", "תאריך תקשורת"],
  outcome: ["outcome", "calloutcome", "call_outcome", "אינדיקציית שיחה", "תוצאת שיחה"],
};

const APPOINTMENT_ALIASES: Record<string, string[]> = {
  title: ["appointmenttitle", "appointment_title", "followuptitle", "כותרת פגישה", "כותרת פולואפ"],
  scheduledAt: ["appointmentdate", "appointment_date", "scheduledat", "scheduled_at", "followupdate", "תאריך פגישה", "תאריך פולואפ"],
  status: ["appointmentstatus", "appointment_status", "סטטוס פגישה"],
  notes: ["appointmentnotes", "appointment_notes", "followupnotes", "הערות פגישה", "הערות פולואפ"],
};

function normaliseHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_\-]+/g, "");
}

function findKey(row: RawRow, aliases: string[]): string | undefined {
  const norms = new Map<string, string>();
  for (const k of Object.keys(row)) {
    norms.set(normaliseHeader(k), k);
  }
  for (const alias of aliases) {
    const direct = norms.get(normaliseHeader(alias));
    if (direct) return direct;
  }
  return undefined;
}

function readString(row: RawRow, aliases: string[]): string | undefined {
  const key = findKey(row, aliases);
  if (!key) return undefined;
  const val = row[key];
  if (val === null || val === undefined) return undefined;
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}

function readNumber(row: RawRow, aliases: string[]): number | undefined {
  const str = readString(row, aliases);
  if (!str) return undefined;
  const cleaned = str.replace(/[^\d.\-,]/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function parseCustomerType(value: string | undefined): CustomerType | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(/[\s_\-]+/g, "");
  if (["all", "general", "כללי", "כולם", "allcustomers"].includes(normalized)) return "general";
  if (["realestate", "נדלן", "נדל\"ן"].includes(normalized)) return "real_estate";
  if (["insurance", "ביטוח"].includes(normalized)) return "insurance";
  if (["investments", "investment", "השקעות", "השקעה"].includes(normalized)) return "investments";
  if (["finance", "financial", "banking", "פיננס", "פיננסים", "מימון"].includes(normalized)) return "finance";
  return CUSTOMER_TYPES.includes(value as CustomerType) ? (value as CustomerType) : customerTypeFromSource(value);
}

function readDate(row: RawRow, aliases: string[]): string | undefined {
  const str = readString(row, aliases);
  if (!str) return undefined;
  // accept yyyy-mm-dd, dd/mm/yyyy, dd.mm.yyyy
  const ymd = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(str);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  const dmy = /^(\d{1,2})[./](\d{1,2})[./](\d{2,4})/.exec(str);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year < 100) year += year < 50 ? 2000 : 1900;
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return undefined;
}

// Like readDate, but preserves the time-of-day for values that carry one (e.g.
// the ISO timestamps produced by the export), so a round-tripped appointment or
// communication keeps its original time instead of snapping to UTC midnight.
function readDateTime(row: RawRow, aliases: string[]): string | undefined {
  const str = readString(row, aliases);
  if (!str) return undefined;
  if (/^\d{4}-\d{1,2}-\d{1,2}[T\s]\d/.test(str)) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return readDate(row, aliases);
}

export function normaliseIdNumber(id: string | undefined | null): string | undefined {
  if (!id) return undefined;
  const digits = String(id).replace(/[^\d]/g, "");
  if (digits.length === 0) return undefined;
  // Israeli ID is 9 digits; pad shorter values with leading zeros (common Excel quirk).
  return digits.length <= 9 ? digits.padStart(9, "0") : digits;
}

// -------------- main parser --------------

export function parseCustomerFile(buffer: Buffer, filename: string): ParsedRow[] {
  const lower = filename.toLowerCase();
  let rows: RawRow[];

  if (lower.endsWith(".json")) {
    rows = parseJSONInput(buffer);
  } else {
    rows = parseCSVInput(buffer);
  }

  const knownKeys = new Set<string>();
  for (const list of Object.values(FIELD_ALIASES)) list.forEach((a) => knownKeys.add(normaliseHeader(a)));
  for (const list of Object.values(POLICY_ALIASES)) list.forEach((a) => knownKeys.add(normaliseHeader(a)));
  for (const list of Object.values(COMM_ALIASES)) list.forEach((a) => knownKeys.add(normaliseHeader(a)));
  for (const list of Object.values(APPOINTMENT_ALIASES)) list.forEach((a) => knownKeys.add(normaliseHeader(a)));

  return rows.map((row, rowIndex): ParsedRow => {
    const idNumberRaw = readString(row, FIELD_ALIASES.idNumber);
    const idNumber = normaliseIdNumber(idNumberRaw);

    const metadata: RawRow = {};
    for (const [k, v] of Object.entries(row)) {
      if (!knownKeys.has(normaliseHeader(k))) {
        metadata[k] = v;
      }
    }

    const result: ParsedRow = { rowIndex, raw: row, metadata };

    if (!idNumber) {
      result.error = 'Row is missing an Israeli ID number ("ת.ז" / "תעודת זהות" / id)';
      return result;
    }

    result.lead = {
      idNumber,
      firstName: readString(row, FIELD_ALIASES.firstName),
      lastName: readString(row, FIELD_ALIASES.lastName),
      email: readString(row, FIELD_ALIASES.email)?.toLowerCase(),
      phone: readString(row, FIELD_ALIASES.phone),
      altPhone: readString(row, FIELD_ALIASES.altPhone),
      address: readString(row, FIELD_ALIASES.address),
      city: readString(row, FIELD_ALIASES.city),
      birthDate: readDate(row, FIELD_ALIASES.birthDate),
      gender: readString(row, FIELD_ALIASES.gender),
      notes: readString(row, FIELD_ALIASES.notes),
      status: readString(row, FIELD_ALIASES.status),
      source: readString(row, FIELD_ALIASES.source),
      customerType: parseCustomerType(readString(row, FIELD_ALIASES.customerType)),
    };

    const policyNumber = readString(row, POLICY_ALIASES.policyNumber);
    const policyType = readString(row, POLICY_ALIASES.type);
    const policyProvider = readString(row, POLICY_ALIASES.provider);
    const policyPremium = readNumber(row, POLICY_ALIASES.premium);
    if (policyNumber || policyType || policyProvider || policyPremium !== undefined) {
      result.policy = {
        policyNumber,
        type: policyType,
        provider: policyProvider,
        status: readString(row, POLICY_ALIASES.status),
        premium: policyPremium,
        startDate: readDate(row, POLICY_ALIASES.startDate),
        endDate: readDate(row, POLICY_ALIASES.endDate),
      };
    }

    const commSummary = readString(row, COMM_ALIASES.summary);
    const commChannel = readString(row, COMM_ALIASES.channel);
    if (commSummary && (commChannel || commSummary.length > 0)) {
      result.communication = {
        channel: commChannel ?? "other",
        direction: readString(row, COMM_ALIASES.direction) ?? "outbound",
        summary: commSummary,
        occurredAt: readDateTime(row, COMM_ALIASES.occurredAt),
        outcome: readString(row, COMM_ALIASES.outcome),
      };
    }

    const appointmentDate = readDateTime(row, APPOINTMENT_ALIASES.scheduledAt);
    if (appointmentDate) {
      result.appointment = {
        title: readString(row, APPOINTMENT_ALIASES.title) ?? "Follow-up",
        scheduledAt: appointmentDate,
        status: readString(row, APPOINTMENT_ALIASES.status),
        notes: readString(row, APPOINTMENT_ALIASES.notes),
      };
    }

    return result;
  });
}

function parseCSVInput(buffer: Buffer): RawRow[] {
  const text = stripBOM(buffer.toString("utf8"));
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h: string) => h.trim(),
  });
  if (result.errors && result.errors.length > 0) {
    const firstFatal = result.errors.find((e) => e.type === "Delimiter" || e.type === "FieldMismatch");
    if (firstFatal) throw new Error(`CSV parse error: ${firstFatal.message}`);
  }
  return (result.data ?? []).filter((row) => row && Object.values(row).some((v) => String(v ?? "").trim() !== ""));
}

function parseJSONInput(buffer: Buffer): RawRow[] {
  const text = stripBOM(buffer.toString("utf8"));
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON: ${(err as Error).message}`);
  }
  if (Array.isArray(json)) return json as RawRow[];
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.rows)) return obj.rows as RawRow[];
    if (Array.isArray(obj.customers)) return obj.customers as RawRow[];
    if (Array.isArray(obj.data)) return obj.data as RawRow[];
  }
  throw new Error('JSON must be an array of objects, or an object with a "rows"/"customers"/"data" array.');
}

function stripBOM(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}
