'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockAffiliates } from '@/lib/mockData';
import { useState } from 'react';

export default function AffiliatesPage() {
  const { t } = useLanguage();
  const [showCreate, setShowCreate] = useState(false);

  const totalEarnings = mockAffiliates.reduce((s, a) => s + a.earnings, 0);
  const totalReferrals = mockAffiliates.reduce((s, a) => s + a.referrals, 0);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
            🤝 {t('affiliateProgram')}
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>ניהול שותפים, הפניות ועמלות</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', fontWeight: '700',
        }}>
          ➕ {t('createAffiliate')}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'שותפים פעילים', value: mockAffiliates.filter(a => a.isActive).length, icon: '🤝', color: '#1e3a6e' },
          { label: t('referrals'), value: totalReferrals, icon: '👥', color: '#2451a0' },
          { label: t('earnings'), value: `₪${totalEarnings.toLocaleString()}`, icon: '💰', color: '#c9a227' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px', borderInlineStart: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{s.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a6e' }}>{s.value}</div>
              </div>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Affiliates List */}
      {mockAffiliates.map(affiliate => (
        <div key={affiliate.id} className="card" style={{ padding: '20px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e' }}>{affiliate.name}</h3>
                <span style={{
                  padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                  background: affiliate.isActive ? '#e8f5e9' : '#fce4ec',
                  color: affiliate.isActive ? '#2e7d32' : '#c62828',
                }}>
                  {affiliate.isActive ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>
              <div style={{ color: '#6b7a9a', fontSize: '13px' }}>
                {t('affiliateCode')}: <strong>{affiliate.code}</strong> • נוצר: {affiliate.createdAt}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('commissionRate')}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#c9a227' }}>{affiliate.commissionRate}%</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('referrals')}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a6e' }}>{affiliate.referrals}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{t('earnings')}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a8c5a' }}>₪{affiliate.earnings.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '6px 14px', borderRadius: '8px', border: '1px solid #dae8f8',
              background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}>
              📋 העתק קישור
            </button>
            <button style={{
              padding: '6px 14px', borderRadius: '8px', border: '1px solid #dae8f8',
              background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}>
              📊 צפה בדוח
            </button>
          </div>
        </div>
      ))}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowCreate(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e', marginBottom: '20px' }}>
              ➕ {t('createAffiliate')}
            </h3>
            {['שם שותף', 'קוד שותף', 'שיעור עמלה (%)'].map(label => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{label}</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #dae8f8', background: 'white', color: '#6b7a9a', fontWeight: '600', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={() => { setShowCreate(false); alert('שותף נוצר בהצלחה!'); }} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
