'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { apiFetch, useApi } from '@/lib/client-api';
import { useState, useRef } from 'react';
import type { Document } from '@/lib/types';

export default function DocumentsPage() {
  const { t } = useLanguage();
  const { data, loading, error, refresh, setData } = useApi<{ documents: Document[] }>('/api/documents');
  const docs = data?.documents ?? [];
  const [dragOver, setDragOver] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [filter, setFilter] = useState('all');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    for (const file of Array.from(files)) {
      const tempId = `tmp-${Date.now()}-${file.name}`;
      setUploading(u => [...u, tempId]);
      try {
        const form = new FormData();
        form.append('file', file);
        const result = await apiFetch<{ document: Document }>('/api/documents', {
          method: 'POST',
          body: form,
        });
        setData(prev => ({ documents: [result.document, ...(prev?.documents ?? [])] }));
      } catch (err) {
        setUploadError((err as Error).message);
      } finally {
        setUploading(u => u.filter(x => x !== tempId));
      }
    }
    void refresh();
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#fff3cd', color: '#856404' },
    processed: { bg: '#d4edda', color: '#155724' },
    signed: { bg: '#cce5ff', color: '#004085' },
    archived: { bg: '#e2e3e5', color: '#383d41' },
    rejected: { bg: '#f8d7da', color: '#721c24' },
  };

  const statusLabels: Record<string, string> = {
    pending: t('pending'), processed: t('processed'), signed: t('signed'),
    archived: t('archived'), rejected: t('rejected'),
  };

  const filteredDocs = filter === 'all' ? docs : docs.filter(d => d.status === filter);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        📁 {t('documentManagement')}
      </h1>

      {(error || uploadError) && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fce4ec', color: '#c62828', marginBottom: '16px' }}>
          ⚠️ {uploadError || error}
        </div>
      )}

      <div
        className="card"
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); void handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '40px', marginBottom: '24px', textAlign: 'center', cursor: 'pointer',
          border: dragOver ? '3px dashed #c9a227' : '3px dashed #dae8f8',
          background: dragOver ? '#fdf6e3' : '#f8f9fc',
          borderRadius: '14px', transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{dragOver ? '📥' : '📤'}</div>
        <div style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '6px' }}>{t('dragDrop')}</div>
        <div style={{ color: '#6b7a9a', fontSize: '14px', marginBottom: '4px' }}>{t('orBrowse')}</div>
        <div style={{ color: '#6b7a9a', fontSize: '12px' }}>{t('supportedFormats')}</div>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.xlsx,.xls,.csv,.zip,.jpg,.jpeg,.png,.doc,.docx,.txt" style={{ display: 'none' }}
          onChange={e => void handleUpload(e.target.files)} />
        {uploading.length > 0 && (
          <div style={{ marginTop: '12px', color: '#856404', fontWeight: 600 }}>
            ⏳ מעלה {uploading.length} קובץ(ים)...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'processed', 'signed', 'archived'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === f ? '#1e3a6e' : '#f0f6ff', color: filter === f ? 'white' : '#1e3a6e',
            fontWeight: '600', fontSize: '12px',
          }}>
            {f === 'all' ? 'הכל' : statusLabels[f]} ({f === 'all' ? docs.length : docs.filter(d => d.status === f).length})
          </button>
        ))}
      </div>

      {loading && <div style={{ color: '#6b7a9a', fontSize: '14px' }}>טוען מסמכים...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {filteredDocs.map(doc => (
          <div key={doc.id} className="card" style={{ padding: '18px', cursor: 'pointer' }}
            onClick={() => setSelectedDoc(doc)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>
                  {doc.mimeType.includes('pdf') ? '📄' : doc.mimeType.includes('sheet') || doc.mimeType.includes('excel') ? '📊' : doc.mimeType.includes('zip') ? '📦' : '📎'}
                </span>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e3a6e', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>
                    {(doc.size / 1024 / 1024).toFixed(1)} MB • {doc.uploadDate}
                  </div>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
                background: statusColors[doc.status]?.bg, color: statusColors[doc.status]?.color,
              }}>
                {statusLabels[doc.status]}
              </span>
            </div>
            {doc.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {doc.tags.map(tag => (
                  <span key={tag} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', background: '#f0f6ff', color: '#2451a0', fontWeight: '600' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {doc.aiAnalysis && (
              <div style={{ padding: '8px 12px', background: '#fdf6e3', borderRadius: '8px', fontSize: '12px', color: '#856404' }}>
                🤖 {doc.aiAnalysis.summary.substring(0, 80)}...
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelectedDoc(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e' }}>{selectedDoc.name}</h3>
              <button onClick={() => setSelectedDoc(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'סוג', value: selectedDoc.type },
                { label: 'גודל', value: `${(selectedDoc.size / 1024 / 1024).toFixed(2)} MB` },
                { label: 'תאריך העלאה', value: selectedDoc.uploadDate },
                { label: 'סטטוס', value: statusLabels[selectedDoc.status] },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px', background: '#f0f6ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7a9a' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a6e' }}>{item.value}</div>
                </div>
              ))}
            </div>
            {selectedDoc.aiAnalysis && (
              <div style={{ padding: '16px', background: '#fdf6e3', borderRadius: '12px', marginBottom: '16px' }}>
                <h4 style={{ fontWeight: '700', color: '#1e3a6e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🤖 {t('aiAnalysis')}
                  <span style={{ fontSize: '11px', color: '#c9a227', fontWeight: '600' }}>
                    ({(selectedDoc.aiAnalysis.confidence * 100).toFixed(0)}% ביטחון)
                  </span>
                </h4>
                <p style={{ fontSize: '14px', color: '#1e3a6e', marginBottom: '12px' }}>{selectedDoc.aiAnalysis.summary}</p>
                {selectedDoc.aiAnalysis.recommendations.map((rec, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#856404', padding: '4px 0', display: 'flex', gap: '6px' }}>
                    <span>💡</span> {rec}
                  </div>
                ))}
              </div>
            )}
            {selectedDoc.signatureData && (
              <div style={{ padding: '16px', background: '#e8f5e9', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: '700', color: '#2e7d32', marginBottom: '8px' }}>✅ חתימה דיגיטלית</h4>
                <div style={{ fontSize: '13px', color: '#1e3a6e' }}>
                  נחתם ב: {selectedDoc.signatureData.signedAt}
                  {selectedDoc.signatureData.verified && ' • ✅ מאומת'}
                </div>
              </div>
            )}
            {selectedDoc.url && (
              <div style={{ marginTop: '16px' }}>
                <a href={selectedDoc.url} target="_blank" rel="noreferrer" style={{
                  display: 'inline-block', padding: '10px 20px', borderRadius: '10px', background: '#1e3a6e', color: 'white',
                  fontWeight: '700', textDecoration: 'none', fontSize: '14px',
                }}>
                  ⬇ הורד / צפה במקור
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
