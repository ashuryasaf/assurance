'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockBankConnections } from '@/lib/mockData';

export default function BankingPage() {
  const { t } = useLanguage();

  const totalBalance = mockBankConnections.reduce((s, b) => s + (b.balance || 0), 0);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
            🏦 {t('bankConnections')}
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>חיבור וסנכרון חשבונות בנק</p>
        </div>
        <button style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', fontWeight: '700',
        }}>
          ➕ {t('connectBank')}
        </button>
      </div>

      {/* Total Balance */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>יתרה כוללת</div>
            <div style={{ fontSize: '36px', fontWeight: '800' }}>₪{totalBalance.toLocaleString()}</div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>{mockBankConnections.filter(b => b.status === 'connected').length} חשבונות מחוברים</div>
          </div>
          <span style={{ fontSize: '56px' }}>🏦</span>
        </div>
      </div>

      {/* Bank Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {mockBankConnections.map(bank => (
          <div key={bank.id} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  🏛️
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e' }}>{bank.bankName}</h3>
                  <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{bank.accountType}</div>
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                background: bank.status === 'connected' ? '#e8f5e9' : '#fce4ec',
                color: bank.status === 'connected' ? '#2e7d32' : '#c62828',
              }}>
                ● {bank.status === 'connected' ? t('connected') : t('disconnected')}
              </span>
            </div>
            {bank.balance !== undefined && (
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '8px' }}>
                ₪{bank.balance.toLocaleString()}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#6b7a9a' }}>
              {t('lastSync')}: {bank.lastSync}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #dae8f8',
                background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
                🔄 סנכרון
              </button>
              <button style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #dae8f8',
                background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
                📊 פירוט
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
