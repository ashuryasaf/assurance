'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockPolicies, mockDocuments, mockActivity, chartData, mockInvestmentPortfolio } from '@/lib/mockData';
import { ROLE_LABELS_HE } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const totalPremium = mockPolicies.reduce((sum, p) => sum + p.premium, 0);

  const statCards = [
    { label: t('totalPolicies'), value: mockPolicies.length.toString(), icon: '📋', color: '#1e3a6e', href: '/dashboard/policies' },
    { label: t('monthlyPremium'), value: `₪${totalPremium.toLocaleString()}`, icon: '💰', color: '#c9a227', href: '/dashboard/policies' },
    { label: t('activeDocuments'), value: mockDocuments.length.toString(), icon: '📁', color: '#2451a0', href: '/dashboard/documents' },
    { label: t('totalInvestments'), value: `₪${mockInvestmentPortfolio.totalValue.toLocaleString()}`, icon: '📈', color: '#1a8c5a', href: '/dashboard/investments' },
  ];

  const quickActions = [
    { label: t('newPolicy'), icon: '📋', href: '/dashboard/policies', color: '#1e3a6e' },
    { label: t('uploadDocument'), icon: '📤', href: '/dashboard/documents', color: '#2451a0' },
    { label: t('generateReport'), icon: '📊', href: '/dashboard/reports', color: '#c9a227' },
    { label: t('contactAgent'), icon: '🤖', href: '/dashboard/ai-assistant', color: '#1a8c5a' },
  ];

  const services = [
    { label: t('harBituach'), icon: '🏔️', status: t('connected'), color: '#22c55e', href: '/dashboard/regulatory' },
    { label: t('maslakaHapensionit'), icon: '🏦', status: t('connected'), color: '#22c55e', href: '/dashboard/regulatory' },
    { label: t('gamalNet'), icon: '💼', status: t('connected'), color: '#22c55e', href: '/dashboard/regulatory' },
    { label: t('harHakesef'), icon: '💰', status: t('connected'), color: '#22c55e', href: '/dashboard/regulatory' },
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '4px' }}>
          {t('welcomeBack')}, {user?.firstName} 👋
        </h1>
        <p style={{ color: '#6b7a9a', fontSize: '15px' }}>
          {t('dashboardSubtitle')} • {user ? ROLE_LABELS_HE[user.role] : ''}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.15s', borderInlineStart: `4px solid ${card.color}` }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#6b7a9a', fontSize: '13px', marginBottom: '6px' }}>{card.label}</div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{card.value}</div>
                </div>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Premium Distribution Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
            {t('portfolioOverview')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chartData.policyDistribution.map(item => {
              const percent = ((item.value / totalPremium) * 100).toFixed(1);
              return (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '80px', fontSize: '13px', color: '#6b7a9a', flexShrink: 0 }}>{item.name}</div>
                  <div style={{ flex: 1, height: '24px', background: '#f0f4f8', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${percent}%`, background: item.color, borderRadius: '12px',
                      display: 'flex', alignItems: 'center', paddingInlineStart: '8px',
                      fontSize: '11px', color: 'white', fontWeight: '600', minWidth: '40px',
                    }}>
                      ₪{item.value}
                    </div>
                  </div>
                  <div style={{ width: '45px', fontSize: '12px', color: '#6b7a9a', textAlign: 'end' }}>{percent}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
            {t('quickActions')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {quickActions.map(action => (
              <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                  background: `${action.color}10`, border: `1px solid ${action.color}30`,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${action.color}20`; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${action.color}10`; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{action.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: action.color }}>{action.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Israeli Services */}
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', margin: '24px 0 12px' }}>
            {t('israeliServices')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {services.map(s => (
              <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f0f6ff', border: '1px solid #dae8f8', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e3a6e' }}>{s.label}</div>
                    <div style={{ fontSize: '10px', color: s.color, fontWeight: '600' }}>● {s.status}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e' }}>{t('recentActivity')}</h3>
          <Link href="/dashboard/reports" style={{ color: '#2451a0', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
            {t('viewAll')} →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mockActivity.map(act => (
            <div key={act.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '10px', background: '#f8f9fc',
            }}>
              <span style={{ fontSize: '22px' }}>{act.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e3a6e' }}>{act.message}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7a9a', flexShrink: 0 }}>{act.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
