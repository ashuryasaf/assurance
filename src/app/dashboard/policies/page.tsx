'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockPolicies, Policy } from '@/lib/mockData';

const typeColors: Record<string, { bg: string; color: string; icon: string }> = {
  life: { bg: '#f0f6ff', color: '#1e3a6e', icon: '💙' },
  health: { bg: '#f0fdf4', color: '#16a34a', icon: '💚' },
  car: { bg: '#fff7ed', color: '#d97706', icon: '🚗' },
  home: { bg: '#fdf4ff', color: '#9333ea', icon: '🏠' },
  pension: { bg: '#fffbeb', color: '#a16207', icon: '🏦' },
  investment: { bg: '#f0fdf4', color: '#059669', icon: '📈' },
  travel: { bg: '#fff0f0', color: '#dc2626', icon: '✈️' },
  business: { bg: '#f5f0ff', color: '#7c3aed', icon: '💼' },
  critical: { bg: '#fff5f5', color: '#dc2626', icon: '❤️' },
};

function PolicyCard({ policy, t, typeLabel }: { policy: Policy; t: (k: string) => string; typeLabel: string }) {
  const meta = typeColors[policy.type] || { bg: '#f5f7fc', color: '#1e3a6e', icon: '📋' };
  const totalMonthly = mockPolicies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.monthlyPremium, 0);

  return (
    <div className="card" style={{ padding: '20px', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(30,58,110,0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(10,22,40,0.06)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px', height: '42px',
            background: meta.bg,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>
            {meta.icon}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#1a2744', fontSize: '15px' }}>{typeLabel}</div>
            <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{policy.insurer}</div>
          </div>
        </div>
        <span className={`badge-${policy.status}`}>{t(policy.status)}</span>
      </div>

      <div style={{ fontSize: '12px', color: '#6b7a9a', marginBottom: '6px' }}>{t('policyNumber')}: <strong style={{ color: '#1a2744' }}>{policy.policyNumber}</strong></div>
      <div style={{ fontSize: '12px', color: '#6b7a9a', marginBottom: '14px' }}>{t('coverage')}: <strong style={{ color: '#1a2744' }}>{policy.coverage}</strong></div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#f8faff', borderRadius: '8px', padding: '10px 14px',
        marginBottom: '14px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('monthlyPremium')}</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e' }}>{policy.monthlyPremium.toLocaleString()} ₪</div>
        </div>
        <div style={{ textAlign: 'end' }}>
          <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('renewalDate')}</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a2744' }}>
            {new Date(policy.renewalDate).toLocaleDateString('he-IL')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={{
          flex: 1, padding: '8px', background: '#f0f6ff', border: '1px solid #c8dbf0',
          borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#1e3a6e', fontWeight: '600',
        }}>
          👁️ {t('viewPolicy')}
        </button>
        <button style={{
          flex: 1, padding: '8px', background: '#1e3a6e', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'white', fontWeight: '600',
        }}>
          📋 {t('claimPolicy')}
        </button>
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const types = ['all', 'life', 'health', 'car', 'home', 'pension', 'travel'];
  const typeLabels: Record<string, string> = {
    all: t('all'),
    life: t('lifeInsurance'),
    health: t('healthInsurance'),
    car: t('carInsurance'),
    home: t('homeInsurance'),
    pension: t('pension'),
    travel: t('travelInsurance'),
    critical: t('criticalIllness'),
    business: t('businessInsurance'),
    investment: t('investments'),
  };

  const getPolicyTypeLabel = (type: string) => {
    return typeLabels[type] || type;
  };

  const filtered = mockPolicies.filter(p => {
    const matchType = activeFilter === 'all' || p.type === activeFilter;
    const matchSearch = !searchTerm || p.policyNumber.includes(searchTerm) || p.insurer.includes(searchTerm);
    return matchType && matchSearch;
  });

  const totalMonthly = mockPolicies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.monthlyPremium, 0);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{t('myPolicies')}</h1>
          <p style={{ color: '#6b7a9a', fontSize: '14px', marginTop: '4px' }}>
            {t('totalPolicies')}: {mockPolicies.length} | {t('monthlyPremium')}: {totalMonthly.toLocaleString()} ₪
          </p>
        </div>
        <a
          href="https://www.gov.il/he/departments/insurance-supervision"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
            color: 'white', borderRadius: '10px', textDecoration: 'none',
            fontSize: '14px', fontWeight: '600',
          }}
        >
          🏔️ {t('connectHarBituach')}
        </a>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`🔍 ${t('search')}...`}
            className="input-field"
            style={{ fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: '1.5px solid',
                borderColor: activeFilter === type ? '#1e3a6e' : '#d1dce8',
                background: activeFilter === type ? '#1e3a6e' : 'white',
                color: activeFilter === type ? 'white' : '#6b7a9a',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Policies grid */}
      {filtered.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(p => <PolicyCard key={p.id} policy={p} t={t} typeLabel={getPolicyTypeLabel(p.type)} />)}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#6b7a9a' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{t('noPolicies')}</div>
        </div>
      )}
    </div>
  );
}
