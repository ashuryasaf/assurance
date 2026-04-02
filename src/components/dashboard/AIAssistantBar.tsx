'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { aiResponses } from '@/lib/mockData';
import { useState } from 'react';
import Link from 'next/link';

export default function AIAssistantBar() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const defaults = aiResponses.default;
    setLastResponse(defaults[Math.floor(Math.random() * defaults.length)]);
    setInput('');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
      padding: expanded ? '16px 20px' : '10px 20px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      transition: 'padding 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
            עוזר AI חכם
          </span>
          {!expanded && (
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              • שאל אותי הכל על ביטוח, פנסיה והשקעות
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/dashboard/ai-assistant" style={{
            padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.15)',
            color: 'white', textDecoration: 'none', fontSize: '11px', fontWeight: '600',
          }}>
            פתח צ&apos;אט מלא
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px',
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-fadeIn">
          {lastResponse && (
            <div style={{
              padding: '10px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
              color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginBottom: '8px',
            }}>
              🤖 {lastResponse}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t('typeMessage')}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
                color: 'white', fontSize: '13px', outline: 'none',
              }}
            />
            <button onClick={handleSend} style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              background: '#c9a227', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px',
            }}>
              {t('send')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
