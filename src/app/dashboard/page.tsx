'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockPolicies, mockDocuments, mockActivity } from '@/lib/mockData';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const activePolicies = mockPolicies.filter(p => p.status === 'active');
  const pendingDocs = mockDocuments.filter(d => d.requiresSignature && !d.signed);

  const stats = [
    { icon: '📋', label: t('totalPolicies'), value: mockPolicies.length, color: '#1e3a6e', bg: '#f0f6ff' },
    { icon: '✅', label: t('activePolicies'), value: activePolicies.length, color: '#16a34a', bg: '#f0fdf4' },
    { icon: '📁', label: t('totalDocuments'), value: mockDocuments.length, color: '#d97706', bg: '#fffbeb' },
    { icon: '✍️', label: t('pendingSignatures'), value: pendingDocs.length, color: '#dc2626', bg: '#fef2f2' },
  ];

  const israeliServices = [
    { icon: '🏔️', title: t('harBituach'), desc: t('harBituachDesc'), url: 'https://www.gov.il/he/departments/insurance-supervision', connected: true },
    { icon: '💰', title: t('harHakesef'), desc: t('harHakesefDesc'), url: 'https://www.gov.il/he/departments/insurance-supervision', connected: false },
    { icon: '🏦', title: t('maslakaHapensionit'), desc: t('maslakaDesc'), url: 'https://www.pension.org.il', connected: true },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Welcome header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '4px' }}>
          {t('welcomeBack')}, {user?.firstName} 👋
        </h1>
        <p style={{ color: '#6b7a9a', fontSize: '15px' }}>
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: s.bg,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#6b7a9a', marginTop: '2px' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Quick Actions */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
            ⚡ {t('quickActions')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: '📋', label: t('viewAllPolicies'), href: '/dashboard/policies', color: '#1e3a6e' },
              { icon: '📤', label: t('uploadDocument'), href: '/dashboard/documents', color: '#2451a0' },
              { icon: '🛒', label: t('buyInsurance'), href: '/dashboard/marketplace', color: '#c9a227' },
              { icon: '📊', label: t('getReport'), href: '/dashboard/reports', color: '#16a34a' },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  background: '#f5f7fc',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#f0f6ff';
                  (e.currentTarget as HTMLElement).style.borderColor = '#c8dbf0';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#f5f7fc';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: action.color }}>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
            🔔 {t('recentActivity')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockActivity.slice(0, 4).map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: '#f8faff',
                borderRadius: '8px',
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2744' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7a9a', flexShrink: 0 }}>
                  {new Date(item.date).toLocaleDateString('he-IL')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Policies preview */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e' }}>📋 {t('activePolicies')}</h2>
          <Link href="/dashboard/policies" style={{ color: '#2451a0', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
            {t('viewAllPolicies')} →
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('policyType')}</th>
                <th>{t('insurer')}</th>
                <th>{t('monthlyPremium')}</th>
                <th>{t('renewalDate')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {activePolicies.slice(0, 4).map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600', color: '#1e3a6e' }}>{
                    (() => {
                      const labels: Record<string, string> = {
                        life: t('lifeInsurance'), health: t('healthInsurance'),
                        car: t('carInsurance'), home: t('homeInsurance'),
                        pension: t('pension'), travel: t('travelInsurance'),
                        critical: t('criticalIllness'), business: t('businessInsurance'),
                        investment: t('investments'),
                      };
                      return labels[p.type] || p.type;
                    })()
                  }</td>
                  <td>{p.insurer}</td>
                  <td style={{ fontWeight: '700', color: '#1e3a6e' }}>{p.monthlyPremium.toLocaleString()} ₪</td>
                  <td>{new Date(p.renewalDate).toLocaleDateString('he-IL')}</td>
                  <td><span className="badge-active">{t('active')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Israeli Services */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          🔗 שירותים ממשלתיים
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {israeliServices.map(s => (
            <div key={s.title} style={{
              background: '#f8faff',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #d1dce8',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e3a6e', fontSize: '15px' }}>{s.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{s.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: s.connected ? '#16a34a' : '#d97706',
                  background: s.connected ? '#f0fdf4' : '#fffbeb',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}>
                  {s.connected ? `✅ ${t('connected')}` : `⏳ ${t('connectNow')}`}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '13px',
                    color: '#2451a0',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}
                >
                  {t('learnMore')} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
