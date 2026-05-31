export const CUSTOMER_TYPES = ["general", "real_estate"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const LEAD_STATUSES = ["new", "contacted", "scheduled", "qualified", "customer", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const CALL_OUTCOMES = [
  "called",
  "no_answer",
  "interested",
  "not_interested",
  "follow_up",
  "appointment_scheduled",
  "wrong_number",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

const OUTCOME_TO_STATUS: Partial<Record<CallOutcome, string>> = {
  called: "contacted",
  interested: "qualified",
  not_interested: "lost",
  follow_up: "contacted",
  appointment_scheduled: "scheduled",
  wrong_number: "lost",
};

export function statusForCallOutcome(outcome: CallOutcome | undefined): string | undefined {
  return outcome ? OUTCOME_TO_STATUS[outcome] : undefined;
}

export function isRealEstateSource(value: string | null | undefined): boolean {
  return Boolean(value && /real[-_\s]?estate|נדל|kadima/i.test(value));
}

export function customerTypeFromSource(value: string | null | undefined): CustomerType {
  return isRealEstateSource(value) ? "real_estate" : "general";
}

export function parseRequiredDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
