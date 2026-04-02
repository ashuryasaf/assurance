'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, getLanguageName } from '@/lib/translations';

const languages: Language[] = ['he', 'en', 'ru', 'fr', 'ar'];
const flags: Record<Language, string> = { he: '🇮🇱', en: '🇺🇸', ru: '🇷🇺', fr: '🇫🇷', ar: '🇸🇦' };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [personalData, setPersonalData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    idNumber: user?.idNumber || '',
    email: user?.email || '',
    birthDate: '1985-06-15',
    address: 'רחוב הרצל 15',
    city: 'תל אביב',
    country: 'ישראל',
  });

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { key: 'personal', label: t('personalDetails'), icon: '👤' },
    { key: 'security', label: t('securitySettings'), icon: '🔒' },
    { key: 'notifications', label: t('notificationSettings'), icon: '🔔' },
    { key: 'language', label: t('languageSettings'), icon: '🌐' },
  ];

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{t('myProfile')}</h1>
        <p style={{ color: '#6b7a9a', fontSize: '14px', marginTop: '4px' }}>
          עדכן את פרטיך האישיים והגדרות החשבון
        </p>
      </div>

      {/* User card */}
      <div className="card" style={{
        padding: '24px', marginBottom: '24px',
        background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '28px',
            border: '3px solid rgba(255,255,255,0.3)',
          }}>
            {user?.firstName?.[0]}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '20px' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '2px' }}>
              {user?.email}
            </div>
            <div style={{ color: '#c9a227', fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>
              🪪 {user?.idNumber}
            </div>
          </div>
          <div style={{ marginInlineStart: 'auto' }}>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', padding: '4px 14px',
              borderRadius: '20px', fontSize: '13px', fontWeight: '600',
            }}>
              {user?.role === 'agent' ? '👔 סוכן' : '👤 לקוח'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 18px',
              background: activeTab === tab.key ? '#1e3a6e' : 'white',
              color: activeTab === tab.key ? 'white' : '#6b7a9a',
              border: `1.5px solid ${activeTab === tab.key ? '#1e3a6e' : '#d1dce8'}`,
              borderRadius: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {saveSuccess && (
        <div className="animate-fadeIn" style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          color: '#16a34a', padding: '12px 16px',
          borderRadius: '10px', marginBottom: '16px',
          fontWeight: '600', fontSize: '14px',
        }}>
          ✅ {t('profileUpdated')}
        </div>
      )}

      {/* Personal Details */}
      {activeTab === 'personal' && (
        <div className="card animate-fadeIn" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
            {t('personalDetails')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'firstName', label: t('firstName') },
              { key: 'lastName', label: t('lastName') },
              { key: 'email', label: t('email'), type: 'email' },
              { key: 'phone', label: t('phone'), type: 'tel' },
              { key: 'idNumber', label: t('idNumber') },
              { key: 'birthDate', label: t('birthDate'), type: 'date' },
              { key: 'address', label: t('address') },
              { key: 'city', label: t('city') },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '6px', fontSize: '13px' }}>
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={personalData[field.key as keyof typeof personalData]}
                  onChange={e => setPersonalData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-field"
                  style={{ fontSize: '14px' }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '11px 28px',
                background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                color: 'white', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontSize: '15px', fontWeight: '700',
              }}
            >
              💾 {t('updateProfile')}
            </button>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="card animate-fadeIn" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
            {t('securitySettings')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            {[
              { key: 'currentPassword', label: t('currentPassword') },
              { key: 'newPassword', label: t('newPassword') },
              { key: 'confirmPassword', label: t('confirmPassword') },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontWeight: '600', color: '#1a2744', marginBottom: '6px', fontSize: '13px' }}>
                  {f.label}
                </label>
                <input type="password" placeholder="••••••••" className="input-field" style={{ fontSize: '14px' }} />
              </div>
            ))}
            <div style={{
              padding: '14px', background: '#f0f6ff',
              borderRadius: '10px', border: '1px solid #c8dbf0',
              fontSize: '13px', color: '#2451a0',
            }}>
              🔐 אימות דו-שלבי: <strong>פעיל</strong> — קוד נשלח ל-052-XXXXXXX
            </div>
            <button
              onClick={handleSave}
              style={{
                padding: '11px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                color: 'white', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontSize: '15px', fontWeight: '700',
              }}
            >
              🔒 {t('changePassword')}
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card animate-fadeIn" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
            {t('notificationSettings')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'התראות על חידוש פוליסות', icon: '🔄', enabled: true },
              { label: 'מסמכים הדורשים חתימה', icon: '✍️', enabled: true },
              { label: 'עדכוני שוק וביטוח', icon: '📊', enabled: false },
              { label: 'הצעות ומבצעים', icon: '🎁', enabled: false },
              { label: 'עדכוני מצב תביעות', icon: '📋', enabled: true },
            ].map((n, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: '#f8faff',
                borderRadius: '10px', border: '1px solid #d1dce8',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{n.icon}</span>
                  <span style={{ fontWeight: '600', color: '#1a2744', fontSize: '14px' }}>{n.label}</span>
                </div>
                <div style={{
                  width: '44px', height: '24px',
                  background: n.enabled ? '#1e3a6e' : '#d1dce8',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                  <div style={{
                    width: '18px', height: '18px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '3px',
                    [n.enabled ? 'insetInlineEnd' : 'insetInlineStart']: '3px',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language */}
      {activeTab === 'language' && (
        <div className="card animate-fadeIn" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
            {t('languageSettings')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: '16px',
                  background: language === lang ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : 'white',
                  border: `1.5px solid ${language === lang ? '#1e3a6e' : '#d1dce8'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '28px' }}>{flags[lang]}</span>
                <span style={{
                  fontSize: '15px', fontWeight: '700',
                  color: language === lang ? 'white' : '#1a2744',
                }}>
                  {getLanguageName(lang)}
                </span>
                {language === lang && (
                  <span style={{ marginInlineStart: 'auto', color: '#c9a227' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logout button */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={logout}
          style={{
            padding: '11px 24px',
            background: 'white',
            border: '1.5px solid #fca5a5',
            color: '#dc2626',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          🚪 {t('logout')}
        </button>
      </div>
    </div>
  );
}
