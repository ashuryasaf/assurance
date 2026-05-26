'use client';

import { apiFetch, useApi } from '@/lib/client-api';
import { useState } from 'react';

type CampaignType = 'real-estate' | 'insurance' | 'investments' | 'kadima-real-estate';

type LandingLead = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredTime: 'morning' | 'noon' | 'evening';
  notes?: string;
  campaignType: CampaignType;
  source?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'qualified' | 'converted' | 'lost';
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  referrer?: string;
  assignedAgentId?: string;
  convertedLeadId?: string;
  createdAt: string;
  updatedAt: string;
};

const TIME_LABELS: Record<LandingLead['preferredTime'], string> = {
  morning: 'בוקר 09:00 – 12:00',
  noon: 'צהריים 12:00 – 17:00',
  evening: 'ערב 17:00 – 20:00',
};

const CAMPAIGN_TYPE_OPTIONS: { key: CampaignType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'הכל', icon: '📋' },
  { key: 'real-estate', label: 'נדל"ן', icon: '🏘️' },
  { key: 'insurance', label: 'ביטוח', icon: '🛡️' },
  { key: 'investments', label: 'השקעות', icon: '📈' },
  { key: 'kadima-real-estate', label: 'קדימה נדל"ן', icon: '🏗️' },
];

const CAMPAIGN_LABELS: Record<CampaignType, { label: string; icon: string; color: string }> = {
  'real-estate': { label: 'נדל"ן', icon: '🏘️', color: '#1e3a6e' },
  insurance: { label: 'ביטוח', icon: '🛡️', color: '#2e7d32' },
  investments: { label: 'השקעות', icon: '📈', color: '#c9a227' },
  'kadima-real-estate': { label: 'קדימה נדל"ן', icon: '🏗️', color: '#6d4c41' },
};

const LANDING_URLS: Record<CampaignType, string> = {
  'real-estate': '/landing/real-estate',
  insurance: '/landing/insurance',
  investments: '/landing/investments',
  'kadima-real-estate': '/landing/kadima-real-estate',
};

const STATUS_OPTIONS: { key: LandingLead['status']; label: string; color: string }[] = [
  { key: 'new', label: 'חדש', color: '#1e3a6e' },
  { key: 'contacted', label: 'נוצר קשר', color: '#c9a227' },
  { key: 'scheduled', label: 'נקבע מועד', color: '#3468c4' },
  { key: 'qualified', label: 'מוכשר', color: '#1a8c5a' },
  { key: 'converted', label: 'הומר ל-CRM', color: '#0f2244' },
  { key: 'lost', label: 'נסגר ללא עסקה', color: '#c62828' },
];

export default function LandingLeadsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | LandingLead['status']>('all');
  const [campaignFilter, setCampaignFilter] = useState<'all' | CampaignType>('all');
  const [selected, setSelected] = useState<LandingLead | null>(null);
  const [convertId, setConvertId] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryParams = new URLSearchParams();
  if (statusFilter !== 'all') queryParams.set('status', statusFilter);
  if (campaignFilter !== 'all') queryParams.set('campaignType', campaignFilter);
  const qs = queryParams.toString();

  const { data, refresh, loading, error } = useApi<{ leads: LandingLead[] }>(
    `/api/landing/real-estate${qs ? `?${qs}` : ''}`,
  );
  const leads = data?.leads ?? [];

  const updateStatus = async (lead: LandingLead, status: LandingLead['status']) => {
    setActionError(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/landing/real-estate/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await refresh();
      const updated = (res as { lead?: { status: string } })?.lead;
      if (selected && selected.id === lead.id) {
        setSelected({ ...selected, status: (updated?.status ?? status) as LandingLead['status'] });
      }
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const convertToCrm = async (lead: LandingLead) => {
    setActionError(null);
    if (!convertId.trim()) {
      setActionError('נא להזין תעודת זהות');
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/api/landing/real-estate/${lead.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNumber: convertId }),
      });
      setConvertId('');
      setSelected(null);
      await refresh();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a6e', marginBottom: '6px' }}>
            📋 פניות מדפי הנחיתה
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>
            פניות שהגיעו דרך עמודי הנחיתה החיצוניים. ניתן לסנן לפי סוג קמפיין ולהמיר ל־CRM לאחר קבלת ת.ז.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          {Object.entries(LANDING_URLS).map(([key, url]) => {
            const info = CAMPAIGN_LABELS[key as CampaignType];
            return (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={{
                padding: '8px 14px', borderRadius: '10px',
                background: `${info.color}15`, border: `1.5px solid ${info.color}30`,
                color: info.color, fontWeight: 600, textDecoration: 'none', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {info.icon} {info.label} ↗
              </a>
            );
          })}
        </div>
      </div>

      {error && <div style={{ color: '#c62828', marginBottom: '12px' }}>⚠️ {error}</div>}

      {/* Campaign type filter */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7a9a', marginBottom: '6px' }}>סוג קמפיין:</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CAMPAIGN_TYPE_OPTIONS.map(ct => (
            <button key={ct.key} onClick={() => setCampaignFilter(ct.key as 'all' | CampaignType)} style={{
              ...filterBtn(campaignFilter === ct.key, ct.key === 'all' ? '#1e3a6e' : CAMPAIGN_LABELS[ct.key as CampaignType]?.color ?? '#1e3a6e'),
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span>{ct.icon}</span> {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setStatusFilter('all')} style={filterBtn(statusFilter === 'all')}>הכל ({leads.length})</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)} style={filterBtn(statusFilter === s.key, s.color)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', color: '#6b7a9a' }}>טוען...</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '24px', color: '#6b7a9a' }}>אין פניות התואמות לסינון.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr>
                  {['שם מלא', 'טלפון', 'אימייל', 'קמפיין', 'שעה מועדפת', 'סטטוס', 'מקור', 'התקבל'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: 700, fontSize: '13px', textAlign: 'start' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                    <tr key={lead.id} onClick={() => setSelected(lead)}
                      style={{ borderBottom: '1px solid #f0f4f8', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{lead.fullName}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a', fontFamily: 'monospace' }}>{lead.phone}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{lead.email ?? '-'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <CampaignBadge type={lead.campaignType} />
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>{TIME_LABELS[lead.preferredTime]}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <StatusBadge status={lead.status} />
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7a9a' }}>
                        {lead.utm.source ? `${lead.utm.source}/${lead.utm.medium ?? '—'}` : (lead.source ?? '—')}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7a9a' }}>
                        {new Date(lead.createdAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '640px', width: '94%', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a6e' }}>{selected.fullName}</h2>
                <div style={{ fontSize: '13px', color: '#6b7a9a', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <CampaignBadge type={selected.campaignType} />
                  <span>התקבל: {new Date(selected.createdAt).toLocaleString('he-IL')}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <Field label="טלפון" value={selected.phone} mono />
              <Field label="אימייל" value={selected.email} />
              <Field label="שעה מועדפת" value={TIME_LABELS[selected.preferredTime]} />
              <Field label="מקור" value={selected.utm.source || selected.source} />
              {selected.utm.campaign && <Field label="קמפיין" value={selected.utm.campaign} />}
              {selected.utm.medium && <Field label="ערוץ" value={selected.utm.medium} />}
            </div>

            {selected.notes && (
              <div style={{ padding: '12px 16px', background: '#fdf6e3', borderRadius: '10px', marginBottom: '14px', fontSize: '14px', color: '#856404' }}>
                {selected.notes}
              </div>
            )}

            {selected.referrer && (
              <div style={{ fontSize: '12px', color: '#6b7a9a', marginBottom: '14px', direction: 'ltr', textAlign: 'start' }}>
                referrer: {selected.referrer}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a6e', marginBottom: '6px' }}>סטטוס:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {STATUS_OPTIONS.filter(s => s.key !== 'converted').map(s => (
                  <button
                    key={s.key}
                    disabled={busy || s.key === selected.status}
                    onClick={() => updateStatus(selected, s.key)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
                      cursor: s.key === selected.status ? 'default' : 'pointer',
                      background: s.key === selected.status ? s.color : 'white',
                      borderColor: s.color,
                      color: s.key === selected.status ? 'white' : s.color,
                      fontSize: '12px', fontWeight: 700,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {actionError && (
              <div style={{ color: '#c62828', marginBottom: '12px' }}>⚠️ {actionError}</div>
            )}

            {selected.status !== 'converted' && !selected.convertedLeadId ? (
              <div style={{ padding: '16px', background: '#f0f6ff', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a6e', marginBottom: '6px' }}>
                  הוסף ת.ז להמרה ל־CRM
                </div>
                <div style={{ fontSize: '12px', color: '#52668c', marginBottom: '8px' }}>
                  לאחר השיחה הראשונית, הזן את תעודת הזהות של הלקוח כדי ליצור רשומה ב־CRM שכל הנתונים יצטברו אליה.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={convertId}
                    onChange={e => setConvertId(e.target.value)}
                    placeholder="תעודת זהות (9 ספרות)"
                    inputMode="numeric"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: '10px',
                      border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => convertToCrm(selected)}
                    disabled={busy || !convertId}
                    style={{
                      padding: '10px 20px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
                      fontWeight: 700, cursor: busy || !convertId ? 'wait' : 'pointer',
                      opacity: busy || !convertId ? 0.6 : 1,
                    }}
                  >
                    המר ל־CRM
                  </button>
                </div>
              </div>
            ) : (
              selected.convertedLeadId && (
                <div style={{ padding: '12px 16px', background: '#e8f5e9', borderRadius: '10px', color: '#2e7d32', fontWeight: 600, fontSize: '13px' }}>
                  ✅ הומר ל־CRM (לקוח <code>{selected.convertedLeadId}</code>)
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignBadge({ type }: { type: CampaignType }) {
  const info = CAMPAIGN_LABELS[type] ?? CAMPAIGN_LABELS['real-estate'];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
      background: `${info.color}12`, color: info.color, border: `1px solid ${info.color}30`,
      display: 'inline-flex', alignItems: 'center', gap: '3px',
    }}>
      {info.icon} {info.label}
    </span>
  );
}

function StatusBadge({ status }: { status: LandingLead['status'] }) {
  const opt = STATUS_OPTIONS.find(o => o.key === status) ?? STATUS_OPTIONS[0];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
      background: `${opt.color}15`, color: opt.color, border: `1px solid ${opt.color}30`,
    }}>
      {opt.label}
    </span>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '8px' }}>
      <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a6e', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value || '—'}
      </div>
    </div>
  );
}

const filterBtn = (active: boolean, color = '#1e3a6e'): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: '20px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  background: active ? color : '#f0f6ff',
  color: active ? 'white' : '#1e3a6e',
});
