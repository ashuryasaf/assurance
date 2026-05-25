'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROLE_LABELS_HE } from '@/lib/types';
import { apiFetch } from '@/lib/client-api';
import { useState } from 'react';
import type { Language } from '@/lib/translations';
import { getLanguageName } from '@/lib/translations';

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('personal');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive editable form state from the loaded user. We re-initialise whenever
  // the user identity changes, following the React "calculate state during
  // render" pattern (avoids useEffect+setState that strict React forbids).
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    idNumber: user?.idNumber ?? '',
  });
  const [syncedUserId, setSyncedUserId] = useState<string | null>(user?.id ?? null);
  if (user && syncedUserId !== user.id) {
    setSyncedUserId(user.id);
    setProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      idNumber: user.idNumber,
    });
  }

  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const handleProfileSave = async () => {
    setError(null);
    try {
      await apiFetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      await refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handlePasswordSave = async () => {
    setError(null);
    if (pwForm.newPassword.length < 8) {
      setError('סיסמה חדשה חייבת להכיל לפחות 8 תווים');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('אימות הסיסמה אינו תואם');
      return;
    }
    try {
      await apiFetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const languages: Language[] = ['he', 'en', 'ru', 'fr', 'ar'];
  const flags: Record<Language, string> = { he: '🇮🇱', en: '🇬🇧', ru: '🇷🇺', fr: '🇫🇷', ar: '🇸🇦' };

  const tabs = [
    { key: 'personal', label: t('personalInfo'), icon: '👤' },
    { key: 'security', label: t('security'), icon: '🔐' },
    { key: 'notifications', label: t('notifications'), icon: '🔔' },
    { key: 'language', label: t('language'), icon: '🌐' },
  ];

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        👤 {t('profile')}
      </h1>

      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '800', fontSize: '28px',
        }}>
          {user?.firstName[0] ?? '?'}
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ color: '#6b7a9a', fontSize: '14px', marginBottom: '4px' }}>{user?.email}</div>
          <span style={{
            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
            background: '#e3f2fd', color: '#1565c0',
          }}>
            {user ? ROLE_LABELS_HE[user.role] : ''}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? '#1e3a6e' : 'white',
            color: activeTab === tab.key ? 'white' : '#1e3a6e',
            fontWeight: '700', fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {saved && (
        <div style={{ padding: '12px 20px', borderRadius: '10px', background: '#d4edda', color: '#155724', fontWeight: '700', marginBottom: '16px' }}>
          ✅ {t('saved')}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 20px', borderRadius: '10px', background: '#fce4ec', color: '#c62828', fontWeight: '700', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: t('firstName'), key: 'firstName' as const },
              { label: t('lastName'), key: 'lastName' as const },
              { label: t('email'), key: 'email' as const, value: user?.email, readOnly: true },
              { label: t('phone'), key: 'phone' as const },
              { label: t('idNumber'), key: 'idNumber' as const },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{field.label}</label>
                <input
                  value={field.readOnly ? field.value ?? '' : (profile[field.key as keyof typeof profile] ?? '')}
                  onChange={e => !field.readOnly && setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                  readOnly={field.readOnly}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                    fontSize: '14px', outline: 'none',
                    background: field.readOnly ? '#f0f4f8' : 'white',
                  }} />
              </div>
            ))}
          </div>
          <button onClick={handleProfileSave} style={{
            marginTop: '20px', padding: '12px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
            fontWeight: '700', cursor: 'pointer',
          }}>
            {t('saveChanges')}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>{t('changePassword')}</h3>
          {[
            { label: 'סיסמה נוכחית', key: 'currentPassword' as const },
            { label: 'סיסמה חדשה', key: 'newPassword' as const },
            { label: 'אימות סיסמה', key: 'confirmPassword' as const },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                  fontSize: '14px', outline: 'none',
                }} />
            </div>
          ))}
          <button onClick={handlePasswordSave} style={{
            marginTop: '8px', padding: '12px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', cursor: 'pointer',
          }}>
            {t('saveChanges')}
          </button>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f0f6ff', borderRadius: '12px' }}>
            <div style={{ fontWeight: '700', color: '#1e3a6e', marginBottom: '4px' }}>🔐 {t('twoFactorAuth')}</div>
            <div style={{ fontSize: '13px', color: '#6b7a9a' }}>אימות דו-שלבי יושק בעדכון הבא של המערכת.</div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: '24px' }}>
          <p style={{ color: '#6b7a9a', fontSize: '14px' }}>
            הגדרות התראות יישמרו בחשבון שלך בעדכון הקרוב. בינתיים, ההתראות שולחות באמצעות ערוצי ברירת המחדל של המערכת.
          </p>
        </div>
      )}

      {activeTab === 'language' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>🌐 {t('language')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {languages.map(lang => (
              <div key={lang} onClick={() => setLanguage(lang)} style={{
                padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                border: language === lang ? '2px solid #1e3a6e' : '2px solid #dae8f8',
                background: language === lang ? '#f0f6ff' : 'white',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{flags[lang]}</div>
                <div style={{ fontWeight: '700', color: '#1e3a6e' }}>{getLanguageName(lang)}</div>
                {language === lang && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>
                    ✅ נבחר
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
