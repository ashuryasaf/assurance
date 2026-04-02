'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function InvitePage() {
  const { loginWithInvite } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', idNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await loginWithInvite(token, form);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('טוקן הזמנה לא תקין');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1e3a6e 50%, #0f2244 100%)', padding: '20px',
    }}>
      <div style={{ position: 'absolute', top: '20px', insetInlineEnd: '20px' }}><LanguageSwitcher /></div>
      <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a6e', marginBottom: '4px' }}>{t('inviteTitle')}</h1>
          <p style={{ color: '#6b7a9a', fontSize: '14px' }}>{t('inviteSubtitle')}</p>
        </div>
        {error && (
          <div style={{ padding: '10px 16px', borderRadius: '10px', background: '#fce4ec', color: '#c62828', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>⚠️ {error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { name: 'firstName', label: t('firstName'), type: 'text', full: false },
              { name: 'lastName', label: t('lastName'), type: 'text', full: false },
              { name: 'email', label: t('email'), type: 'email', full: true },
              { name: 'phone', label: t('phone'), type: 'tel', full: false },
              { name: 'idNumber', label: t('idNumber'), type: 'text', full: false },
              { name: 'password', label: t('password'), type: 'password', full: true },
            ].map(field => (
              <div key={field.name} style={{ gridColumn: field.full ? '1 / -1' : undefined }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{field.label}</label>
                <input type={field.type} value={form[field.name as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [field.name]: e.target.value }))} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', marginTop: '20px', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', fontSize: '16px', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '⏳ ...' : t('register')}
          </button>
        </form>
      </div>
    </div>
  );
}
