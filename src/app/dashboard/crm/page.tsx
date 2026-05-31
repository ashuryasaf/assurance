'use client';

import { apiFetch, useApi } from '@/lib/client-api';
import { useState, useRef } from 'react';

type CustomerType = 'general' | 'real_estate';
type CallOutcome = 'called' | 'no_answer' | 'interested' | 'not_interested' | 'follow_up' | 'appointment_scheduled' | 'wrong_number';

type LeadListItem = {
  id: string;
  idNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  customerType: CustomerType;
  status: string;
  lastCallOutcome?: CallOutcome;
  nextFollowUpAt?: string;
  nextAppointment?: string;
  policyCount: number;
  communicationCount: number;
  appointmentCount: number;
  updatedAt: string;
  source?: string;
};

type LeadDetail = {
  lead: LeadListItem & {
    address?: string;
    altPhone?: string;
    birthDate?: string;
    gender?: string;
    notes?: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  };
  policies: Array<{
    id: string;
    policyNumber?: string;
    type?: string;
    provider?: string;
    status?: string;
    premium?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
  }>;
  communications: Array<{
    id: string;
    channel: string;
    direction: string;
    outcome?: CallOutcome;
    summary: string;
    occurredAt: string;
  }>;
  appointments: Array<{
    id: string;
    leadId: string;
    title: string;
    scheduledAt: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
  }>;
  imports: Array<{
    id: string;
    rowIndex: number;
    status: string;
    fileName: string;
    importedAt: string;
    error?: string;
  }>;
};

type ImportRecord = {
  id: string;
  fileName: string;
  rowCount: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  createdAt: string;
};

type ImportResponse = {
  import: ImportRecord;
  sampleErrors: Array<{ rowIndex: number; error?: string }>;
};

type UpcomingAppointment = {
  id: string;
  leadId: string;
  title: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  lead: {
    id: string;
    idNumber: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    city?: string;
    customerType: CustomerType;
    status: string;
  };
};

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  scheduled: 'נקבעה פגישה',
  qualified: 'מתאים',
  customer: 'לקוח',
  lost: 'אבוד',
};

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  general: 'כל השאר',
  real_estate: 'נדל"ן',
};

const OUTCOME_LABELS: Record<CallOutcome, string> = {
  called: 'בוצעה שיחה',
  no_answer: 'אין מענה',
  interested: 'מעוניין/ת',
  not_interested: 'לא מעוניין/ת',
  follow_up: 'דרוש פולואפ',
  appointment_scheduled: 'נקבעה פגישה',
  wrong_number: 'מספר שגוי',
};

export default function CrmPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | CustomerType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const leadQueryParams = new URLSearchParams();
  if (statusFilter !== 'all') leadQueryParams.set('status', statusFilter);
  if (customerTypeFilter !== 'all') leadQueryParams.set('customerType', customerTypeFilter);
  const leadQuery = leadQueryParams.toString();

  const appointmentQueryParams = new URLSearchParams();
  if (customerTypeFilter !== 'all') appointmentQueryParams.set('customerType', customerTypeFilter);
  const appointmentQuery = appointmentQueryParams.toString();

  const leadsApi = useApi<{ leads: LeadListItem[] }>(`/api/crm/leads${leadQuery ? `?${leadQuery}` : ''}`);
  const appointmentsApi = useApi<{ appointments: UpcomingAppointment[] }>(
    `/api/crm/appointments${appointmentQuery ? `?${appointmentQuery}` : ''}`,
  );
  const importsApi = useApi<{ imports: ImportRecord[] }>('/api/crm/import');
  const detailApi = useApi<LeadDetail>(selectedId ? `/api/crm/leads/${selectedId}` : null);

  const leads = leadsApi.data?.leads ?? [];
  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [l.idNumber, l.firstName, l.lastName, l.email, l.phone, l.city]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q));
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('file', files[0]);
      const resp = await apiFetch<ImportResponse>('/api/crm/import', { method: 'POST', body: form });
      setUploadResult(resp);
      await Promise.all([leadsApi.refresh(), importsApi.refresh(), appointmentsApi.refresh()]);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const refreshCrm = () => {
    void detailApi.refresh();
    void leadsApi.refresh();
    void appointmentsApi.refresh();
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
          📇 CRM — תיק לקוחות
        </h1>
        <p style={{ color: '#6b7a9a', fontSize: '15px' }}>
          העלה קובץ לקוחות, הפרד בין לקוחות נדל"ן לשאר, ותעד שיחות, סטטוסי עניין ופולואפים ביומן הסוכן.
        </p>
      </div>

      {/* Upload zone */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '12px' }}>
          📤 העלאת קובץ נתונים
        </h2>
        <p style={{ color: '#6b7a9a', fontSize: '13px', marginBottom: '12px' }}>
          הקובץ צריך להכיל עמודה של תעודת זהות (<code>ת.ז</code> / <code>תעודת זהות</code> / <code>id</code>).
          ניתן לכלול גם עמודות לפרטים אישיים, פוליסות וסיכומי תקשורת — כל מה שלא מזוהה יישמר במטא-דאטה של הלקוח.
          רשומה קיימת תזוהה לפי תעודת הזהות ותעודכן; חדשה תיווצר.
        </p>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '24px', border: '2px dashed #dae8f8', borderRadius: '12px', textAlign: 'center',
            cursor: 'pointer', background: '#f8f9fc',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '6px' }}>📥</div>
          <div style={{ fontWeight: '700', color: '#1e3a6e' }}>בחר / גרור קובץ CSV או JSON</div>
          <div style={{ fontSize: '12px', color: '#6b7a9a', marginTop: '4px' }}>עד 10MB / 5,000 שורות</div>
          <input ref={fileInputRef} type="file" accept=".csv,.json,text/csv,application/json" style={{ display: 'none' }}
            onChange={e => void handleUpload(e.target.files)} />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/api/crm/template" style={{
            padding: '6px 14px', borderRadius: '8px', border: '1px solid #dae8f8',
            background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600',
            textDecoration: 'none',
          }}>
            ⬇ הורד תבנית (CSV)
          </a>
          {uploading && <span style={{ color: '#856404' }}>⏳ מייבא...</span>}
        </div>
        {uploadError && (
          <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '10px', background: '#fce4ec', color: '#c62828', fontSize: '14px' }}>
            ⚠️ {uploadError}
          </div>
        )}
        {uploadResult && (
          <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '10px', background: '#d4edda', color: '#155724', fontSize: '14px' }}>
            ✅ <strong>{uploadResult.import.fileName}</strong>: {uploadResult.import.rowCount} שורות —
            {' '}{uploadResult.import.createdCount} נוצרו, {uploadResult.import.updatedCount} עודכנו, {uploadResult.import.errorCount} שגיאות.
            {uploadResult.sampleErrors.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingInlineStart: '20px', fontSize: '13px' }}>
                {uploadResult.sampleErrors.map(e => (
                  <li key={e.rowIndex}>שורה {e.rowIndex + 1}: {e.error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Follow-up calendar */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '12px' }}>📅 יומן פולואפים קרובים</h2>
        {appointmentsApi.loading ? (
          <div style={{ color: '#6b7a9a', fontSize: '14px' }}>טוען פגישות...</div>
        ) : (appointmentsApi.data?.appointments ?? []).length === 0 ? (
          <div style={{ color: '#6b7a9a', fontSize: '14px' }}>אין פגישות קרובות בסינון הנוכחי.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {(appointmentsApi.data?.appointments ?? []).slice(0, 6).map(a => (
              <button key={a.id} onClick={() => setSelectedId(a.leadId)} style={{
                textAlign: 'start', border: '1px solid #dae8f8', background: '#f8f9fc', borderRadius: '12px', padding: '12px', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                  <strong style={{ color: '#1e3a6e', fontSize: '14px' }}>{a.title}</strong>
                  <CustomerTypeBadge type={a.lead.customerType} />
                </div>
                <div style={{ color: '#3468c4', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>{formatDateTime(a.scheduledAt)}</div>
                <div style={{ color: '#6b7a9a', fontSize: '12px', marginTop: '4px' }}>
                  {[a.lead.firstName, a.lead.lastName].filter(Boolean).join(' ') || a.lead.idNumber}
                  {a.lead.phone ? ` • ${a.lead.phone}` : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Import history */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '12px' }}>📚 היסטוריית ייבוא</h2>
        {(importsApi.data?.imports ?? []).length === 0 && (
          <div style={{ color: '#6b7a9a', fontSize: '14px' }}>טרם בוצעה העלאה.</div>
        )}
        {(importsApi.data?.imports ?? []).map(imp => (
          <div key={imp.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', background: '#f8f9fc', borderRadius: '10px', marginBottom: '8px',
            flexWrap: 'wrap', gap: '8px',
          }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1e3a6e', fontSize: '14px' }}>📄 {imp.fileName}</div>
              <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{new Date(imp.createdAt).toLocaleString('he-IL')}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ color: '#1e3a6e' }}>שורות: <strong>{imp.rowCount}</strong></span>
              <span style={{ color: '#1a8c5a' }}>נוצרו: <strong>{imp.createdCount}</strong></span>
              <span style={{ color: '#c9a227' }}>עודכנו: <strong>{imp.updatedCount}</strong></span>
              {imp.errorCount > 0 && <span style={{ color: '#c62828' }}>שגיאות: <strong>{imp.errorCount}</strong></span>}
            </div>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="חפש לפי ת.ז, שם, אימייל או טלפון..."
          style={{ flex: 1, minWidth: '240px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            ['all', 'הכל'],
            ['real_estate', CUSTOMER_TYPE_LABELS.real_estate],
            ['general', CUSTOMER_TYPE_LABELS.general],
          ].map(([k, label]) => (
            <button key={k} onClick={() => setCustomerTypeFilter(k as 'all' | CustomerType)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              background: customerTypeFilter === k ? '#3468c4' : '#f0f6ff',
              color: customerTypeFilter === k ? 'white' : '#1e3a6e',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[['all', 'הכל'], ...Object.entries(STATUS_LABELS)].map(([k, label]) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              background: statusFilter === k ? '#1e3a6e' : '#f0f6ff',
              color: statusFilter === k ? 'white' : '#1e3a6e',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Lead list */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {leadsApi.loading ? (
          <div style={{ padding: '24px', color: '#6b7a9a' }}>טוען...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '24px', color: '#6b7a9a' }}>אין לקוחות התואמים לסינון.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1080px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ת.ז', 'שם', 'סוג', 'דוא"ל', 'טלפון', 'עיר', 'סטטוס', 'אינדיקציה', 'פגישות', 'פולואפ הבא', 'עודכן'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: '700', fontSize: '13px', textAlign: 'start' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} onClick={() => setSelectedId(l.id)}
                    style={{ borderBottom: '1px solid #f0f4f8', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: '600' }}>{l.idNumber}</td>
                    <td style={{ padding: '12px 14px' }}>{[l.firstName, l.lastName].filter(Boolean).join(' ') || '-'}</td>
                    <td style={{ padding: '12px 14px' }}><CustomerTypeBadge type={l.customerType} /></td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{l.email ?? '-'}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{l.phone ?? '-'}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{l.city ?? '-'}</td>
                    <td style={{ padding: '12px 14px' }}><StatusPill status={l.status} /></td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7a9a' }}>{l.lastCallOutcome ? OUTCOME_LABELS[l.lastCallOutcome] : '-'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{l.appointmentCount}</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: l.nextFollowUpAt || l.nextAppointment ? '#3468c4' : '#6b7a9a' }}>
                      {l.nextFollowUpAt || l.nextAppointment ? formatDateTime(l.nextFollowUpAt ?? l.nextAppointment) : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7a9a' }}>
                      {new Date(l.updatedAt).toLocaleDateString('he-IL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead detail modal */}
      {selectedId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelectedId(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '820px', width: '94%', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            {detailApi.loading || !detailApi.data ? (
              <div style={{ color: '#6b7a9a', padding: '24px' }}>טוען...</div>
            ) : (
              <LeadDetailView detail={detailApi.data} onClose={() => setSelectedId(null)} onUpdated={refreshCrm} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadDetailView({ detail, onClose, onUpdated }: { detail: LeadDetail; onClose: () => void; onUpdated: () => void }) {
  const { lead, policies, communications, appointments, imports } = detail;
  const [showAddComm, setShowAddComm] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddPolicy, setShowAddPolicy] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7a9a', fontFamily: 'monospace' }}>ת.ז {lead.idNumber}</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e' }}>
            {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || '(ללא שם)'}
          </h2>
          <div style={{ fontSize: '13px', color: '#6b7a9a', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>סטטוס: <strong>{STATUS_LABELS[lead.status] ?? lead.status}</strong></span>
            <CustomerTypeBadge type={lead.customerType} />
            {lead.lastCallOutcome && <span>אינדיקציה אחרונה: <strong>{OUTCOME_LABELS[lead.lastCallOutcome]}</strong></span>}
            {lead.source && <span>מקור: {lead.source}</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'דוא"ל', value: lead.email },
          { label: 'טלפון', value: lead.phone },
          { label: 'טלפון נוסף', value: lead.altPhone },
          { label: 'כתובת', value: lead.address },
          { label: 'עיר', value: lead.city },
          { label: 'פולואפ הבא', value: lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : undefined },
        ].map(f => (
          <div key={f.label} style={{ padding: '10px', background: '#f0f6ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{f.label}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a6e' }}>{f.value || '—'}</div>
          </div>
        ))}
      </div>

      {lead.notes && (
        <div style={{ padding: '12px 16px', background: '#fdf6e3', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#856404' }}>
          📝 {lead.notes}
        </div>
      )}

      <SectionHeader title={`📅 פגישות ופולואפים (${appointments.length})`} onAdd={() => setShowAddAppointment(true)} addLabel="קבע פגישה" />
      {appointments.length === 0 ? (
        <div style={{ color: '#6b7a9a', fontSize: '13px', marginBottom: '16px' }}>אין פגישות מתוכננות.</div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {appointments.map(a => (
            <div key={a.id} style={{ padding: '10px 14px', background: a.status === 'scheduled' ? '#eef5ff' : '#f8f9fc', borderRadius: '8px', marginBottom: '6px' }}>
              <div style={{ fontWeight: '700', color: '#1e3a6e', fontSize: '13px' }}>
                {a.title} • {formatDateTime(a.scheduledAt)}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7a9a', marginTop: '3px' }}>
                סטטוס: {a.status === 'scheduled' ? 'מתוכננת' : a.status === 'completed' ? 'הושלמה' : 'בוטלה'}
              </div>
              {a.notes && <div style={{ fontSize: '13px', color: '#52668c', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{a.notes}</div>}
            </div>
          ))}
        </div>
      )}

      <SectionHeader title={`📋 פוליסות (${policies.length})`} onAdd={() => setShowAddPolicy(true)} addLabel="הוסף פוליסה" />
      {policies.length === 0 ? (
        <div style={{ color: '#6b7a9a', fontSize: '13px', marginBottom: '16px' }}>טרם נרשמו פוליסות.</div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {policies.map(p => (
            <div key={p.id} style={{ padding: '10px 14px', background: '#f8f9fc', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1e3a6e' }}>
                  {p.type ?? 'פוליסה'} {p.policyNumber ? `• ${p.policyNumber}` : ''} {p.provider ? `• ${p.provider}` : ''}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7a9a' }}>
                  {p.startDate ?? '—'} → {p.endDate ?? '—'} {p.status ? `• ${p.status}` : ''}
                </div>
              </div>
              {typeof p.premium === 'number' && (
                <div style={{ fontWeight: '700', color: '#c9a227' }}>₪{p.premium.toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <SectionHeader title={`💬 תקשורת (${communications.length})`} onAdd={() => setShowAddComm(true)} addLabel="רשום שיחה" />
      {communications.length === 0 ? (
        <div style={{ color: '#6b7a9a', fontSize: '13px', marginBottom: '16px' }}>אין רשומות תקשורת.</div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {communications.map(c => (
            <div key={c.id} style={{ padding: '10px 14px', background: '#f8f9fc', borderRadius: '8px', marginBottom: '6px' }}>
              <div style={{ fontWeight: '600', color: '#1e3a6e', fontSize: '13px' }}>
                {c.channel} • {c.direction === 'inbound' ? 'נכנסת' : 'יוצאת'} • {new Date(c.occurredAt).toLocaleString('he-IL')}
                {c.outcome ? ` • ${OUTCOME_LABELS[c.outcome]}` : ''}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7a9a', marginTop: '4px' }}>{c.summary}</div>
            </div>
          ))}
        </div>
      )}

      {imports.length > 0 && (
        <details style={{ marginBottom: '12px' }}>
          <summary style={{ fontWeight: '700', color: '#1e3a6e', cursor: 'pointer' }}>📚 היסטוריית ייבוא ({imports.length})</summary>
          <div style={{ marginTop: '8px' }}>
            {imports.map(im => (
              <div key={im.id} style={{ padding: '8px 12px', background: '#f8f9fc', borderRadius: '8px', marginBottom: '4px', fontSize: '12px', color: '#6b7a9a' }}>
                {im.fileName} • שורה {im.rowIndex + 1} • {im.status}{im.error ? ` • ${im.error}` : ''} • {new Date(im.importedAt).toLocaleString('he-IL')}
              </div>
            ))}
          </div>
        </details>
      )}

      {Object.keys(lead.metadata).length > 0 && (
        <details>
          <summary style={{ fontWeight: '700', color: '#1e3a6e', cursor: 'pointer' }}>🗂️ נתונים נוספים מהקובץ</summary>
          <pre style={{ marginTop: '8px', padding: '12px', background: '#f8f9fc', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', direction: 'ltr' }}>
            {JSON.stringify(lead.metadata, null, 2)}
          </pre>
        </details>
      )}

      {showAddAppointment && (
        <AddAppointment lead={lead} onClose={() => setShowAddAppointment(false)} onSaved={() => { setShowAddAppointment(false); onUpdated(); }} />
      )}
      {showAddComm && (
        <AddCommunication leadId={lead.id} onClose={() => setShowAddComm(false)} onSaved={() => { setShowAddComm(false); onUpdated(); }} />
      )}
      {showAddPolicy && (
        <AddPolicy leadId={lead.id} onClose={() => setShowAddPolicy(false)} onSaved={() => { setShowAddPolicy(false); onUpdated(); }} />
      )}
    </>
  );
}

function CustomerTypeBadge({ type }: { type: CustomerType }) {
  const isRealEstate = type === 'real_estate';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
      background: isRealEstate ? '#eef5ff' : '#f3f4f6',
      color: isRealEstate ? '#2451a0' : '#52668c',
      border: `1px solid ${isRealEstate ? '#cfe0ff' : '#e1e7ef'}`,
      whiteSpace: 'nowrap',
    }}>
      {isRealEstate ? '🏘️ ' : '📁 '}{CUSTOMER_TYPE_LABELS[type]}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const palette = status === 'customer'
    ? { bg: '#e8f5e9', fg: '#2e7d32' }
    : status === 'lost'
      ? { bg: '#fce4ec', fg: '#c62828' }
      : status === 'scheduled'
        ? { bg: '#e3f2fd', fg: '#1565c0' }
        : { bg: '#fff3cd', fg: '#856404' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: palette.bg, color: palette.fg }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a6e' }}>{title}</h3>
      <button onClick={onAdd} style={{
        padding: '4px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: '#1e3a6e', color: 'white', fontSize: '12px', fontWeight: '600',
      }}>+ {addLabel}</button>
    </div>
  );
}

function AddCommunication({ leadId, onClose, onSaved }: { leadId: string; onClose: () => void; onSaved: () => void }) {
  const [channel, setChannel] = useState('phone');
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [outcome, setOutcome] = useState<'' | CallOutcome>('called');
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/crm/leads/${leadId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, direction, outcome: outcome || undefined, summary }),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose} title="רשום שיחה / אינדיקציה">
      {error && <div style={{ color: '#c62828', marginBottom: '8px' }}>⚠️ {error}</div>}
      <Field label="ערוץ">
        <select value={channel} onChange={e => setChannel(e.target.value)} style={inputStyle}>
          <option value="phone">טלפון</option>
          <option value="email">אימייל</option>
          <option value="whatsapp">וואטסאפ</option>
          <option value="sms">SMS</option>
          <option value="meeting">פגישה</option>
          <option value="other">אחר</option>
        </select>
      </Field>
      <Field label="כיוון">
        <select value={direction} onChange={e => setDirection(e.target.value as 'outbound' | 'inbound')} style={inputStyle}>
          <option value="outbound">יוצאת</option>
          <option value="inbound">נכנסת</option>
        </select>
      </Field>
      <Field label="אינדיקציית שיחה">
        <select value={outcome} onChange={e => setOutcome(e.target.value as '' | CallOutcome)} style={inputStyle}>
          <option value="">ללא</option>
          {Object.entries(OUTCOME_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="סיכום">
        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} style={{ ...inputStyle, fontFamily: 'inherit' }} />
      </Field>
      <FormButtons onCancel={onClose} onSubmit={() => void submit()} disabled={busy || !summary.trim()} submitLabel={busy ? 'שומר...' : 'שמור'} />
    </Overlay>
  );
}

function AddAppointment({ lead, onClose, onSaved }: { lead: LeadDetail['lead']; onClose: () => void; onSaved: () => void }) {
  const customerName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.idNumber;
  const [title, setTitle] = useState(`שיחת פולואפ עם ${customerName}`);
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/crm/leads/${lead.id}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, scheduledAt, notes: notes || undefined }),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose} title="קבע פגישה / פולואפ">
      {error && <div style={{ color: '#c62828', marginBottom: '8px' }}>⚠️ {error}</div>}
      <div style={{ padding: '10px 12px', background: '#f0f6ff', borderRadius: '10px', marginBottom: '10px', fontSize: '12px', color: '#52668c' }}>
        פרטי הלקוח יישמרו אוטומטית בפגישה: {lead.idNumber}{lead.phone ? ` • ${lead.phone}` : ''}{lead.email ? ` • ${lead.email}` : ''}
      </div>
      <Field label="כותרת"><input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} /></Field>
      <Field label="תאריך ושעה"><input type="datetime-local" value={scheduledAt} min={toLocalDateTimeValue(new Date())} onChange={e => setScheduledAt(e.target.value)} style={inputStyle} /></Field>
      <Field label="הערות לפולואפ"><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, fontFamily: 'inherit' }} /></Field>
      <FormButtons onCancel={onClose} onSubmit={() => void submit()} disabled={busy || !scheduledAt || !title.trim()} submitLabel={busy ? 'שומר...' : 'קבע'} />
    </Overlay>
  );
}

function AddPolicy({ leadId, onClose, onSaved }: { leadId: string; onClose: () => void; onSaved: () => void }) {
  const [policyNumber, setPolicyNumber] = useState('');
  const [type, setType] = useState('');
  const [provider, setProvider] = useState('');
  const [premium, setPremium] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/crm/leads/${leadId}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNumber: policyNumber || undefined,
          type: type || undefined,
          provider: provider || undefined,
          premium: premium ? Number(premium) : undefined,
        }),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose} title="הוסף פוליסה">
      {error && <div style={{ color: '#c62828', marginBottom: '8px' }}>⚠️ {error}</div>}
      <Field label="מספר פוליסה"><input value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} style={inputStyle} /></Field>
      <Field label="סוג ביטוח"><input value={type} onChange={e => setType(e.target.value)} style={inputStyle} /></Field>
      <Field label="חברה"><input value={provider} onChange={e => setProvider(e.target.value)} style={inputStyle} /></Field>
      <Field label="פרמיה (₪)"><input type="number" value={premium} onChange={e => setPremium(e.target.value)} style={inputStyle} /></Field>
      <FormButtons onCancel={onClose} onSubmit={() => void submit()} disabled={busy} submitLabel={busy ? 'שומר...' : 'שמור'} />
    </Overlay>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
  fontSize: '14px', outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  );
}

function FormButtons({ onCancel, onSubmit, disabled, submitLabel }: { onCancel: () => void; onSubmit: () => void; disabled: boolean; submitLabel: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
      <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #dae8f8', background: 'white', color: '#6b7a9a', fontWeight: '600', cursor: 'pointer' }}>ביטול</button>
      <button onClick={onSubmit} disabled={disabled} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.6 : 1 }}>{submitLabel}</button>
    </div>
  );
}

function Overlay({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', maxWidth: '460px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e3a6e', marginBottom: '12px' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

function formatDateTime(value: string | undefined): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
}

function toLocalDateTimeValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
