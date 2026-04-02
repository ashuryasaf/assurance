'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
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
    if (formData.password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return;
    }
    setIsLoading(true);
    try {
      const success = await register(formData);
      if (success) router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    [
      { key: 'firstName', type: 'text', label: t('firstName'), placeholder: 'ישראל' },
      { key: 'lastName', type: 'text', label: t('lastName'), placeholder: 'ישראלי' },
    ],
    [
      { key: 'email', type: 'email', label: t('email'), placeholder: 'email@example.com' },
      { key: 'phone', type: 'tel', label: t('phone'), placeholder: '050-1234567' },
    ],
    [
      { key: 'idNumber', type: 'text', label: t('idNumber'), placeholder: '123456789' },
    ],
    [
      { key: 'password', type: 'password', label: t('password'), placeholder: '••••••••' },
      { key: 'confirmPassword', type: 'password', label: t('confirmPassword'), placeholder: '••••••••' },
    ],
  ];

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
          maxWidth: '540px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
              {t('registerTitle')}
            </h1>
            <p style={{ color: '#6b7a9a', fontSize: '15px' }}>{t('registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {fields.map((row, ri) => (
              <div key={ri} style={{
                display: 'grid',
                gridTemplateColumns: row.length > 1 ? '1fr 1fr' : '1fr',
                gap: '12px',
                marginBottom: '16px',
              }}>
                {row.map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '6px', fontSize: '13px' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={handleChange(field.key)}
                      required
                      placeholder={field.placeholder}
                      className="input-field"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                ))}
              </div>
            ))}

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

            <div style={{
              fontSize: '12px',
              color: '#6b7a9a',
              marginBottom: '16px',
              textAlign: 'center',
              lineHeight: '1.6',
            }}>
              בהרשמה אתה מסכים ל
              <a href="#" style={{ color: '#1e3a6e', fontWeight: '600' }}>{t('termsOfService')}</a>
              {' '}ול
              <a href="#" style={{ color: '#1e3a6e', fontWeight: '600' }}>{t('privacyPolicy')}</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px',
                background: isLoading ? '#93b8ea' : 'linear-gradient(135deg, #c9a227, #a87c1a)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? `${t('loading')}...` : `🚀 ${t('register')}`}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#6b7a9a', fontSize: '14px' }}>
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
