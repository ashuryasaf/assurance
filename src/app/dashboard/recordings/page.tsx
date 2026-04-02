'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockRecordings } from '@/lib/mockData';
import { useState, useRef, useEffect } from 'react';

export default function RecordingsPage() {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        🎙️ {t('recordingsTitle')}
      </h1>

      {/* Recording Control */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
          {(['audio', 'video'] as const).map(type => (
            <button key={type} onClick={() => setRecordingType(type)} style={{
              padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: recordingType === type ? '#1e3a6e' : '#f0f6ff',
              color: recordingType === type ? 'white' : '#1e3a6e',
              fontWeight: '600', fontSize: '13px',
            }}>
              {type === 'audio' ? '🎙️ שמע' : '📹 וידאו'}
            </button>
          ))}
        </div>

        {isRecording && (
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#c62828', marginBottom: '16px', fontFamily: 'monospace' }}>
            ● {formatTime(recordingTime)}
          </div>
        )}

        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            width: '80px', height: '80px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isRecording ? '#c62828' : 'linear-gradient(135deg, #1e3a6e, #2451a0)',
            color: 'white', fontSize: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isRecording ? '⏹' : '⏺'}
        </button>
        <div style={{ marginTop: '12px', color: '#6b7a9a', fontSize: '14px' }}>
          {isRecording ? t('stopRecording') : t('startRecording')}
        </div>
      </div>

      {/* Recordings List */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>הקלטות קודמות</h3>
        {mockRecordings.map(rec => (
          <div key={rec.id} style={{
            padding: '16px', borderRadius: '12px', background: '#f8f9fc', marginBottom: '10px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: rec.type === 'audio' ? '#e3f2fd' : '#f3e5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>
                {rec.type === 'audio' ? '🎙️' : '📹'}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1e3a6e', fontSize: '14px' }}>{rec.relatedTo}</div>
                <div style={{ fontSize: '12px', color: '#6b7a9a' }}>
                  {rec.createdAt} • {formatTime(rec.duration)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid #dae8f8',
                background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
                ▶ נגן
              </button>
              <button style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid #dae8f8',
                background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
                📝 {t('transcription')}
              </button>
              <button style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid #dae8f8',
                background: '#f0f6ff', color: '#1e3a6e', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
                ⬇ {t('download')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
