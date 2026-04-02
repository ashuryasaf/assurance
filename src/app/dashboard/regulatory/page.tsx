'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockRegulatoryReports, mockMaslakaData, mockHarBituachData, mockGamalNetData } from '@/lib/mockData';
import { useState } from 'react';

type TabType = 'maslaka' | 'har_bituach' | 'gamal_net';

export default function RegulatoryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('maslaka');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: 'maslaka' as TabType, label: t('maslakaTitle'), icon: '🏦', desc: t('maslakaDesc') },
    { key: 'har_bituach' as TabType, label: t('harBituach'), icon: '🏔️', desc: t('harBituachDesc') },
    { key: 'gamal_net' as TabType, label: t('gamalNet'), icon: '💼', desc: t('gamalNetDesc') },
  ];

  const handleFetch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const report = mockRegulatoryReports.find(r => r.type === activeTab);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
          🏛️ {t('regulatoryReports')}
        </h1>
        <p style={{ color: '#6b7a9a', fontSize: '15px' }}>{t('regulatorySubtitle')}</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '16px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : 'white',
              color: activeTab === tab.key ? 'white' : '#1e3a6e',
              boxShadow: activeTab === tab.key ? '0 4px 16px rgba(30,58,110,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>{tab.icon}</span>
              <span style={{ fontWeight: '700', fontSize: '16px' }}>{tab.label}</span>
            </div>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Fetch Button */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={handleFetch}
          disabled={loading}
          style={{
            padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white',
            fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {loading ? '⏳' : '🔄'} {loading ? t('analyzing') : t('fetchData')}
        </button>
        {report?.fetchedAt && (
          <span style={{ color: '#6b7a9a', fontSize: '13px' }}>
            {t('lastUpdate')}: {report.fetchedAt}
          </span>
        )}
      </div>

      {/* Content based on tab */}
      {activeTab === 'maslaka' && (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('totalSavings')}</div>
                <div style={{ fontSize: '32px', fontWeight: '800' }}>₪{mockMaslakaData.totalSavings.toLocaleString()}</div>
              </div>
              <span style={{ fontSize: '48px' }}>🏦</span>
            </div>
          </div>

          {mockMaslakaData.pensionFunds.map((fund, i) => (
            <div key={i} className="card" style={{ padding: '20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e' }}>{fund.fundName}</h3>
                  <div style={{ color: '#6b7a9a', fontSize: '13px' }}>{fund.provider} • {fund.accountNumber}</div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e' }}>₪{fund.balance.toLocaleString()}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('monthlyContribution')}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e' }}>₪{fund.monthlyContribution.toLocaleString()}</div>
                </div>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>הפקדת מעסיק</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e' }}>₪{fund.employerContribution.toLocaleString()}</div>
                </div>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('managementFee')}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e' }}>{fund.managementFee}%</div>
                </div>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('investmentTrack')}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a6e' }}>{fund.investmentTrack}</div>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7a9a', marginBottom: '6px' }}>תשואות:</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {fund.returns.map(r => (
                    <div key={r.year} style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                      background: r.percentage >= 0 ? '#e8f5e9' : '#fce4ec',
                      color: r.percentage >= 0 ? '#2e7d32' : '#c62828',
                      fontWeight: '600',
                    }}>
                      {r.year}: {r.percentage > 0 ? '+' : ''}{r.percentage}%
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'har_bituach' && (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('totalPremiumLabel')}</div>
                <div style={{ fontSize: '32px', fontWeight: '800' }}>₪{mockHarBituachData.totalPremium.toLocaleString()}/חודש</div>
              </div>
              <span style={{ fontSize: '48px' }}>🏔️</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {[t('policyNumber'), 'חברה', 'סוג', t('status'), t('premium'), t('startDate'), t('endDate'), 'פרטי כיסוי'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: '700', fontSize: '13px', textAlign: 'start', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockHarBituachData.policies.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600' }}>{p.policyNumber}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.company}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.type}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: '#e8f5e9', color: '#2e7d32' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600' }}>₪{p.premium}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.startDate}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{p.endDate}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7a9a' }}>{p.coverageDetails}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gamal_net' && (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('totalBalance')}</div>
                <div style={{ fontSize: '32px', fontWeight: '800' }}>₪{mockGamalNetData.totalBalance.toLocaleString()}</div>
              </div>
              <span style={{ fontSize: '48px' }}>💼</span>
            </div>
          </div>

          {mockGamalNetData.accounts.map((acc, i) => (
            <div key={i} className="card" style={{ padding: '20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e' }}>{acc.accountName}</h3>
                  <div style={{ color: '#6b7a9a', fontSize: '13px' }}>{acc.provider}</div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e' }}>₪{acc.balance.toLocaleString()}</div>
                  <span style={{
                    fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '8px',
                    background: acc.returns >= 0 ? '#e8f5e9' : '#fce4ec',
                    color: acc.returns >= 0 ? '#2e7d32' : '#c62828',
                  }}>
                    {acc.returns > 0 ? '+' : ''}{acc.returns}%
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>הפקדה חודשית</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e' }}>₪{acc.deposits}</div>
                </div>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('managementFee')}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e' }}>{acc.managementFee}%</div>
                </div>
                <div style={{ padding: '10px', background: '#f0f6ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>סוג</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a6e' }}>
                    {acc.type === 'hishtalmut' ? 'קרן השתלמות' : acc.type === 'gemel' ? 'קופת גמל' : 'קרנות'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      {report?.aiInsights && (
        <div className="card" style={{ padding: '20px', marginTop: '20px', borderInlineStart: '4px solid #c9a227' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 {t('aiInsights')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.aiInsights.map((insight, i) => (
              <div key={i} style={{
                padding: '12px 16px', background: '#fdf6e3', borderRadius: '10px',
                fontSize: '14px', color: '#1e3a6e', display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span style={{ color: '#c9a227', fontWeight: '800' }}>💡</span>
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
