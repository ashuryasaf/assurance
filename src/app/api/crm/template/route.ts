import { NextResponse } from "next/server";
import { CRM_CSV_HEADERS } from "@/lib/crm/parse";

// Returns the exact CSV fields accepted by the importer. The export endpoint
// uses the same headers so a downloaded backup can be edited and re-uploaded.
export async function GET() {
  const example = [
    "insurance",
    "123456789",
    "ישראל",
    "ישראלי",
    "israel@example.com",
    "050-0000000",
    "03-0000000",
    "הרצל 1",
    "תל אביב",
    "1985-03-21",
    "זכר",
    "new",
    "lead-import",
    "POL-2024-100",
    "life",
    "מגדל",
    "active",
    "450",
    "2024-01-01",
    "2054-01-01",
    "phone",
    "outbound",
    "2026-06-01T09:00:00.000Z",
    "called",
    "שיחת היכרות, התעניין בביטוח חיים משולב",
    "שיחת פולואפ עם ישראל ישראלי",
    "2026-06-03T09:00:00.000Z",
    "scheduled",
    "להכין הצעת מחיר לפני השיחה",
    "מועמד פוטנציאלי",
  ];
  const rows = [[...CRM_CSV_HEADERS], example];
  const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  // Prepend BOM so Excel detects UTF-8 with Hebrew characters.
  const body = "\uFEFF" + csv;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers-template.csv"',
    },
  });
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
