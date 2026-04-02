'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

type DiagramType = 'system' | 'user_hierarchy' | 'data_flow' | 'deployment' | 'entity';

interface DiagramInfo {
  key: DiagramType;
  title: string;
  icon: string;
  mermaid: string;
  description: string;
}

const diagrams: DiagramInfo[] = [
  {
    key: 'system',
    title: 'ארכיטקטורת מערכת',
    icon: '🏗️',
    description: 'סקירת ארכיטקטורה כוללת של מערכת Assurance',
    mermaid: `graph TB
    subgraph "Frontend - Next.js 16"
        UI[UI Layer - React 19]
        Auth[Authentication Module]
        I18N[i18n - HE/EN/RU/FR/AR]
        Dashboard[Dashboard Module]
        DocMgmt[Document Management]
        AIChat[AI Assistant Chat]
        ESign[E-Signature & Recording]
    end

    subgraph "API Layer"
        API[REST API / Server Actions]
        WSS[WebSocket Server]
        Upload[File Upload Service]
    end

    subgraph "Business Logic"
        PolicyEngine[Policy Management Engine]
        AIEngine[AI Analysis Engine]
        ReportEngine[Report Generator]
        AffiliateEngine[Affiliate System]
        RegEngine[Regulatory Compliance]
    end

    subgraph "External Integrations"
        Maslaka[מסלקה פנסיונית API]
        HarBituach[הר הביטוח API]
        GamalNet[גמל נט API]
        Banks[Bank APIs]
        InsuranceCo[Insurance Companies]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Cache[(Redis Cache)]
        Storage[(Object Storage - S3)]
        Search[(Elasticsearch)]
    end

    UI --> API
    Auth --> API
    Dashboard --> API
    DocMgmt --> Upload
    AIChat --> WSS
    API --> PolicyEngine
    API --> AIEngine
    API --> ReportEngine
    API --> AffiliateEngine
    API --> RegEngine
    RegEngine --> Maslaka
    RegEngine --> HarBituach
    RegEngine --> GamalNet
    PolicyEngine --> InsuranceCo
    PolicyEngine --> DB
    AIEngine --> DB
    ReportEngine --> DB
    Upload --> Storage
    API --> Cache
    API --> Search`,
  },
  {
    key: 'user_hierarchy',
    title: 'היררכיית משתמשים',
    icon: '👥',
    description: 'מבנה ארגוני והרשאות משתמשים',
    mermaid: `graph TB
    SA[🔴 Super Admin<br/>מנהל על<br/>Level 100]
    AD[🟠 Admin<br/>מנהל מערכת<br/>Level 80]
    AO[🟡 Agency Owner<br/>בעל סוכנות<br/>Level 60]
    AG[🟢 Agent<br/>סוכן<br/>Level 40]
    SUB[🔵 Sub Agent<br/>סוכן משנה<br/>Level 20]
    CL[⚪ Client<br/>לקוח<br/>Level 0]

    SA --> AD
    AD --> AO
    AO --> AG
    AG --> SUB
    AG --> CL
    SUB --> CL

    SA -.- |"Full system access<br/>כל ההרשאות"| SA
    AD -.- |"User management<br/>ניהול משתמשים"| AD
    AO -.- |"Agency management<br/>ניהול סוכנות"| AO
    AG -.- |"Client management<br/>ניהול לקוחות"| AG
    SUB -.- |"View only<br/>צפייה בלבד"| SUB
    CL -.- |"Own data only<br/>נתונים אישיים"| CL`,
  },
  {
    key: 'data_flow',
    title: 'זרימת נתונים',
    icon: '🔄',
    description: 'תהליך עיבוד נתונים ומסמכים עם AI',
    mermaid: `graph LR
    subgraph "Input Sources"
        PDF[📄 PDF Documents]
        XLS[📊 Excel Files]
        ZIP[📦 ZIP Archives]
        API_IN[🔗 API Data]
        SCAN[📷 Scanned Docs]
    end

    subgraph "Processing Pipeline"
        UPLOAD[📤 Upload Service]
        PARSE[🔍 Document Parser]
        OCR[👁️ OCR Engine]
        AI[🤖 AI Analysis]
        EXTRACT[📋 Data Extraction]
    end

    subgraph "AI Analysis"
        NLP[Natural Language Processing]
        RISK[Risk Assessment]
        REC[Recommendations Engine]
        COMP[Compliance Check]
    end

    subgraph "Output"
        REPORT[📊 Reports]
        INSIGHT[💡 AI Insights]
        ALERT[🔔 Alerts]
        DASH[📱 Dashboard]
    end

    PDF --> UPLOAD
    XLS --> UPLOAD
    ZIP --> UPLOAD
    API_IN --> PARSE
    SCAN --> OCR

    UPLOAD --> PARSE
    OCR --> PARSE
    PARSE --> AI
    PARSE --> EXTRACT

    AI --> NLP
    AI --> RISK
    AI --> REC
    AI --> COMP

    NLP --> REPORT
    RISK --> INSIGHT
    REC --> ALERT
    COMP --> DASH
    EXTRACT --> REPORT`,
  },
  {
    key: 'deployment',
    title: 'ארכיטקטורת פריסה',
    icon: '☁️',
    description: 'תשתית Railway ושירותי ענן',
    mermaid: `graph TB
    subgraph "CDN / Edge"
        CF[Cloudflare CDN]
        DNS[DNS: assurance.co.il]
    end

    subgraph "Railway Platform"
        subgraph "Web Service"
            NEXT[Next.js 16 App<br/>Standalone Mode]
        end
        subgraph "Workers"
            WORKER[Background Workers<br/>Report Generation<br/>AI Processing]
        end
        subgraph "Database"
            PG[(PostgreSQL)]
            REDIS[(Redis)]
        end
    end

    subgraph "External Services"
        S3[AWS S3 / Object Storage<br/>Document Storage]
        AI_API[OpenAI API<br/>AI Analysis]
        EMAIL[Email Service<br/>service@assurance.co.il]
        SMS[SMS Gateway]
    end

    subgraph "Israeli Gov APIs"
        GOV[רשות שוק ההון APIs]
    end

    DNS --> CF
    CF --> NEXT
    NEXT --> PG
    NEXT --> REDIS
    NEXT --> S3
    NEXT --> AI_API
    WORKER --> PG
    WORKER --> AI_API
    WORKER --> GOV
    NEXT --> EMAIL
    NEXT --> SMS`,
  },
  {
    key: 'entity',
    title: 'מודל נתונים',
    icon: '🗃️',
    description: 'Entity Relationship Diagram - מבנה בסיס הנתונים',
    mermaid: `erDiagram
    USER ||--o{ POLICY : manages
    USER ||--o{ DOCUMENT : uploads
    USER ||--o{ RECORDING : creates
    USER }o--|| AGENCY : belongs_to
    USER ||--o{ AI_CONVERSATION : has

    AGENCY ||--o{ AGENCY : has_sub_agencies
    AGENCY ||--o{ USER : employs

    POLICY ||--o{ DOCUMENT : has
    POLICY }o--|| USER : owned_by

    DOCUMENT ||--o| SIGNATURE : signed_with
    DOCUMENT ||--o| AI_ANALYSIS : analyzed_by

    REGULATORY_REPORT }o--|| USER : for_client
    REGULATORY_REPORT ||--o{ AI_INSIGHT : generates

    AFFILIATE }o--|| USER : managed_by
    AFFILIATE ||--o{ REFERRAL : tracks

    INVESTMENT_PORTFOLIO }o--|| USER : owned_by
    INVESTMENT_PORTFOLIO ||--o{ INVESTMENT : contains

    BANK_CONNECTION }o--|| USER : linked_to

    USER {
        string id PK
        string email
        string firstName
        string lastName
        enum role
        string agencyId FK
        string parentAgentId FK
        boolean isActive
        string licenseNumber
    }

    AGENCY {
        string id PK
        string name
        string licenseNumber
        string parentAgencyId FK
        string ownerId FK
        enum regulatoryStatus
    }

    POLICY {
        string id PK
        string policyNumber
        enum type
        string provider
        enum status
        number premium
        number coverageAmount
        string clientId FK
        string agentId FK
    }

    DOCUMENT {
        string id PK
        string name
        enum type
        enum status
        string clientId FK
        string policyId FK
    }`,
  },
];

export default function ArchitecturePage() {
  const { t } = useLanguage();
  const [activeDiagram, setActiveDiagram] = useState<DiagramType>('system');

  const currentDiagram = diagrams.find(d => d.key === activeDiagram)!;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
        🔧 {t('architecture')} - UML Diagrams
      </h1>
      <p style={{ color: '#6b7a9a', fontSize: '15px', marginBottom: '24px' }}>
        תרשימי ארכיטקטורה ומבנה מערכת Assurance
      </p>

      {/* Diagram Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {diagrams.map(d => (
          <button key={d.key} onClick={() => setActiveDiagram(d.key)} style={{
            padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: activeDiagram === d.key ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : 'white',
            color: activeDiagram === d.key ? 'white' : '#1e3a6e',
            fontWeight: '700', fontSize: '13px',
            boxShadow: activeDiagram === d.key ? '0 4px 12px rgba(30,58,110,0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span>{d.icon}</span> {d.title}
          </button>
        ))}
      </div>

      {/* Current Diagram */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>{currentDiagram.icon}</span>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e' }}>{currentDiagram.title}</h2>
            <p style={{ color: '#6b7a9a', fontSize: '14px' }}>{currentDiagram.description}</p>
          </div>
        </div>

        {/* Mermaid Code Display */}
        <div style={{
          background: '#0a1628', borderRadius: '12px', padding: '20px', overflowX: 'auto',
          fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.7', color: '#93b8ea',
          whiteSpace: 'pre-wrap', maxHeight: '600px', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#c9a227', fontWeight: '700' }}>📐 Mermaid Diagram: {currentDiagram.title}</span>
            <button
              onClick={() => navigator.clipboard.writeText(currentDiagram.mermaid)}
              style={{
                padding: '4px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)', color: '#93b8ea', fontSize: '11px', cursor: 'pointer',
              }}
            >
              📋 העתק
            </button>
          </div>
          {currentDiagram.mermaid}
        </div>
      </div>

      {/* System Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { icon: '⚡', title: 'Next.js 16', desc: 'React 19, Server Actions, Standalone Mode', color: '#1e3a6e' },
          { icon: '🎨', title: 'UI/UX', desc: 'Hebrew RTL, 5 Languages, Responsive Design', color: '#2451a0' },
          { icon: '🔐', title: 'Authentication', desc: '6-Level User Hierarchy, Role-Based Access', color: '#c9a227' },
          { icon: '🤖', title: 'AI Engine', desc: 'Document Analysis, Insights, Recommendations', color: '#1a8c5a' },
          { icon: '📊', title: 'BI & Reports', desc: 'Advanced Analytics, Regulatory Reports', color: '#8b5cf6' },
          { icon: '☁️', title: 'Railway Deploy', desc: 'Auto-scaling, PostgreSQL, Redis', color: '#f59e0b' },
          { icon: '📄', title: 'Document Processing', desc: 'PDF, Excel, ZIP, AI Analysis, E-Sign', color: '#ef4444' },
          { icon: '🏛️', title: 'Regulatory', desc: 'מסלקה, הר הביטוח, גמל נט, רשות שוק ההון', color: '#06b6d4' },
        ].map(card => (
          <div key={card.title} className="card" style={{ padding: '20px', borderInlineStart: `4px solid ${card.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{card.icon}</span>
              <h3 style={{ fontWeight: '700', color: '#1e3a6e', fontSize: '16px' }}>{card.title}</h3>
            </div>
            <p style={{ color: '#6b7a9a', fontSize: '13px' }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
