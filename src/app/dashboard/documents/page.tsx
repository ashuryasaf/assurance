'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockDocuments, Document } from '@/lib/mockData';

const typeIcons: Record<string, string> = {
  policy: '📋',
  claim: '📝',
  invoice: '🧾',
  report: '📊',
  identification: '🪪',
  other: '📄',
};

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filters = ['all', 'policy', 'claim', 'invoice', 'report', 'other'];
  const filterLabels: Record<string, string> = {
    all: t('all'),
    policy: 'פוליסות',
    claim: 'תביעות',
    invoice: 'חשבוניות',
    report: 'דוחות',
    other: 'אחר',
  };

  const filtered = documents.filter(d => {
    const matchType = filter === 'all' || d.type === filter;
    const matchSearch = !searchTerm || d.name.includes(searchTerm) || (d.relatedPolicyNumber && d.relatedPolicyNumber.includes(searchTerm));
    return matchType && matchSearch;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newDocs: Document[] = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: file.name,
      type: 'other' as const,
      size: `${Math.round(file.size / 1024)} KB`,
      uploadDate: new Date().toISOString().split('T')[0],
      requiresSignature: false,
      signed: false,
    }));
    setDocuments(prev => [...newDocs, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{t('myDocuments')}</h1>
          <p style={{ color: '#6b7a9a', fontSize: '14px', marginTop: '4px' }}>
            {t('totalDocuments')}: {documents.length}
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? '#1e3a6e' : '#c8dbf0'}`,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? '#f0f6ff' : '#f8faff',
          transition: 'all 0.2s',
          marginBottom: '24px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📤</div>
        <div style={{ fontWeight: '700', color: '#1e3a6e', fontSize: '16px', marginBottom: '6px' }}>
          {t('dragDropUpload')}
        </div>
        <div style={{ color: '#6b7a9a', fontSize: '13px' }}>{t('supportedFormats')}</div>
      </div>

      {uploadSuccess && (
        <div className="animate-fadeIn" style={{
          background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a',
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          fontWeight: '600', fontSize: '14px',
        }}>
          ✅ {t('documentUploaded')}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`🔍 ${t('search')}...`}
            className="input-field"
            style={{ fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: '20px', border: '1.5px solid',
                borderColor: filter === f ? '#1e3a6e' : '#d1dce8',
                background: filter === f ? '#1e3a6e' : 'white',
                color: filter === f ? 'white' : '#6b7a9a',
                cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Documents table */}
      {filtered.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('documentName')}</th>
                  <th>{t('documentType')}</th>
                  <th>{t('relatedPolicy')}</th>
                  <th>{t('uploadDate')}</th>
                  <th>{t('fileSize')}</th>
                  <th>{t('status')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{typeIcons[doc.type]}</span>
                        <span style={{ fontWeight: '600', color: '#1a2744' }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#6b7a9a' }}>{filterLabels[doc.type] || doc.type}</td>
                    <td style={{ fontSize: '13px', color: '#6b7a9a' }}>{doc.relatedPolicyNumber || '—'}</td>
                    <td style={{ color: '#6b7a9a' }}>{new Date(doc.uploadDate).toLocaleDateString('he-IL')}</td>
                    <td style={{ color: '#6b7a9a' }}>{doc.size}</td>
                    <td>
                      {doc.requiresSignature && !doc.signed && (
                        <span className="badge-pending">✍️ ממתין לחתימה</span>
                      )}
                      {doc.signed && (
                        <span className="badge-active">✅ נחתם</span>
                      )}
                      {!doc.requiresSignature && !doc.signed && (
                        <span style={{ color: '#6b7a9a', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{
                          padding: '5px 10px', background: '#f0f6ff', border: '1px solid #c8dbf0',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#1e3a6e', fontWeight: '600',
                        }}>
                          👁️ {t('view')}
                        </button>
                        <button style={{
                          padding: '5px 10px', background: '#f0fdf4', border: '1px solid #86efac',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#16a34a', fontWeight: '600',
                        }}>
                          ⬇️ {t('download')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#6b7a9a' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{t('noDocuments')}</div>
        </div>
      )}
    </div>
  );
}
