export interface Policy {
  id: string;
  policyNumber: string;
  type: 'life' | 'health' | 'car' | 'home' | 'pension' | 'investment' | 'travel' | 'business' | 'critical';
  insurer: string;
  monthlyPremium: number;
  coverage: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: 'active' | 'pending' | 'expired';
  description?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'policy' | 'claim' | 'invoice' | 'report' | 'identification' | 'other';
  size: string;
  uploadDate: string;
  relatedPolicyId?: string;
  relatedPolicyNumber?: string;
  url?: string;
  requiresSignature?: boolean;
  signed?: boolean;
  signedDate?: string;
}

export interface InsuranceProduct {
  id: string;
  type: 'life' | 'health' | 'car' | 'home' | 'pension' | 'travel' | 'critical';
  name: string;
  nameEn: string;
  description: string;
  monthlyPriceFrom: number;
  features: string[];
  isRecommended?: boolean;
  isBestValue?: boolean;
  insurer: string;
  logo?: string;
}

export interface ActivityItem {
  id: string;
  type: 'policy_added' | 'document_uploaded' | 'claim_filed' | 'renewal' | 'payment' | 'signed';
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'annual' | 'policy' | 'claims' | 'pension' | 'investment';
  year: number;
  createdDate: string;
  size: string;
}

// Mock policies data
export const mockPolicies: Policy[] = [
  {
    id: '1',
    policyNumber: 'BIT-2024-001234',
    type: 'life',
    insurer: 'מנורה מבטחים',
    monthlyPremium: 450,
    coverage: '1,000,000 ₪',
    startDate: '2022-01-01',
    endDate: '2032-01-01',
    renewalDate: '2025-01-01',
    status: 'active',
    description: 'ביטוח חיים ריסק',
  },
  {
    id: '2',
    policyNumber: 'BIT-2024-005678',
    type: 'health',
    insurer: 'כלל ביטוח',
    monthlyPremium: 280,
    coverage: 'כיסוי בריאות מורחב',
    startDate: '2023-03-15',
    endDate: '2025-03-15',
    renewalDate: '2025-03-15',
    status: 'active',
    description: 'ביטוח בריאות משלים',
  },
  {
    id: '3',
    policyNumber: 'RKV-2024-009012',
    type: 'car',
    insurer: 'הראל ביטוח',
    monthlyPremium: 320,
    coverage: 'ביטוח מקיף',
    startDate: '2024-06-01',
    endDate: '2025-06-01',
    renewalDate: '2025-06-01',
    status: 'active',
    description: 'ביטוח רכב מקיף - טויוטה קורולה 2022',
  },
  {
    id: '4',
    policyNumber: 'DIR-2023-003456',
    type: 'home',
    insurer: 'מגדל ביטוח',
    monthlyPremium: 180,
    coverage: 'מבנה ותכולה 2,500,000 ₪',
    startDate: '2021-08-01',
    endDate: '2025-08-01',
    renewalDate: '2025-08-01',
    status: 'active',
    description: 'ביטוח דירה - מבנה ותכולה',
  },
  {
    id: '5',
    policyNumber: 'PEN-2024-007890',
    type: 'pension',
    insurer: 'מיטב דש פנסיה',
    monthlyPremium: 1200,
    coverage: 'קרן פנסיה מקיפה',
    startDate: '2018-01-01',
    endDate: '2048-01-01',
    renewalDate: '2026-01-01',
    status: 'active',
    description: 'קרן פנסיה - מסלול כללי',
  },
  {
    id: '6',
    policyNumber: 'NSV-2022-001122',
    type: 'travel',
    insurer: 'AIG ישראל',
    monthlyPremium: 45,
    coverage: 'כיסוי עד $1,000,000',
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    renewalDate: '2025-07-01',
    status: 'expired',
    description: 'ביטוח נסיעות לחו"ל - אירופה',
  },
];

// Mock documents data
export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'פוליסת ביטוח חיים - מנורה 2024',
    type: 'policy',
    size: '1.2 MB',
    uploadDate: '2024-01-15',
    relatedPolicyId: '1',
    relatedPolicyNumber: 'BIT-2024-001234',
    requiresSignature: false,
    signed: false,
  },
  {
    id: '2',
    name: 'תביעת ביטוח בריאות - ינואר 2024',
    type: 'claim',
    size: '850 KB',
    uploadDate: '2024-02-20',
    relatedPolicyId: '2',
    relatedPolicyNumber: 'BIT-2024-005678',
    requiresSignature: true,
    signed: false,
  },
  {
    id: '3',
    name: 'חשבונית פרמיה - פברואר 2024',
    type: 'invoice',
    size: '320 KB',
    uploadDate: '2024-02-01',
    requiresSignature: false,
    signed: false,
  },
  {
    id: '4',
    name: 'דוח פנסיה שנתי 2023',
    type: 'report',
    size: '2.1 MB',
    uploadDate: '2024-03-10',
    relatedPolicyId: '5',
    relatedPolicyNumber: 'PEN-2024-007890',
    requiresSignature: false,
    signed: false,
  },
  {
    id: '5',
    name: 'טופס בקשת שינוי כיסוי - בריאות',
    type: 'other',
    size: '450 KB',
    uploadDate: '2024-03-25',
    relatedPolicyId: '2',
    relatedPolicyNumber: 'BIT-2024-005678',
    requiresSignature: true,
    signed: true,
    signedDate: '2024-03-26',
  },
  {
    id: '6',
    name: 'תעודת ביטוח רכב',
    type: 'policy',
    size: '680 KB',
    uploadDate: '2024-06-01',
    relatedPolicyId: '3',
    relatedPolicyNumber: 'RKV-2024-009012',
    requiresSignature: false,
    signed: false,
  },
];

// Mock insurance products
export const mockProducts: InsuranceProduct[] = [
  {
    id: '1',
    type: 'life',
    name: 'ביטוח חיים ריסק',
    nameEn: 'Term Life Insurance',
    description: 'הגנה כלכלית לבני משפחתך',
    monthlyPriceFrom: 80,
    insurer: 'מנורה מבטחים',
    isRecommended: true,
    features: ['כיסוי מוות עד 5,000,000 ₪', 'אין ערך פדיון', 'פרמיה נמוכה', 'ביטול בכל עת'],
  },
  {
    id: '2',
    type: 'health',
    name: 'ביטוח בריאות מורחב',
    nameEn: 'Extended Health Insurance',
    description: 'כיסוי רפואי מקיף לכל המשפחה',
    monthlyPriceFrom: 180,
    insurer: 'מכבי שירותי בריאות',
    isBestValue: true,
    features: ['ניתוחים בארץ ובחו"ל', 'תרופות מחוץ לסל', 'בדיקות מיוחדות', 'שיניים - 80%'],
  },
  {
    id: '3',
    type: 'critical',
    name: 'ביטוח מחלות קשות',
    nameEn: 'Critical Illness Insurance',
    description: 'תשלום חד-פעמי בגילוי מחלה קשה',
    monthlyPriceFrom: 120,
    insurer: 'הראל ביטוח',
    features: ['32 מחלות מכוסות', 'תשלום ב-30 יום', 'מינימום דרישות', 'ללא הגבלת שימוש'],
  },
  {
    id: '4',
    type: 'pension',
    name: 'קרן פנסיה מקיפה',
    nameEn: 'Comprehensive Pension Fund',
    description: 'חיסכון פנסיוני עם הגנות מקיפות',
    monthlyPriceFrom: 800,
    insurer: 'מיטב דש',
    isRecommended: true,
    features: ['קצבת זקנה', 'ביטוח נכות', 'ביטוח שאירים', 'ניהול מקצועי'],
  },
  {
    id: '5',
    type: 'home',
    name: 'ביטוח דירה מקיף',
    nameEn: 'Comprehensive Home Insurance',
    description: 'הגנה מלאה על הנכס שלך',
    monthlyPriceFrom: 90,
    insurer: 'מגדל ביטוח',
    isBestValue: true,
    features: ['מבנה עד 3,000,000 ₪', 'תכולה עד 500,000 ₪', 'אחריות צד שלישי', 'שריפה ופריצה'],
  },
  {
    id: '6',
    type: 'travel',
    name: 'ביטוח נסיעות לחו"ל',
    nameEn: 'International Travel Insurance',
    description: 'שלווה בכל מקום בעולם',
    monthlyPriceFrom: 35,
    insurer: 'AIG ישראל',
    features: ['חירום רפואי $1M', 'ביטול טיסה', 'אובדן מזוודות', 'חבות צד שלישי'],
  },
];

// Mock activity
export const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'payment',
    title: 'תשלום פרמיה',
    description: 'פרמיה חודשית שולמה - ביטוח חיים מנורה',
    date: '2024-03-01',
    icon: '💳',
  },
  {
    id: '2',
    type: 'document_uploaded',
    title: 'מסמך הועלה',
    description: 'דוח פנסיה שנתי 2023 הועלה לאחסון',
    date: '2024-03-10',
    icon: '📄',
  },
  {
    id: '3',
    type: 'signed',
    title: 'מסמך נחתם',
    description: 'טופס בקשת שינוי כיסוי נחתם דיגיטלית',
    date: '2024-03-26',
    icon: '✍️',
  },
  {
    id: '4',
    type: 'renewal',
    title: 'חידוש קרוב',
    description: 'ביטוח בריאות כלל מתחדש ב-15/03/2025',
    date: '2024-04-01',
    icon: '🔄',
  },
  {
    id: '5',
    type: 'claim_filed',
    title: 'תביעה הוגשה',
    description: 'תביעת ביטוח בריאות ינואר 2024 - בטיפול',
    date: '2024-02-20',
    icon: '📋',
  },
];

// Mock reports
export const mockReports: Report[] = [
  {
    id: '1',
    title: 'דוח שנתי 2023 - כל הביטוחים',
    type: 'annual',
    year: 2023,
    createdDate: '2024-01-15',
    size: '3.4 MB',
  },
  {
    id: '2',
    title: 'דוח פוליסות פעילות - 2024',
    type: 'policy',
    year: 2024,
    createdDate: '2024-03-01',
    size: '1.2 MB',
  },
  {
    id: '3',
    title: 'דוח פנסיה 2023',
    type: 'pension',
    year: 2023,
    createdDate: '2024-01-20',
    size: '2.1 MB',
  },
  {
    id: '4',
    title: 'דוח תביעות 2023',
    type: 'claims',
    year: 2023,
    createdDate: '2024-02-01',
    size: '890 KB',
  },
];

// AI responses for the assistant
export const aiResponses: Record<string, string[]> = {
  default: [
    'אני כאן לעזור לך עם כל שאלה הקשורה לביטוחים שלך. מה תרצה לדעת?',
    'שאלה מצוינת! אבדוק את הנתונים שלך ואחזור אליך מיד.',
    'אני יכול לעזור לך עם מידע על הפוליסות שלך, הגשת תביעות, ועוד.',
  ],
  policies: [
    'יש לך 6 פוליסות ביטוח פעילות: חיים, בריאות, רכב, דירה, פנסיה ונסיעות. הפרמיה הכוללת שלך היא 2,475 ₪ לחודש.',
    'כל הפוליסות שלך עדכניות. פוליסת הבריאות שלך מתחדשת ב-15/03/2025 - כדאי לבדוק אפשרויות לחסכון.',
    'ישנה פוליסת נסיעות שפגה - אם מתכנן טיול קרוב, ממליץ לחדש אותה.',
  ],
  claim: [
    'להגשת תביעה, אנא מלא את הטופס בפורטל ובצרף את המסמכים הנדרשים. זמן טיפול ממוצע: 10-14 ימי עסקים.',
    'לתביעת ביטוח בריאות, יש לצרף: קבלות מקוריות, מסמכים רפואיים, ומרשמים. האם אתה רוצה שאפתח טופס תביעה?',
    'אני יכול לעזור לך לתעד את התביעה. איזה סוג תביעה ברצונך להגיש?',
  ],
  savings: [
    'לפי הניתוח שלי, ניתן לחסוך כ-15% על פוליסת הרכב שלך על ידי שינוי מסלול. זה חיסכון של כ-576 ₪ בשנה.',
    'ממליץ לבדוק שוב את פוליסת הבריאות - ייתכן שיש כיפולים בכיסוי עם קופת החולים. שמח לנתח את המצב.',
    'בהשוואה לשוק, אתה משלם תחרותי. עם זאת, הצרף כמה פוליסות לחברה אחת עשוי להניב הנחה.',
  ],
  coverage: [
    'הכיסוי שלך כולל: חיים עד 1,000,000 ₪, בריאות מורחבת, רכב מקיף, דירה - מבנה ותכולה 2,500,000 ₪, ופנסיה.',
    'יש לך כיסוי טוב! עם זאת, ממליץ לשקול ביטוח מחלות קשות - אין לך כרגע כיסוי כזה.',
    'בהשוואה ללקוחות דומים, רמת הכיסוי שלך מעל הממוצע. ביטוח הפנסיה שלך מצוין.',
  ],
};
