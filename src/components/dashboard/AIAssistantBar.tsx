'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiResponses } from '@/lib/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('פוליס') || lower.includes('ביטוח') || lower.includes('polic') || lower.includes('insurance')) {
    return aiResponses.policies[Math.floor(Math.random() * aiResponses.policies.length)];
  }
  if (lower.includes('תביע') || lower.includes('claim')) {
    return aiResponses.claim[Math.floor(Math.random() * aiResponses.claim.length)];
  }
  if (lower.includes('חיסכון') || lower.includes('לחסוך') || lower.includes('save') || lower.includes('saving')) {
    return aiResponses.savings[Math.floor(Math.random() * aiResponses.savings.length)];
  }
  if (lower.includes('כיסוי') || lower.includes('coverage')) {
    return aiResponses.coverage[Math.floor(Math.random() * aiResponses.coverage.length)];
  }
  return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
}

export function AIAssistantBar() {
  const { t, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '0',
        role: 'assistant',
        text: t('aiWelcome'),
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = [t('aiSuggestion1'), t('aiSuggestion2'), t('aiSuggestion3'), t('aiSuggestion4')];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setIsTyping(false);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: getAIResponse(text),
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  return (
    <>
      {/* Collapsed bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
        borderBottom: '3px solid #c9a227',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#c9a227', fontWeight: '700', fontSize: '13px' }}>{t('aiAssistant')} </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>— {t('aiWelcome').substring(0, 60)}...</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          {isOpen ? '▲ סגור' : '▼ פתח'}
        </div>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div className="animate-fadeIn" style={{
          background: 'white',
          borderBottom: '1px solid #d1dce8',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {/* Messages */}
          <div style={{
            height: '280px',
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#f8faff',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? (isRtl ? 'row' : 'row-reverse') : 'row',
                gap: '8px',
                alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px', height: '28px',
                    background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0,
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '70%',
                  background: msg.role === 'assistant' ? 'white' : 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                  color: msg.role === 'assistant' ? '#1a2744' : 'white',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'assistant'
                    ? (isRtl ? '16px 16px 16px 4px' : '16px 16px 4px 16px')
                    : (isRtl ? '16px 4px 16px 16px' : '4px 16px 16px 16px'),
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  border: msg.role === 'assistant' ? '1px solid #d1dce8' : 'none',
                }}>
                  {msg.text}
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.6,
                    marginTop: '4px',
                    textAlign: isRtl ? 'left' : 'right',
                  }}>{msg.time}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{
                  width: '28px', height: '28px',
                  background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>🤖</div>
                <div style={{
                  background: 'white',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  border: '1px solid #d1dce8',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '7px', height: '7px',
                      borderRadius: '50%',
                      background: '#1e3a6e',
                      animation: `pulse 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div style={{
            padding: '8px 20px',
            borderTop: '1px solid #eef2f8',
            display: 'flex', gap: '8px', flexWrap: 'wrap',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                style={{
                  padding: '5px 12px',
                  background: '#f0f6ff',
                  border: '1px solid #c8dbf0',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#1e3a6e',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '500',
                }}
              >{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #eef2f8',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder={t('aiPlaceholder')}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1.5px solid #d1dce8',
                borderRadius: '24px',
                fontSize: '14px',
                outline: 'none',
                color: '#1a2744',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#3468c4'}
              onBlur={e => e.target.style.borderColor = '#d1dce8'}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: input.trim() ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : '#d1dce8',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                color: 'white',
                fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {isRtl ? '←' : '→'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
