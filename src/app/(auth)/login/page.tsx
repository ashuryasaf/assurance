'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('פרטי הכניסה שגויים. נסה: demo@ashuri.co.il / Demo1234!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1e3a6e 50%, #1a3060 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>אשורי</div>
            <div style={{ color: '#c9a227', fontSize: '11px' }}>סוכנות לביטוח</div>
          </div>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
              {t('loginTitle')}
            </h1>
            <p style={{ color: '#6b7a9a', fontSize: '15px' }}>{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '6px', fontSize: '14px' }}>
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="demo@ashuri.co.il"
                className="input-field"
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '6px', fontSize: '14px' }}>
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <a href="#" style={{ color: '#2451a0', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
                {t('forgotPassword')}
              </a>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px',
                background: isLoading ? '#93b8ea' : 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'default' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  {t('loading')}
                </>
              ) : (
                <>🔑 {t('login')}</>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f0f6ff',
            borderRadius: '8px',
            border: '1px solid #c8dbf0',
            fontSize: '12px',
            color: '#2451a0',
            textAlign: 'center',
          }}>
            <strong>כניסת דמו:</strong> demo@ashuri.co.il / Demo1234!
          </div>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#6b7a9a',
            fontSize: '14px',
          }}>
            {t('noAccount')}{' '}
            <Link href="/register" style={{ color: '#1e3a6e', fontWeight: '700', textDecoration: 'none' }}>
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
