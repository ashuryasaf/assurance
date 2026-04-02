'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockInvestmentPortfolio, chartData } from '@/lib/mockData';

export default function InvestmentsPage() {
  const { t } = useLanguage();
  const portfolio = mockInvestmentPortfolio;

  const typeLabels: Record<string, string> = {
    stocks: 'מניות', bonds: 'אג"ח', mutual_funds: 'קרנות נאמנות',
    etf: 'תעודות סל', real_estate: 'נדל"ן', crypto: 'קריפטו',
  };

  const typeColors: Record<string, string> = {
    stocks: '#1e3a6e', bonds: '#2451a0', mutual_funds: '#3468c4',
    etf: '#c9a227', real_estate: '#1a8c5a', crypto: '#8b5cf6',
  };

  const totalReturns = portfolio.investments.reduce((s, i) => s + i.returns, 0);
  const totalReturnsPct = ((totalReturns / (portfolio.totalValue - totalReturns)) * 100).toFixed(1);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        📈 {t('investmentPortfolio')}
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>{t('totalValue')}</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>₪{portfolio.totalValue.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #1a8c5a, #22c55e)', color: 'white', borderRadius: '14px' }}>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>{t('totalReturns')}</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>+₪{totalReturns.toLocaleString()}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>+{totalReturnsPct}%</div>
        </div>
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', borderRadius: '14px' }}>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>מס׳ השקעות</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{portfolio.investments.length}</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>ביצועי תיק - 12 חודשים אחרונים</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
          {chartData.investmentPerformance.map((d, i) => {
            const min = 400000; const max = 500000;
            const height = ((d.value - min) / (max - min)) * 180;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '10px', color: '#6b7a9a', fontWeight: '600' }}>₪{(d.value / 1000).toFixed(0)}K</div>
                <div style={{
                  width: '100%', height: `${height}px`, borderRadius: '6px 6px 0 0',
                  background: `linear-gradient(to top, #1e3a6e, #3468c4)`,
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: '10px', color: '#6b7a9a' }}>{d.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Allocation */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>{t('allocation')}</h3>
        <div style={{ display: 'flex', height: '32px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          {portfolio.investments.map(inv => {
            const pct = (inv.value / portfolio.totalValue) * 100;
            return (
              <div key={inv.id} style={{ width: `${pct}%`, background: typeColors[inv.type] || '#1e3a6e', position: 'relative' }}
                title={`${typeLabels[inv.type]} - ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {portfolio.investments.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: typeColors[inv.type] || '#1e3a6e' }} />
              <span style={{ color: '#6b7a9a' }}>{typeLabels[inv.type]} ({((inv.value / portfolio.totalValue) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Investments Table */}
      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>פירוט השקעות</h3>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {[t('investmentName'), 'סוג', t('currentValue'), 'מחיר קנייה', 'מחיר נוכחי', t('returns')].map(h => (
                <th key={h} style={{ padding: '12px 14px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: '700', fontSize: '13px', textAlign: 'start' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {portfolio.investments.map(inv => (
              <tr key={inv.id}>
                <td style={{ padding: '12px 14px', fontWeight: '600', fontSize: '14px' }}>{inv.name}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', background: `${typeColors[inv.type]}15`, color: typeColors[inv.type] }}>
                    {typeLabels[inv.type]}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1e3a6e' }}>₪{inv.value.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: '#6b7a9a' }}>₪{inv.purchasePrice.toLocaleString()}</td>
                <td style={{ padding: '12px 14px', color: '#6b7a9a' }}>₪{inv.currentPrice.toLocaleString()}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontWeight: '700', color: inv.returnsPercentage >= 0 ? '#2e7d32' : '#c62828',
                  }}>
                    {inv.returnsPercentage > 0 ? '+' : ''}{inv.returnsPercentage}% (₪{inv.returns.toLocaleString()})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
