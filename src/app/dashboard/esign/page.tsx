'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockDocuments, Document } from '@/lib/mockData';

export default function ESignPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pendingDocs = documents.filter(d => d.requiresSignature && !d.signed);
  const signedDocs = documents.filter(d => d.signed);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a6e';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [selectedDoc]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submitSignature = async () => {
    if (!selectedDoc || !hasSignature) return;
    setIsSigning(true);
    await new Promise(r => setTimeout(r, 1500));
    setDocuments(prev => prev.map(d =>
      d.id === selectedDoc.id
        ? { ...d, signed: true, signedDate: new Date().toISOString().split('T')[0] }
        : d
    ));
    setSignSuccess(true);
    setSelectedDoc(null);
    setHasSignature(false);
    setIsSigning(false);
    setTimeout(() => setSignSuccess(false), 4000);
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{t('digitalSignature')}</h1>
        <p style={{ color: '#6b7a9a', fontSize: '14px', marginTop: '4px' }}>
          חתמו על מסמכים בצורה מאובטחת ומשפטית תקפה
        </p>
      </div>

      {signSuccess && (
        <div className="animate-fadeIn" style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          color: '#16a34a', padding: '14px 18px', borderRadius: '10px',
          marginBottom: '20px', fontWeight: '600', fontSize: '15px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          ✅ {t('documentSigned')}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>✍️</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626' }}>{pendingDocs.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7a9a' }}>{t('pendingDocuments')}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>✅</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a' }}>{signedDocs.length}</div>
              <div style={{ fontSize: '13px', color: '#6b7a9a' }}>{t('signedDocuments')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Signing modal */}
      {selectedDoc && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div className="animate-fadeIn" style={{
            background: 'white', borderRadius: '20px',
            padding: '32px', width: '100%', maxWidth: '560px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: '800', color: '#1e3a6e', fontSize: '20px' }}>{t('signDocument')}</h2>
              <button
                onClick={() => { setSelectedDoc(null); clearSignature(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7a9a' }}
              >×</button>
            </div>

            <div style={{
              background: '#f8faff', borderRadius: '10px', padding: '14px',
              marginBottom: '20px', border: '1px solid #d1dce8',
            }}>
              <div style={{ fontSize: '13px', color: '#6b7a9a', marginBottom: '4px' }}>{t('documentToSign')}:</div>
              <div style={{ fontWeight: '700', color: '#1a2744' }}>📄 {selectedDoc.name}</div>
            </div>

            <div style={{ marginBottom: '8px', fontWeight: '600', color: '#1a2744', fontSize: '14px' }}>
              {t('signHere')}:
            </div>
            <div style={{
              border: '2px dashed #c8dbf0', borderRadius: '10px',
              overflow: 'hidden', marginBottom: '16px',
              background: '#fafcff', cursor: 'crosshair',
            }}>
              <canvas
                ref={canvasRef}
                width={496}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ display: 'block', width: '100%', touchAction: 'none' }}
              />
            </div>

            <div style={{ fontSize: '12px', color: '#6b7a9a', marginBottom: '16px', textAlign: 'center' }}>
              🔒 החתימה מאובטחת ומשפטית תקפה על פי חוק החתימה האלקטרונית
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={clearSignature}
                style={{
                  flex: 1, padding: '11px', background: 'white',
                  border: '1.5px solid #d1dce8', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '14px', color: '#6b7a9a', fontWeight: '600',
                }}
              >
                🗑️ {t('clearSignature')}
              </button>
              <button
                onClick={submitSignature}
                disabled={!hasSignature || isSigning}
                style={{
                  flex: 2, padding: '11px',
                  background: hasSignature && !isSigning
                    ? 'linear-gradient(135deg, #1e3a6e, #2451a0)'
                    : '#93b8ea',
                  border: 'none', borderRadius: '10px',
                  cursor: hasSignature && !isSigning ? 'pointer' : 'default',
                  fontSize: '14px', color: 'white', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isSigning ? (
                  <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> חותם...</>
                ) : (
                  <>✅ {t('submitSignature')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending docs */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          ⏳ {t('pendingDocuments')}
        </h2>
        {pendingDocs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingDocs.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: '#fff9f0',
                border: '1px solid #fcd34d', borderRadius: '12px',
              }}>
                <span style={{ fontSize: '28px' }}>📝</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#1a2744', fontSize: '15px' }}>{doc.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7a9a', marginTop: '2px' }}>
                    {t('uploadDate')}: {new Date(doc.uploadDate).toLocaleDateString('he-IL')} | {doc.size}
                  </div>
                </div>
                <span className="badge-pending">{t('signatureRequired')}</span>
                <button
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    color: 'white', fontSize: '14px', fontWeight: '700',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✍️ {t('signDocument')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7a9a' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
            <div style={{ fontWeight: '600' }}>{t('noDocumentsToSign')}</div>
          </div>
        )}
      </div>

      {/* Signed docs */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          ✅ {t('signedDocuments')}
        </h2>
        {signedDocs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {signedDocs.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px', background: '#f0fdf4',
                border: '1px solid #86efac', borderRadius: '10px',
              }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1a2744', fontSize: '14px' }}>{doc.name}</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px' }}>
                    {t('signedOn')}: {doc.signedDate ? new Date(doc.signedDate).toLocaleDateString('he-IL') : '—'}
                  </div>
                </div>
                <button style={{
                  padding: '7px 14px', background: 'white',
                  border: '1px solid #86efac', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '12px', color: '#16a34a', fontWeight: '600',
                }}>
                  ⬇️ {t('download')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: '#6b7a9a' }}>
            {t('noDocumentsToSign')}
          </div>
        )}
      </div>
    </div>
  );
}
