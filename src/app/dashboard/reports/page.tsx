'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockReports, chartData } from '@/lib/mockData';
import { useState } from 'react';

export default function ReportsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'reports' | 'bi'>('reports');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  const reportTypeLabels: Record<string, string> = {
    client_summary: t('clientSummary'),
    commission: t('commission'),
    regulatory: t('regulatoryReports'),
    bi_analytics: t('biAnalytics'),
    agent_performance: t('agentPerformance'),
    portfolio: t('portfolioReport'),
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
            📊 {t('advancedReports')}
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>דוחות מתקדמים, BI וניתוח ביצועים</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', fontWeight: '700',
          opacity: generating ? 0.7 : 1,
        }}>
          {generating ? '⏳ מפיק...' : `📊 ${t('generateNew')}`}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'reports' as const, label: 'דוחות', icon: '📋' },
          { key: 'bi' as const, label: t('biAnalytics'), icon: '📊' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? '#1e3a6e' : 'white', color: activeTab === tab.key ? 'white' : '#1e3a6e',
            fontWeight: '700', fontSize: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && (
        <div>
          {/* Reports List */}
          {mockReports.map(report => (
            <div key={report.id} className="card" style={{ padding: '18px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e', marginBottom: '4px' }}>{report.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7a9a' }}>
                    <span>{reportTypeLabels[report.type] || report.type}</span>
                    <span>•</span>
                    <span>{report.generatedAt}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'uppercase' }}>{report.format}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                    background: report.status === 'ready' ? '#e8f5e9' : '#fff3cd',
                    color: report.status === 'ready' ? '#2e7d32' : '#856404',
                  }}>
                    {report.status === 'ready' ? '✅ מוכן' : '⏳ בהפקה'}
                  </span>
                  <button style={{
                    padding: '6px 16px', borderRadius: '8px', border: '1px solid #dae8f8',
                    background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}>
                    ⬇ {t('download')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bi' && (
        <div>
          {/* Monthly Premiums Chart */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
              💰 מגמת פרמיות חודשיות
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
              {chartData.monthlyPremiums.map((d, i) => {
                const min = 4000; const max = 4600;
                const height = ((d.value - min) / (max - min)) * 180;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '10px', color: '#6b7a9a', fontWeight: '600' }}>₪{d.value}</div>
                    <div style={{
                      width: '100%', height: `${height}px`, borderRadius: '6px 6px 0 0',
                      background: 'linear-gradient(to top, #c9a227, #d4b44a)',
                    }} />
                    <div style={{ fontSize: '10px', color: '#6b7a9a' }}>{d.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
              👥 {t('agentPerformance')}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {['סוכן', 'פוליסות', 'הכנסות', 'לקוחות', 'ביצועים'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: '700', fontSize: '13px', textAlign: 'start' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.agentPerformance.map((agent, i) => {
                    const maxPolicies = Math.max(...chartData.agentPerformance.map(a => a.policies));
                    const perf = (agent.policies / maxPolicies) * 100;
                    return (
                      <tr key={i}>
                        <td style={{ padding: '12px 14px', fontWeight: '600' }}>{agent.name}</td>
                        <td style={{ padding: '12px 14px' }}>{agent.policies}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1a8c5a' }}>₪{agent.revenue.toLocaleString()}</td>
                        <td style={{ padding: '12px 14px' }}>{agent.clients}</td>
                        <td style={{ padding: '12px 14px', width: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '8px', background: '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${perf}%`, height: '100%', background: 'linear-gradient(90deg, #1e3a6e, #3468c4)', borderRadius: '4px' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#6b7a9a', fontWeight: '600' }}>{perf.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Policy Distribution */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
              📋 התפלגות פוליסות לפי סוג
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chartData.policyDistribution.map(item => {
                const total = chartData.policyDistribution.reduce((s, i) => s + i.value, 0);
                const pct = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '90px', fontSize: '13px', color: '#6b7a9a', fontWeight: '500' }}>{item.name}</div>
                    <div style={{ flex: 1, height: '28px', background: '#f0f4f8', borderRadius: '14px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, background: item.color, borderRadius: '14px',
                        display: 'flex', alignItems: 'center', paddingInlineStart: '10px',
                        fontSize: '11px', color: 'white', fontWeight: '700', minWidth: '50px',
                      }}>
                        ₪{item.value}
                      </div>
                    </div>
                    <div style={{ width: '50px', fontSize: '12px', color: '#6b7a9a', fontWeight: '600', textAlign: 'end' }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
