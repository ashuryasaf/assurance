'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { apiFetch, useApi } from '@/lib/client-api';
import { ROLE_LABELS_HE, type UserRole } from '@/lib/types';
import { useState } from 'react';

type ApiAgent = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  licenseNumber?: string;
  isActive: boolean;
  crmCustomerTypes: Array<'general' | 'real_estate'>;
};

type ApiSubAgency = {
  id: string;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
};

type ApiAgency = {
  id: string;
  name: string;
  licenseNumber: string;
  ownerId: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  regulatoryStatus: string;
  parentAgencyId?: string;
  subAgencies: ApiSubAgency[];
  agents: ApiAgent[];
};

export default function AgencyPage() {
  const { t } = useLanguage();
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'agent' | 'sub_agent'>('agent');
  const [crmAccessMode, setCrmAccessMode] = useState<'all' | 'real_estate' | 'general'>('all');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const { data, loading, error, refresh } = useApi<{ agencies: ApiAgency[] }>('/api/agencies');

  const top = (data?.agencies ?? []).find(a => !a.parentAgencyId) ?? data?.agencies?.[0];

  if (loading) return <div style={{ padding: '20px', color: '#6b7a9a' }}>טוען נתוני סוכנות...</div>;
  if (error || !top) {
    return (
      <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
          🏢 {t('agencyManagement')}
        </h1>
        <div className="card" style={{ padding: '24px', color: '#6b7a9a' }}>
          {error ? `⚠️ ${error}` : 'לא משויך לסוכנות.'}
        </div>
      </div>
    );
  }

  const agency = top;
  const agents = (data?.agencies ?? []).flatMap(a => a.agents).filter(u => u.role === 'agent' || u.role === 'sub_agent');

  const createAgentInvite = async () => {
    setInviteBusy(true);
    setInviteError(null);
    setInviteUrl(null);
    try {
      const crmCustomerTypes = crmAccessMode === 'all'
        ? ['general', 'real_estate']
        : [crmAccessMode];
      const response = await apiFetch<{ token: string }>('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail || undefined,
          role: inviteRole,
          agencyId: agency.id,
          crmCustomerTypes,
        }),
      });
      setInviteUrl(window.location.origin + '/invite/' + response.token);
      await refresh();
    } catch (err) {
      setInviteError((err as Error).message);
    } finally {
      setInviteBusy(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
            🏢 {t('agencyManagement')}
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>ניהול סוכנות, סוכנויות משנה וסוכנים</p>
        </div>
        <button onClick={() => setShowAddAgent(true)} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', fontWeight: '700', fontSize: '14px',
        }}>
          ➕ {t('addAgent')}
        </button>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px', borderInlineStart: '4px solid #c9a227' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e', marginBottom: '8px' }}>{agency.name}</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#6b7a9a', fontSize: '13px' }}>
              <span>📋 {t('licenseNumber')}: {agency.licenseNumber}</span>
              <span>📧 {agency.email}</span>
              <span>📞 {agency.phone}</span>
              <span>📍 {agency.address}</span>
            </div>
          </div>
          <div style={{
            padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '13px',
            background: '#e8f5e9', color: '#2e7d32',
          }}>
            ● {t('regulatoryStatus')}: {agency.regulatoryStatus}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: t('subAgencies'), value: agency.subAgencies.length, icon: '🏢', color: '#1e3a6e' },
          { label: t('agents'), value: agents.length, icon: '👥', color: '#2451a0' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px', borderInlineStart: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{s.label}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e' }}>{s.value}</div>
              </div>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          🏢 {t('subAgencies')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {agency.subAgencies.map(sub => (
            <div key={sub.id} style={{
              padding: '16px', borderRadius: '12px', background: '#f0f6ff',
              border: '1px solid #dae8f8',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ fontWeight: '700', color: '#1e3a6e' }}>{sub.name}</h4>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '8px', background: sub.isActive ? '#e8f5e9' : '#fce4ec', color: sub.isActive ? '#2e7d32' : '#c62828', fontWeight: '700' }}>
                  {sub.isActive ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#6b7a9a' }}>
                <span>📋 {sub.licenseNumber}</span>
                <span>📧 {sub.email}</span>
                <span>📞 {sub.phone}</span>
                <span>📍 {sub.address}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          👥 {t('agents')}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {['שם', 'דוא"ל', 'טלפון', 'תפקיד', 'גישה ל-CRM', t('licenseNumber'), t('status')].map(h => (
                  <th key={h} style={{ padding: '12px 14px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: '700', fontSize: '13px', textAlign: 'start' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '12px',
                      }}>
                        {agent.firstName[0]}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{agent.firstName} {agent.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{agent.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{agent.phone}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: agent.role === 'agent' ? '#e3f2fd' : '#f3e5f5',
                      color: agent.role === 'agent' ? '#1565c0' : '#7b1fa2',
                    }}>
                      {ROLE_LABELS_HE[agent.role]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#52668c' }}>{formatCrmAccess(agent.crmCustomerTypes)}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px' }}>{agent.licenseNumber || '-'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: agent.isActive ? '#e8f5e9' : '#fce4ec',
                      color: agent.isActive ? '#2e7d32' : '#c62828',
                    }}>
                      {agent.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddAgent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAddAgent(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '540px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e', marginBottom: '12px' }}>
              ➕ {t('addAgent')}
            </h3>
            <p style={{ color: '#6b7a9a', fontSize: '14px', marginBottom: '18px' }}>
              צור קישור הזמנה לסוכן והגדר מראש לאיזה בסיס נתוני CRM תהיה לו גישה. ההגבלה נשמרת בהרשאות המשתמש ונאכפת גם בשרת.
            </p>
            {inviteError && <div style={{ color: '#c62828', marginBottom: '10px' }}>⚠️ {inviteError}</div>}
            <InviteField label="אימייל הסוכן">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="agent@example.com" style={inviteInputStyle} />
            </InviteField>
            <InviteField label="תפקיד">
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'agent' | 'sub_agent')} style={inviteInputStyle}>
                <option value="agent">סוכן</option>
                <option value="sub_agent">סוכן משנה</option>
              </select>
            </InviteField>
            <InviteField label="הגבלת גישה לנתוני CRM">
              <select value={crmAccessMode} onChange={e => setCrmAccessMode(e.target.value as 'all' | 'real_estate' | 'general')} style={inviteInputStyle}>
                <option value="all">כל הלקוחות</option>
                <option value="real_estate">נדל&quot;ן בלבד</option>
                <option value="general">כל השאר בלבד</option>
              </select>
            </InviteField>
            {inviteUrl && (
              <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '10px', fontSize: '13px', marginTop: '10px', wordBreak: 'break-all' }}>
                ✅ קישור הזמנה: <a href={inviteUrl} target="_blank" rel="noopener noreferrer">{inviteUrl}</a>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowAddAgent(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #dae8f8', background: 'white', color: '#6b7a9a', fontWeight: '700', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={() => void createAgentInvite()} disabled={inviteBusy || !inviteEmail} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', cursor: inviteBusy || !inviteEmail ? 'wait' : 'pointer', opacity: inviteBusy || !inviteEmail ? 0.6 : 1 }}>{inviteBusy ? 'יוצר...' : 'צור הזמנה'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const inviteInputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
  fontSize: '14px', outline: 'none',
};

function InviteField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e3a6e', marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  );
}

function formatCrmAccess(types: Array<'general' | 'real_estate'>): string {
  const unique = Array.from(new Set(types));
  if (unique.length === 0 || unique.length > 1) return 'כל הלקוחות';
  return unique[0] === 'real_estate' ? 'נדל"ן בלבד' : 'כל השאר בלבד';
}
