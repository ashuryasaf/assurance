'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockPolicies } from '@/lib/mockData';
import { useState } from 'react';

export default function PoliciesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const typeLabels: Record<string, string> = {
    life: 'חיים', health: 'בריאות', car: 'רכב', home: 'דירה',
    pension: 'פנסיה', travel: 'נסיעות', business: 'עסק',
    investment: 'השקעות', gemel: 'גמל', kranot: 'קרנות',
  };

  const typeIcons: Record<string, string> = {
    life: '❤️', health: '🏥', car: '🚗', home: '🏠',
    pension: '🏦', travel: '✈️', business: '🏢',
    investment: '📈', gemel: '💼', kranot: '📊',
  };

  const typeColors: Record<string, string> = {
    life: '#e91e63', health: '#4caf50', car: '#2196f3', home: '#ff9800',
    pension: '#9c27b0', travel: '#00bcd4', business: '#795548',
    investment: '#607d8b', gemel: '#ff5722', kranot: '#3f51b5',
  };

  const filtered = mockPolicies.filter(p => {
    const matchSearch = !search || p.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.provider.includes(search) || typeLabels[p.type]?.includes(search);
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPremium = filtered.reduce((s, p) => s + p.premium, 0);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        📋 {t('policyManagement')}
      </h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{t('totalPolicies')}</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{mockPolicies.length}</div>
        </div>
        <div className="card" style={{ padding: '18px', background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', borderRadius: '14px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{t('monthlyPremium')}</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>₪{totalPremium.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '18px', background: 'linear-gradient(135deg, #1a8c5a, #22c55e)', color: 'white', borderRadius: '14px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{t('activePolicies')}</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{mockPolicies.filter(p => p.status === 'active').length}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          style={{ flex: 1, minWidth: '200px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setTypeFilter('all')} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            background: typeFilter === 'all' ? '#1e3a6e' : '#f0f6ff', color: typeFilter === 'all' ? 'white' : '#1e3a6e',
          }}>הכל</button>
          {Object.entries(typeLabels).map(([key, label]) => (
            <button key={key} onClick={() => setTypeFilter(key)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              background: typeFilter === key ? typeColors[key] : '#f0f6ff', color: typeFilter === key ? 'white' : '#1e3a6e',
            }}>{typeIcons[key]} {label}</button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {filtered.map(policy => (
          <div key={policy.id} className="card" style={{ padding: '18px', cursor: 'pointer', transition: 'transform 0.15s' }}
            onClick={() => setSelectedPolicy(selectedPolicy === policy.id ? null : policy.id)}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${typeColors[policy.type]}15`, color: typeColors[policy.type],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                  {typeIcons[policy.type]}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e3a6e' }}>{typeLabels[policy.type]}</div>
                  <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{policy.provider} • {policy.policyNumber}</div>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
                background: policy.status === 'active' ? '#e8f5e9' : '#fce4ec',
                color: policy.status === 'active' ? '#2e7d32' : '#c62828',
              }}>
                {policy.status === 'active' ? t('active') : t('expired')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('premium')}</div>
                <div style={{ fontWeight: '700', color: '#1e3a6e' }}>₪{policy.premium}/חודש</div>
              </div>
              <div style={{ textAlign: 'end' }}>
                <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('coverage')}</div>
                <div style={{ fontWeight: '700', color: '#1e3a6e' }}>₪{policy.coverageAmount.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7a9a' }}>
              {policy.startDate} → {policy.endDate}
            </div>

            {selectedPolicy === policy.id && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f0f6ff', borderRadius: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '8px' }}>פרטים נוספים:</div>
                {Object.entries(policy.details).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                    <span style={{ color: '#6b7a9a' }}>{key}</span>
                    <span style={{ fontWeight: '600', color: '#1e3a6e' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
