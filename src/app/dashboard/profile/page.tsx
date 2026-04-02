'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROLE_LABELS_HE } from '@/lib/types';
import { useState } from 'react';
import type { Language } from '@/lib/translations';
import { getLanguageName } from '@/lib/translations';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('personal');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

      {/* User Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '800', fontSize: '28px',
        }}>
          {user?.firstName[0]}
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

      {/* Tabs */}
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

      {/* Personal Info */}
      {activeTab === 'personal' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: t('firstName'), value: user?.firstName },
              { label: t('lastName'), value: user?.lastName },
              { label: t('email'), value: user?.email },
              { label: t('phone'), value: user?.phone },
              { label: t('idNumber'), value: user?.idNumber },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{field.label}</label>
                <input defaultValue={field.value || ''} style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                  fontSize: '14px', outline: 'none',
                }} />
              </div>
            ))}
          </div>
          <button onClick={handleSave} style={{
            marginTop: '20px', padding: '12px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
            fontWeight: '700', cursor: 'pointer',
          }}>
            {t('saveChanges')}
          </button>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>{t('changePassword')}</h3>
          {['סיסמה נוכחית', 'סיסמה חדשה', 'אימות סיסמה'].map(label => (
            <div key={label} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{label}</label>
              <input type="password" style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                fontSize: '14px', outline: 'none',
              }} />
            </div>
          ))}
          <button onClick={handleSave} style={{
            marginTop: '8px', padding: '12px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', cursor: 'pointer',
          }}>
            {t('saveChanges')}
          </button>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f0f6ff', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#1e3a6e', marginBottom: '4px' }}>🔐 {t('twoFactorAuth')}</div>
                <div style={{ fontSize: '13px', color: '#6b7a9a' }}>הגן על החשבון שלך עם שכבת אבטחה נוספת</div>
              </div>
              <button style={{
                padding: '8px 18px', borderRadius: '8px', border: 'none',
                background: '#c9a227', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px',
              }}>
                הפעל
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: '24px' }}>
          {[
            { label: 'התראות דוא"ל', desc: 'קבל עדכונים על פוליסות ומסמכים', enabled: true },
            { label: 'התראות SMS', desc: 'קבל הודעות SMS על אירועים חשובים', enabled: false },
            { label: 'תובנות AI', desc: 'קבל המלצות חיסכון מ-AI', enabled: true },
            { label: 'עדכוני רגולציה', desc: 'קבל עדכונים ממסלקה, הר הביטוח וגמל נט', enabled: true },
            { label: 'דוחות חודשיים', desc: 'קבל סיכום חודשי של התיק', enabled: true },
          ].map(notif => (
            <div key={notif.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: '1px solid #f0f4f8',
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1e3a6e', fontSize: '14px' }}>{notif.label}</div>
                <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{notif.desc}</div>
              </div>
              <div style={{
                width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                background: notif.enabled ? '#22c55e' : '#dae8f8',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '2px',
                  insetInlineStart: notif.enabled ? '22px' : '2px',
                  transition: 'inset-inline-start 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Language */}
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
