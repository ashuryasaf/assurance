'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { apiFetch, useApi } from '@/lib/client-api';
import type { BankConnection } from '@/lib/types';
import { useState } from 'react';

export default function BankingPage() {
  const { t } = useLanguage();
  const { data, refresh, error, loading } = useApi<{ banks: BankConnection[] }>('/api/banking');
  const banks = data?.banks ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ bankName: '', accountType: '', balance: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const totalBalance = banks.reduce((s, b) => s + (b.balance || 0), 0);

  const handleSync = async (id: string) => {
    setBusyId(id);
    try {
      await apiFetch(`/api/banking/${id}/sync`, { method: 'POST' });
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async () => {
    setFormError(null);
    if (!form.bankName || !form.accountType) {
      setFormError('נא למלא שם בנק וסוג חשבון');
      return;
    }
    try {
      await apiFetch('/api/banking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: form.bankName,
          accountType: form.accountType,
          balance: form.balance ? Number(form.balance) : undefined,
        }),
      });
      setShowAdd(false);
      setForm({ bankName: '', accountType: '', balance: '' });
      await refresh();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
            🏦 {t('bankConnections')}
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>חיבור וסנכרון חשבונות בנק</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white', fontWeight: '700',
        }}>
          ➕ {t('connectBank')}
        </button>
      </div>

      {error && <div style={{ color: '#c62828', marginBottom: '16px' }}>⚠️ {error}</div>}

      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>יתרה כוללת</div>
            <div style={{ fontSize: '36px', fontWeight: '800' }}>₪{totalBalance.toLocaleString()}</div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>{banks.filter(b => b.status === 'connected').length} חשבונות מחוברים</div>
          </div>
          <span style={{ fontSize: '56px' }}>🏦</span>
        </div>
      </div>

      {loading && <div style={{ color: '#6b7a9a' }}>טוען חשבונות...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {banks.map(bank => (
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
              <button onClick={() => handleSync(bank.id)} disabled={busyId === bank.id} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #dae8f8',
                background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                opacity: busyId === bank.id ? 0.6 : 1,
              }}>
                {busyId === bank.id ? '⏳ מסנכרן' : '🔄 סנכרון'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAdd(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e', marginBottom: '20px' }}>🏦 {t('connectBank')}</h3>
            {formError && <div style={{ color: '#c62828', marginBottom: '12px' }}>⚠️ {formError}</div>}
            {[
              { key: 'bankName' as const, label: 'שם הבנק' },
              { key: 'accountType' as const, label: 'סוג חשבון' },
              { key: 'balance' as const, label: 'יתרה התחלתית (₪)', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} type={f.type ?? 'text'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #dae8f8', background: 'white', color: '#6b7a9a', fontWeight: '600', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={handleAdd} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
