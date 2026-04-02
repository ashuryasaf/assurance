'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language, getLanguageName } from '@/lib/translations';
import { useState, useRef, useEffect } from 'react';

const languages: Language[] = ['he', 'en', 'ru', 'fr', 'ar'];

const flags: Record<Language, string> = {
  he: '🇮🇱',
  en: '🇺🇸',
  ru: '🇷🇺',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: variant === 'compact' ? '6px 10px' : '8px 14px',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
      >
        <span>{flags[language]}</span>
        {variant !== 'compact' && <span>{getLanguageName(language)}</span>}
        <span style={{ fontSize: '10px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          insetInlineEnd: 0,
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(10,22,40,0.15)',
          border: '1px solid #d1dce8',
          overflow: 'hidden',
          zIndex: 1000,
          minWidth: '160px',
        }}>
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 16px',
                background: language === lang ? '#f0f6ff' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: language === lang ? '#1e3a6e' : '#4a5568',
                fontWeight: language === lang ? '700' : '400',
                textAlign: 'start',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (language !== lang) (e.target as HTMLElement).style.background = '#f5f7fc'; }}
              onMouseLeave={e => { if (language !== lang) (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              <span>{flags[lang]}</span>
              <span>{getLanguageName(lang)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
