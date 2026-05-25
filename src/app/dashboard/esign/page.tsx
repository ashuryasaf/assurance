'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { apiFetch, useApi } from '@/lib/client-api';
import type { Document } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';

export default function ESignPage() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data, refresh } = useApi<{ documents: Document[] }>('/api/documents');
  const docs = data?.documents ?? [];

  const unsignedDocs = docs.filter(d => d.status !== 'signed');
  const signedDocsList = docs.filter(d => d.status === 'signed');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3a6e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSig(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const submitSignature = async () => {
    if (!selectedDocId || !hasSig) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const signatureImage = canvas.toDataURL('image/png');
      await apiFetch(`/api/documents/${selectedDocId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureImage }),
      });
      setSelectedDocId('');
      clearCanvas();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await refresh();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        ✍️ {t('digitalSignature')}
      </h1>

      {showSuccess && (
        <div style={{
          padding: '16px 24px', borderRadius: '12px', background: '#d4edda', color: '#155724',
          marginBottom: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ✅ {t('signedSuccessfully')}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 20px', borderRadius: '10px', background: '#fce4ec', color: '#c62828', marginBottom: '16px', fontWeight: '600' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
              {t('signDocument')}
            </h3>

            <select
              value={selectedDocId}
              onChange={e => setSelectedDocId(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                fontSize: '14px', marginBottom: '16px', background: 'white', outline: 'none',
              }}
            >
              <option value="">בחר מסמך לחתימה...</option>
              {unsignedDocs.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>

            <div style={{
              border: '2px solid #dae8f8', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px',
              background: 'white',
            }}>
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '200px', cursor: 'crosshair', touchAction: 'none' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={clearCanvas} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                background: 'white', color: '#6b7a9a', fontWeight: '600', cursor: 'pointer',
              }}>
                🗑️ {t('clearSignature')}
              </button>
              <button onClick={submitSignature} disabled={!selectedDocId || !hasSig || submitting} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                background: (selectedDocId && hasSig && !submitting) ? 'linear-gradient(135deg, #1e3a6e, #2451a0)' : '#dae8f8',
                color: 'white', fontWeight: '700', cursor: (selectedDocId && hasSig && !submitting) ? 'pointer' : 'not-allowed',
              }}>
                {submitting ? '⏳ שולח...' : `✅ ${t('submitSignature')}`}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
              {t('pendingSignatures')}
            </h3>
            {unsignedDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6b7a9a' }}>
                ✅ כל המסמכים חתומים!
              </div>
            ) : (
              unsignedDocs.map(doc => (
                <div key={doc.id} style={{
                  padding: '12px', borderRadius: '10px', background: '#fff3cd', marginBottom: '8px',
                  display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                }} onClick={() => setSelectedDocId(doc.id)}>
                  <span>⏳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#856404' }}>{doc.name}</div>
                    <div style={{ fontSize: '11px', color: '#856404' }}>{doc.uploadDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
              ✅ מסמכים חתומים
            </h3>
            {signedDocsList.length === 0 && (
              <div style={{ color: '#6b7a9a', fontSize: '14px' }}>אין מסמכים חתומים עדיין.</div>
            )}
            {signedDocsList.map(doc => (
              <div key={doc.id} style={{
                padding: '12px', borderRadius: '10px', background: '#d4edda', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#155724' }}>{doc.name}</div>
                  <div style={{ fontSize: '11px', color: '#155724' }}>
                    {doc.signatureData?.signedAt
                      ? new Date(doc.signatureData.signedAt).toLocaleDateString('he-IL')
                      : doc.uploadDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
