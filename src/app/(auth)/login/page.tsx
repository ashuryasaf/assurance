'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('פרטי כניסה שגויים');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@assurance.co.il', role: 'מנהל על', icon: '🔴' },
    { email: 'agent@assurance.co.il', role: 'סוכן', icon: '🟢' },
    { email: 'demo@assurance.co.il', role: 'לקוח', icon: '⚪' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1e3a6e 50%, #0f2244 100%)',
      padding: '20px',
    }}>
      <div style={{ position: 'absolute', top: '20px', insetInlineEnd: '20px' }}>
        <LanguageSwitcher />
      </div>

      <div style={{
        background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '440px', width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e', marginBottom: '4px' }}>Assurance</h1>
          <p style={{ color: '#6b7a9a', fontSize: '14px' }}>{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div style={{ padding: '10px 16px', borderRadius: '10px', background: '#fce4ec', color: '#c62828', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="service@assurance.co.il"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
            fontWeight: '700', fontSize: '16px', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '⏳ ...' : t('login')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6b7a9a' }}>
          {t('noAccount')}{' '}
          <Link href="/register" style={{ color: '#2451a0', fontWeight: '600', textDecoration: 'none' }}>{t('registerHere')}</Link>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f0f6ff', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a6e', marginBottom: '10px' }}>
            🔑 {t('demoCredentials')} (סיסמה: Demo1234!)
          </div>
          {demoAccounts.map(acc => (
            <div key={acc.email}
              onClick={() => { setEmail(acc.email); setPassword('Demo1234!'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer',
                fontSize: '12px', color: '#6b7a9a',
              }}>
              <span>{acc.icon}</span>
              <span style={{ fontWeight: '600' }}>{acc.email}</span>
              <span>({acc.role})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
