import type {
  User, Agency, Policy, Document, Report, RegulatoryReport,
  Affiliate, BankConnection, InvestmentPortfolio, AIMessage,
  MaslakaData, HarBituachData, GamalNetData, Recording
} from './types';

export const mockUsers: User[] = [
  {
    id: '1', email: 'admin@assurance.co.il', firstName: 'אבי', lastName: 'כהן',
    phone: '052-1234567', idNumber: '123456789', role: 'super_admin',
    permissions: ['all'], createdAt: '2024-01-01', isActive: true, licenseNumber: 'INS-001',
    specializations: ['חיים', 'בריאות', 'פנסיה'],
  },
  {
    id: '2', email: 'agent@assurance.co.il', firstName: 'שרה', lastName: 'לוי',
    phone: '050-9876543', idNumber: '987654321', role: 'agent', agencyId: 'ag1',
    permissions: ['manage_clients', 'view_reports', 'manage_policies'], createdAt: '2024-02-01',
    isActive: true, licenseNumber: 'INS-045', specializations: ['רכב', 'דירה'],
  },
  {
    id: '3', email: 'sub@assurance.co.il', firstName: 'דוד', lastName: 'מזרחי',
    phone: '053-5555555', idNumber: '555555555', role: 'sub_agent', agencyId: 'ag1', parentAgentId: '2',
    permissions: ['view_clients', 'view_policies'], createdAt: '2024-03-01', isActive: true,
  },
  {
    id: '4', email: 'demo@assurance.co.il', firstName: 'ישראל', lastName: 'ישראלי',
    phone: '054-1112222', idNumber: '111222333', role: 'client',
    permissions: ['view_own'], createdAt: '2024-04-01', isActive: true,
  },
  {
    id: '5', email: 'agency@assurance.co.il', firstName: 'רחל', lastName: 'גולד',
    phone: '058-7778888', idNumber: '777888999', role: 'agency_owner', agencyId: 'ag1',
    permissions: ['manage_agency', 'manage_agents', 'manage_clients', 'view_reports'],
    createdAt: '2024-01-15', isActive: true, licenseNumber: 'INS-002',
  },
];

export const mockAgencies: Agency[] = [
  {
    id: 'ag1', name: 'אשורנס - סוכנות ראשית', licenseNumber: 'AGN-2024-001',
    ownerId: '5', address: 'רח\' הרצל 50, תל אביב', phone: '03-1234567',
    email: 'service@assurance.co.il', isActive: true, createdAt: '2024-01-01',
    regulatoryStatus: 'active',
    subAgencies: [
      {
        id: 'ag2', name: 'אשורנס צפון', licenseNumber: 'AGN-2024-002',
        parentAgencyId: 'ag1', ownerId: '2', address: 'רח\' העצמאות 12, חיפה',
        phone: '04-1234567', email: 'north@assurance.co.il', isActive: true,
        createdAt: '2024-02-01', regulatoryStatus: 'active',
      },
      {
        id: 'ag3', name: 'אשורנס דרום', licenseNumber: 'AGN-2024-003',
        parentAgencyId: 'ag1', ownerId: '3', address: 'שד\' רגר 10, באר שבע',
        phone: '08-1234567', email: 'south@assurance.co.il', isActive: true,
        createdAt: '2024-03-01', regulatoryStatus: 'active',
      },
    ],
  },
];

export const mockPolicies: Policy[] = [
  {
    id: 'p1', policyNumber: 'POL-2024-001', type: 'life', provider: 'מגדל', status: 'active',
    premium: 450, premiumFrequency: 'monthly', startDate: '2024-01-01', endDate: '2054-01-01',
    coverageAmount: 1000000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-12-01',
    details: { beneficiary: 'משפחה', coverageType: 'ריסק + חיסכון' },
  },
  {
    id: 'p2', policyNumber: 'POL-2024-002', type: 'health', provider: 'הראל', status: 'active',
    premium: 380, premiumFrequency: 'monthly', startDate: '2024-03-01', endDate: '2025-03-01',
    coverageAmount: 500000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-12-01',
    details: { plan: 'פלטינום', dental: 'כלול' },
  },
  {
    id: 'p3', policyNumber: 'POL-2024-003', type: 'car', provider: 'כלל', status: 'active',
    premium: 320, premiumFrequency: 'monthly', startDate: '2024-06-01', endDate: '2025-06-01',
    coverageAmount: 250000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-11-01',
    details: { vehicle: 'טויוטה קורולה 2023', coverage: 'מקיף' },
  },
  {
    id: 'p4', policyNumber: 'POL-2024-004', type: 'home', provider: 'הפניקס', status: 'active',
    premium: 180, premiumFrequency: 'monthly', startDate: '2024-02-01', endDate: '2025-02-01',
    coverageAmount: 2500000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-10-01',
    details: { propertyType: 'דירה', area: '120 מ"ר' },
  },
  {
    id: 'p5', policyNumber: 'POL-2024-005', type: 'pension', provider: 'מנורה', status: 'active',
    premium: 1200, premiumFrequency: 'monthly', startDate: '2020-01-01', endDate: '2055-01-01',
    coverageAmount: 3000000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-12-01',
    details: { track: 'מסלול כללי', managementFee: '0.5%' },
  },
  {
    id: 'p6', policyNumber: 'POL-2024-006', type: 'investment', provider: 'אלטשולר שחם', status: 'active',
    premium: 500, premiumFrequency: 'monthly', startDate: '2023-06-01', endDate: '2033-06-01',
    coverageAmount: 200000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-12-01',
    details: { fundType: 'גמל להשקעה', riskLevel: 'בינוני' },
  },
  {
    id: 'p7', policyNumber: 'POL-2024-007', type: 'business', provider: 'איילון', status: 'active',
    premium: 850, premiumFrequency: 'monthly', startDate: '2024-01-01', endDate: '2025-01-01',
    coverageAmount: 5000000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-11-01',
    details: { businessType: 'משרד', employees: '15' },
  },
  {
    id: 'p8', policyNumber: 'POL-2024-008', type: 'gemel', provider: 'מיטב דש', status: 'active',
    premium: 600, premiumFrequency: 'monthly', startDate: '2022-01-01', endDate: '2042-01-01',
    coverageAmount: 150000, clientId: '4', agentId: '2', documents: [], lastUpdated: '2024-12-01',
    details: { fundType: 'קרן השתלמות', track: 'מניות' },
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'd1', name: 'פוליסת ביטוח חיים - מגדל.pdf', type: 'policy', mimeType: 'application/pdf',
    size: 2500000, uploadDate: '2024-12-01', uploadedBy: '2', status: 'processed',
    clientId: '4', policyId: 'p1', tags: ['חיים', 'מגדל'],
    aiAnalysis: {
      summary: 'פוליסת ביטוח חיים מסוג ריסק וחיסכון, כיסוי עד 1,000,000 ₪',
      extractedData: { premium: '450', coverage: '1000000', beneficiary: 'משפחה' },
      riskScore: 15, recommendations: ['שקול הגדלת כיסוי בהתאם לגיל'], processedAt: '2024-12-01', confidence: 0.95,
    },
  },
  {
    id: 'd2', name: 'דוח בריאות שנתי.pdf', type: 'medical', mimeType: 'application/pdf',
    size: 1800000, uploadDate: '2024-11-15', uploadedBy: '4', status: 'processed',
    clientId: '4', tags: ['רפואי', 'שנתי'],
    aiAnalysis: {
      summary: 'דוח בריאות שנתי - תקין, ללא ממצאים חריגים',
      extractedData: { date: '2024-11-15', doctor: 'ד"ר כהן' },
      recommendations: ['המשך מעקב שנתי'], processedAt: '2024-11-16', confidence: 0.92,
    },
  },
  {
    id: 'd3', name: 'הסכם שירות - חתום.pdf', type: 'agreement', mimeType: 'application/pdf',
    size: 500000, uploadDate: '2024-10-01', uploadedBy: '2', status: 'signed',
    clientId: '4', tags: ['הסכם', 'חתום'],
    signatureData: { signedBy: '4', signedAt: '2024-10-01', verified: true },
  },
  {
    id: 'd4', name: 'נתוני מסלקה פנסיונית.xlsx', type: 'regulatory', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 350000, uploadDate: '2024-12-15', uploadedBy: '1', status: 'processed',
    clientId: '4', tags: ['מסלקה', 'פנסיה', 'רגולציה'],
  },
  {
    id: 'd5', name: 'דוח הר הביטוח.pdf', type: 'regulatory', mimeType: 'application/pdf',
    size: 1200000, uploadDate: '2024-12-10', uploadedBy: '1', status: 'processed',
    clientId: '4', tags: ['הר הביטוח', 'רגולציה'],
  },
];

export const mockReports: Report[] = [
  {
    id: 'r1', title: 'דוח תיק לקוח - ישראל ישראלי', type: 'client_summary', status: 'ready',
    generatedAt: '2024-12-15', generatedBy: '2', format: 'pdf', data: {},
  },
  {
    id: 'r2', title: 'דוח עמלות רבעוני Q4 2024', type: 'commission', status: 'ready',
    generatedAt: '2024-12-01', generatedBy: '1', format: 'excel', data: {},
  },
  {
    id: 'r3', title: 'דוח רגולטורי - רשות שוק ההון', type: 'regulatory', status: 'ready',
    generatedAt: '2024-11-30', generatedBy: '1', format: 'pdf', data: {},
  },
  {
    id: 'r4', title: 'ניתוח BI - ביצועי סוכנות', type: 'bi_analytics', status: 'ready',
    generatedAt: '2024-12-10', generatedBy: '1', format: 'html', data: {},
  },
  {
    id: 'r5', title: 'דוח ביצועי סוכנים', type: 'agent_performance', status: 'ready',
    generatedAt: '2024-12-05', generatedBy: '1', format: 'pdf', data: {},
  },
];

export const mockMaslakaData: MaslakaData = {
  pensionFunds: [
    {
      fundName: 'מגדל מקפת פנסיה', provider: 'מגדל', accountNumber: 'PEN-001',
      balance: 485000, monthlyContribution: 1200, employerContribution: 800,
      managementFee: 0.5, investmentTrack: 'מסלול כללי',
      returns: [
        { year: 2024, percentage: 8.2 }, { year: 2023, percentage: 12.5 },
        { year: 2022, percentage: -3.1 }, { year: 2021, percentage: 15.8 },
      ],
    },
    {
      fundName: 'הראל פנסיה', provider: 'הראל', accountNumber: 'PEN-002',
      balance: 125000, monthlyContribution: 600, employerContribution: 400,
      managementFee: 0.65, investmentTrack: 'מניות',
      returns: [
        { year: 2024, percentage: 10.1 }, { year: 2023, percentage: 14.2 },
        { year: 2022, percentage: -5.3 }, { year: 2021, percentage: 18.4 },
      ],
    },
  ],
  totalSavings: 610000,
  lastUpdate: '2024-12-15',
};

export const mockHarBituachData: HarBituachData = {
  policies: [
    {
      policyNumber: 'HAR-001', company: 'מגדל', type: 'ביטוח חיים', status: 'פעיל',
      premium: 450, startDate: '2024-01-01', endDate: '2054-01-01', coverageDetails: 'ריסק + חיסכון 1,000,000 ₪',
    },
    {
      policyNumber: 'HAR-002', company: 'הראל', type: 'ביטוח בריאות', status: 'פעיל',
      premium: 380, startDate: '2024-03-01', endDate: '2025-03-01', coverageDetails: 'תוכנית פלטינום',
    },
    {
      policyNumber: 'HAR-003', company: 'כלל', type: 'ביטוח רכב', status: 'פעיל',
      premium: 320, startDate: '2024-06-01', endDate: '2025-06-01', coverageDetails: 'מקיף - טויוטה קורולה 2023',
    },
    {
      policyNumber: 'HAR-004', company: 'הפניקס', type: 'ביטוח דירה', status: 'פעיל',
      premium: 180, startDate: '2024-02-01', endDate: '2025-02-01', coverageDetails: 'מבנה ותכולה 2,500,000 ₪',
    },
  ],
  totalPremium: 1330,
  lastUpdate: '2024-12-10',
};

export const mockGamalNetData: GamalNetData = {
  accounts: [
    {
      accountName: 'קרן השתלמות מיטב דש', provider: 'מיטב דש', type: 'hishtalmut',
      balance: 185000, deposits: 600, managementFee: 0.4, returns: 9.8,
    },
    {
      accountName: 'גמל להשקעה - אלטשולר שחם', provider: 'אלטשולר שחם', type: 'gemel',
      balance: 95000, deposits: 500, managementFee: 0.5, returns: 11.2,
    },
    {
      accountName: 'קופת גמל פסגות', provider: 'פסגות', type: 'gemel',
      balance: 42000, deposits: 300, managementFee: 0.55, returns: 7.5,
    },
  ],
  totalBalance: 322000,
  lastUpdate: '2024-12-15',
};

export const mockRegulatoryReports: RegulatoryReport[] = [
  {
    id: 'reg1', type: 'maslaka', clientId: '4', status: 'analyzed',
    data: mockMaslakaData, fetchedAt: '2024-12-15', analyzedAt: '2024-12-15',
    aiInsights: [
      'דמי הניהול בקרן הראל גבוהים ב-30% מהממוצע בענף - מומלץ לנהל משא ומתן',
      'ביצועי מסלול מניות מעולים - תשואה עודפת של 2.1% על המדד',
      'מומלץ לאחד את הקרנות לספק אחד לחיסכון בדמי ניהול',
    ],
  },
  {
    id: 'reg2', type: 'har_bituach', clientId: '4', status: 'analyzed',
    data: mockHarBituachData, fetchedAt: '2024-12-10', analyzedAt: '2024-12-10',
    aiInsights: [
      'ביטוח רכב מקיף - ניתן לחסוך עד 15% בהעברה לביטוח ישיר',
      'ביטוח בריאות - כיסוי כפול עם קופת חולים, שקול צמצום',
      'מומלץ להוסיף ביטוח מחלות קשות - חסר בתיק',
    ],
  },
  {
    id: 'reg3', type: 'gamal_net', clientId: '4', status: 'analyzed',
    data: mockGamalNetData, fetchedAt: '2024-12-15', analyzedAt: '2024-12-15',
    aiInsights: [
      'קרן ההשתלמות מתקרבת לגיל פדיון - שקול אסטרטגיית משיכה',
      'גמל להשקעה - ביצועים מעולים, המשך הפקדה מומלץ',
      'מומלץ לפזר השקעות - ריכוז גבוה במניות',
    ],
  },
];

export const mockAffiliates: Affiliate[] = [
  {
    id: 'af1', name: 'שותף עסקי א', code: 'AFF-001', agentId: '2',
    commissionRate: 15, referrals: 25, earnings: 18500, isActive: true, createdAt: '2024-06-01',
  },
  {
    id: 'af2', name: 'שותף עסקי ב', code: 'AFF-002', agentId: '2',
    commissionRate: 12, referrals: 18, earnings: 12200, isActive: true, createdAt: '2024-07-01',
  },
  {
    id: 'af3', name: 'שותף עסקי ג', code: 'AFF-003', agentId: '3',
    commissionRate: 10, referrals: 8, earnings: 5400, isActive: false, createdAt: '2024-08-01',
  },
];

export const mockBankConnections: BankConnection[] = [
  { id: 'bc1', bankName: 'בנק לאומי', accountType: 'עו"ש', lastSync: '2024-12-15', status: 'connected', balance: 45600 },
  { id: 'bc2', bankName: 'בנק הפועלים', accountType: 'חיסכון', lastSync: '2024-12-14', status: 'connected', balance: 125000 },
  { id: 'bc3', bankName: 'בנק דיסקונט', accountType: 'משכנתא', lastSync: '2024-12-10', status: 'disconnected' },
];

export const mockInvestmentPortfolio: InvestmentPortfolio = {
  id: 'inv1', clientId: '4', totalValue: 485000, lastUpdated: '2024-12-15',
  investments: [
    { id: 'i1', name: 'ת.א 125', type: 'etf', value: 125000, quantity: 50, purchasePrice: 2200, currentPrice: 2500, returns: 15000, returnsPercentage: 13.6 },
    { id: 'i2', name: 'S&P 500 ETF', type: 'etf', value: 180000, quantity: 30, purchasePrice: 5200, currentPrice: 6000, returns: 24000, returnsPercentage: 15.4 },
    { id: 'i3', name: 'אג"ח ממשלתי', type: 'bonds', value: 80000, quantity: 100, purchasePrice: 780, currentPrice: 800, returns: 2000, returnsPercentage: 2.6 },
    { id: 'i4', name: 'קרן נדל"ן', type: 'real_estate', value: 60000, quantity: 10, purchasePrice: 5500, currentPrice: 6000, returns: 5000, returnsPercentage: 9.1 },
    { id: 'i5', name: 'קרן אג"ח קונצרני', type: 'mutual_funds', value: 40000, quantity: 200, purchasePrice: 190, currentPrice: 200, returns: 2000, returnsPercentage: 5.3 },
  ],
};

export const mockRecordings: Recording[] = [
  { id: 'rec1', type: 'audio', duration: 180, createdAt: '2024-12-15', createdBy: '2', relatedTo: 'שיחה עם לקוח - ישראל ישראלי', transcription: 'שיחת ייעוץ בנושא ביטוח חיים...' },
  { id: 'rec2', type: 'audio', duration: 240, createdAt: '2024-12-10', createdBy: '2', relatedTo: 'פגישת סקירה רבעונית', transcription: 'סקירה רבעונית של תיק ההשקעות...' },
];

export const mockAIMessages: AIMessage[] = [
  { id: 'ai1', role: 'assistant', content: 'שלום! אני העוזר החכם של אשורנס. איך אוכל לעזור לך היום?', timestamp: '2024-12-15T10:00:00' },
];

export const aiResponses: Record<string, string[]> = {
  default: [
    'אני כאן לעזור לך עם כל שאלה בנושא ביטוח, פנסיה והשקעות. מה תרצה לדעת?',
    'שאלה מצוינת! אבדוק את הנתונים שלך ואחזור עם תשובה מפורטת.',
    'אני יכול לנתח את הנתונים שלך ולהציע המלצות מותאמות אישית.',
  ],
  policies: [
    'יש לך 8 פוליסות פעילות: חיים, בריאות, רכב, דירה, פנסיה, השקעות, עסק וגמל. הפרמיה הכוללת: 4,480 ₪/חודש.',
    'לפי ניתוח ה-AI שלנו, ניתן לחסוך עד 18% על ביטוח הרכב ו-12% על ביטוח הבריאות.',
    'מומלץ לשקול ביטוח מחלות קשות - זה חסר בתיק שלך.',
  ],
  regulatory: [
    'נתוני המסלקה הפנסיונית שלך עודכנו לאחרונה ב-15/12/2024. הצבירה הכוללת: 610,000 ₪.',
    'דוח הר הביטוח מראה 4 פוליסות פעילות. ניתוח AI מזהה חיסכון פוטנציאלי של 2,400 ₪ בשנה.',
    'נתוני גמל נט מראים 3 חשבונות עם יתרה כוללת של 322,000 ₪. ביצועים מעל הממוצע בענף.',
  ],
  investments: [
    'תיק ההשקעות שלך שווה 485,000 ₪ עם תשואה כוללת של 10.2% השנה.',
    'מומלץ לאזן מחדש את התיק - חשיפה גבוהה למניות (63%). שקול להגדיל אג"ח.',
    'ביצועי ה-S&P 500 ETF שלך מעולים - +15.4%. המשך להחזיק.',
  ],
  documents: [
    'ניתחתי 5 מסמכים בתיק שלך. 3 מעובדים, 1 חתום ו-1 ממתין לטיפול.',
    'אני יכול לנתח כל מסמך שתעלה - PDF, Excel, ZIP ועוד. פשוט גרור ושחרר.',
    'המסמך האחרון שהועלה נותח בהצלחה. סיכום: פוליסת ביטוח חיים עם כיסוי של 1,000,000 ₪.',
  ],
  affiliate: [
    'תוכנית השותפים שלך: 3 שותפים פעילים, 51 הפניות, רווח כולל: 36,100 ₪.',
    'שותף AFF-001 הוביל עם 25 הפניות ו-18,500 ₪ רווח. מומלץ להגדיל את שיעור העמלה.',
    'ליצירת קישור שותפים חדש, עבור לעמוד "שותפים" ולחץ "צור שותף חדש".',
  ],
};

export const chartData = {
  monthlyPremiums: [
    { month: 'ינו', value: 4200 }, { month: 'פבר', value: 4350 },
    { month: 'מרץ', value: 4380 }, { month: 'אפר', value: 4380 },
    { month: 'מאי', value: 4480 }, { month: 'יונ', value: 4480 },
    { month: 'יול', value: 4480 }, { month: 'אוג', value: 4480 },
    { month: 'ספט', value: 4480 }, { month: 'אוק', value: 4480 },
    { month: 'נוב', value: 4480 }, { month: 'דצמ', value: 4480 },
  ],
  policyDistribution: [
    { name: 'חיים', value: 450, color: '#1e3a6e' },
    { name: 'בריאות', value: 380, color: '#2451a0' },
    { name: 'רכב', value: 320, color: '#3468c4' },
    { name: 'דירה', value: 180, color: '#5b8ed8' },
    { name: 'פנסיה', value: 1200, color: '#c9a227' },
    { name: 'השקעות', value: 500, color: '#d4b44a' },
    { name: 'עסק', value: 850, color: '#93b8ea' },
    { name: 'גמל', value: 600, color: '#0f2244' },
  ],
  investmentPerformance: [
    { month: 'ינו', value: 420000 }, { month: 'פבר', value: 425000 },
    { month: 'מרץ', value: 435000 }, { month: 'אפר', value: 442000 },
    { month: 'מאי', value: 450000 }, { month: 'יונ', value: 455000 },
    { month: 'יול', value: 460000 }, { month: 'אוג', value: 458000 },
    { month: 'ספט', value: 465000 }, { month: 'אוק', value: 470000 },
    { month: 'נוב', value: 478000 }, { month: 'דצמ', value: 485000 },
  ],
  agentPerformance: [
    { name: 'שרה לוי', policies: 45, revenue: 125000, clients: 32 },
    { name: 'דוד מזרחי', policies: 28, revenue: 78000, clients: 20 },
    { name: 'יוסי כהן', policies: 52, revenue: 145000, clients: 38 },
    { name: 'מרים שמעוני', policies: 35, revenue: 98000, clients: 25 },
  ],
};

export const mockActivity = [
  { id: 'act1', type: 'policy', message: 'פוליסת ביטוח רכב חודשה', time: 'לפני שעה', icon: '🔄' },
  { id: 'act2', type: 'document', message: 'מסמך חדש הועלה - דוח מסלקה', time: 'לפני 3 שעות', icon: '📄' },
  { id: 'act3', type: 'ai', message: 'ניתוח AI הושלם - המלצות חיסכון', time: 'לפני 5 שעות', icon: '🤖' },
  { id: 'act4', type: 'payment', message: 'תשלום פרמיה חודשי 4,480 ₪', time: 'אתמול', icon: '💳' },
  { id: 'act5', type: 'regulatory', message: 'נתוני הר הביטוח עודכנו', time: 'לפני יומיים', icon: '🏛️' },
  { id: 'act6', type: 'sign', message: 'הסכם שירות נחתם דיגיטלית', time: 'לפני 3 ימים', icon: '✍️' },
  { id: 'act7', type: 'affiliate', message: 'הפניה חדשה - שותף AFF-001', time: 'לפני שבוע', icon: '🤝' },
];

export const mockProducts = [
  { id: 'mp1', name: 'ביטוח סייבר לעסקים', provider: 'הראל', category: 'עסקי', price: 'החל מ-250 ₪/חודש', rating: 4.8, features: ['הגנה מפני מתקפות', 'כיסוי נזק כספי', 'שירות תגובה 24/7'] },
  { id: 'mp2', name: 'ביטוח חיים משולב חיסכון', provider: 'מגדל', category: 'חיים', price: 'החל מ-300 ₪/חודש', rating: 4.6, features: ['כיסוי למקרה מוות', 'רכיב חיסכון', 'הגנה מאינפלציה'] },
  { id: 'mp3', name: 'קרן פנסיה מקיפה', provider: 'מנורה', category: 'פנסיה', price: 'לפי שכר', rating: 4.7, features: ['דמי ניהול נמוכים', 'מסלולי השקעה מגוונים', 'ביטוח נכות ושאירים'] },
  { id: 'mp4', name: 'ביטוח נסיעות פרימיום', provider: 'הפניקס', category: 'נסיעות', price: 'החל מ-50 ₪/יום', rating: 4.5, features: ['כיסוי רפואי מלא', 'ביטול טיסה', 'איבוד מזוודות'] },
  { id: 'mp5', name: 'גמל להשקעה - מסלול צמיחה', provider: 'אלטשולר שחם', category: 'השקעות', price: 'ללא מינימום', rating: 4.9, features: ['תשואה גבוהה', 'נזילות גבוהה', 'דמי ניהול 0.5%'] },
];
