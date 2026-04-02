'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePage() {
  const { loginWithInvite } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    setIsLoading(true);
    try {
      const success = await loginWithInvite(token, formData);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('קישור ההזמנה אינו תקין. אנא פנה לסוכן הביטוח שלך.');
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
      <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>אשורי</div>
            <div style={{ color: '#c9a227', fontSize: '11px' }}>סוכנות לביטוח</div>
          </div>
        </Link>
        <LanguageSwitcher />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}>
          {/* Invitation badge */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f6ff, #dae8f8)',
            border: '1px solid #c8dbf0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '28px' }}>🎉</span>
            <div>
              <div style={{ fontWeight: '700', color: '#1e3a6e', fontSize: '15px' }}>{t('inviteTitle')}</div>
              <div style={{ color: '#6b7a9a', fontSize: '13px', marginTop: '2px' }}>{t('inviteSubtitle')}</div>
            </div>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
            {t('loginWithInvite')}
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              {[
                { key: 'firstName', label: t('firstName'), placeholder: 'ישראל', type: 'text' },
                { key: 'lastName', label: t('lastName'), placeholder: 'ישראלי', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '5px', fontSize: '13px' }}>{f.label}</label>
                  <input type={f.type} value={formData[f.key as keyof typeof formData]} onChange={handleChange(f.key)} required placeholder={f.placeholder} className="input-field" style={{ fontSize: '14px' }} />
                </div>
              ))}
            </div>

            {[
              { key: 'email', label: t('email'), placeholder: 'email@example.com', type: 'email' },
              { key: 'phone', label: t('phone'), placeholder: '050-1234567', type: 'tel' },
              { key: 'idNumber', label: t('idNumber'), placeholder: '123456789', type: 'text' },
              { key: 'password', label: t('password'), placeholder: '••••••••', type: 'password' },
              { key: 'confirmPassword', label: t('confirmPassword'), placeholder: '••••••••', type: 'password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '5px', fontSize: '13px' }}>{f.label}</label>
                <input type={f.type} value={formData[f.key as keyof typeof formData]} onChange={handleChange(f.key)} required placeholder={f.placeholder} className="input-field" style={{ fontSize: '14px' }} />
              </div>
            ))}

            {error && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: isLoading ? '#93b8ea' : 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: '700', cursor: isLoading ? 'default' : 'pointer',
              }}
            >
              {isLoading ? t('loading') : `✅ ${t('register')}`}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7a9a', fontSize: '14px' }}>
            {t('hasAccount')}{' '}
            <Link href="/login" style={{ color: '#1e3a6e', fontWeight: '700', textDecoration: 'none' }}>
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
