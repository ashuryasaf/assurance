'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { aiResponses } from '@/lib/mockData';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1', role: 'assistant', timestamp: new Date(),
      content: `שלום ${user?.firstName || ''}! 👋 אני העוזר החכם של Assurance. אני יכול לעזור לך עם:\n\n• 📋 ניתוח פוליסות וחיסכון\n• 🏛️ נתונים מהמסלקה, הר הביטוח וגמל נט\n• 📈 ניתוח תיק השקעות\n• 📁 ניתוח מסמכים שהועלו\n• 🤝 ניהול שותפים ועמלות\n\nמה תרצה לדעת?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestedQuestions = [
    { label: 'סקירת פוליסות', query: 'ספר לי על הפוליסות שלי', category: 'policies' },
    { label: 'נתוני מסלקה', query: 'מה המצב בפנסיה שלי?', category: 'regulatory' },
    { label: 'ניתוח השקעות', query: 'איך התיק השקעות שלי?', category: 'investments' },
    { label: 'ניתוח מסמכים', query: 'נתח את המסמכים שלי', category: 'documents' },
    { label: 'המלצות חיסכון', query: 'איפה אני יכול לחסוך?', category: 'policies' },
    { label: 'דוח שותפים', query: 'מה מצב השותפים שלי?', category: 'affiliate' },
  ];

  const getResponse = (query: string): string => {
    const lower = query.toLowerCase();
    const categories = Object.keys(aiResponses);
    for (const cat of categories) {
      if (lower.includes(cat) || (cat === 'policies' && (lower.includes('פוליס') || lower.includes('ביטוח') || lower.includes('חיסכון')))
        || (cat === 'regulatory' && (lower.includes('מסלקה') || lower.includes('פנסיה') || lower.includes('הר') || lower.includes('גמל')))
        || (cat === 'investments' && (lower.includes('השקע') || lower.includes('תיק') || lower.includes('תשואה')))
        || (cat === 'documents' && (lower.includes('מסמך') || lower.includes('נתח') || lower.includes('קובץ')))
        || (cat === 'affiliate' && (lower.includes('שותף') || lower.includes('עמלה') || lower.includes('הפניה')))) {
        const responses = aiResponses[cat];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    const defaults = aiResponses.default;
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user', content: msg.trim(), timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(msg);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '4px' }}>
          🤖 {t('aiAssistantTitle')}
        </h1>
        <p style={{ color: '#6b7a9a', fontSize: '15px' }}>{t('aiAssistantSubtitle')}</p>
      </div>

      {/* Suggested Questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {suggestedQuestions.map(q => (
          <button key={q.label} onClick={() => handleSend(q.query)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #dae8f8',
            background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dae8f8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0f6ff'; }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px', borderRadius: '14px',
        background: 'white', border: '1px solid #dae8f8',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px',
          }}>
            <div style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: '14px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : '#f0f6ff',
              color: msg.role === 'user' ? 'white' : '#1e3a6e',
              fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
            }}>
              {msg.role === 'assistant' && <span style={{ fontWeight: '700', marginInlineEnd: '4px' }}>🤖</span>}
              {msg.content}
              <div style={{
                fontSize: '10px', marginTop: '6px',
                color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : '#6b7a9a',
                textAlign: 'end',
              }}>
                {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', gap: '4px', padding: '12px 16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#6b7a9a',
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('typeMessage')}
          style={{
            flex: 1, padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #dae8f8',
            fontSize: '15px', outline: 'none', background: 'white',
          }}
        />
        <button onClick={() => handleSend()} disabled={!input.trim()} style={{
          padding: '14px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
          background: input.trim() ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : '#dae8f8',
          color: 'white', fontWeight: '700', fontSize: '15px',
        }}>
          {t('send')} ➤
        </button>
      </div>
    </div>
  );
}
