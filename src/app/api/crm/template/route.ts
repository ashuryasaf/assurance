import { NextResponse } from "next/server";

// Returns a minimal CSV template (Hebrew + English headers) so agents can
// understand exactly which columns the importer recognises.
export async function GET() {
  const headers = [
    "ת.ז",
    "שם פרטי",
    "שם משפחה",
    "אימייל",
    "טלפון",
    "כתובת",
    "עיר",
    "תאריך לידה",
    "סטטוס",
    "מקור",
    "מספר פוליסה",
    "סוג ביטוח",
    "חברה",
    "פרמיה",
    "תאריך התחלה",
    "תאריך סיום",
    "ערוץ",
    "סיכום שיחה",
    "הערות",
  ];
  const example = [
    "123456789",
    "ישראל",
    "ישראלי",
    "israel@example.com",
    "050-0000000",
    "הרצל 1",
    "תל אביב",
    "1985-03-21",
    "new",
    "lead-import",
    "POL-2024-100",
    "life",
    "מגדל",
    "450",
    "2024-01-01",
    "2054-01-01",
    "phone",
    "שיחת היכרות, התעניין בביטוח חיים משולב",
    "מועמד פוטנציאלי",
  ];
  const rows = [headers, example];
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
