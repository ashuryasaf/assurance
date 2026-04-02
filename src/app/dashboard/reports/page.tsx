'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockReports, Report } from '@/lib/mockData';

const typeIcons: Record<string, string> = {
  annual: '📅',
  policy: '📋',
  claims: '📝',
  pension: '🏦',
  investment: '📈',
};

const typeColors: Record<string, string> = {
  annual: '#1e3a6e',
  policy: '#2451a0',
  claims: '#dc2626',
  pension: '#c9a227',
  investment: '#16a34a',
};

export default function ReportsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const years = ['all', '2024', '2023', '2022'];
  const types = ['all', 'annual', 'policy', 'claims', 'pension', 'investment'];

  const typeLabels: Record<string, string> = {
    all: t('all'),
    annual: t('annualReport'),
    policy: t('policyReport'),
    claims: t('claimsReport'),
    pension: t('pensionReport'),
    investment: t('investmentReport'),
  };

  const filtered = reports.filter(r => {
    const matchType = selectedType === 'all' || r.type === selectedType;
    const matchYear = selectedYear === 'all' || r.year.toString() === selectedYear;
    return matchType && matchYear;
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    const newReport: Report = {
      id: Date.now().toString(),
      title: `דוח ${typeLabels[selectedType === 'all' ? 'annual' : selectedType]} ${new Date().getFullYear()}`,
      type: (selectedType === 'all' ? 'annual' : selectedType) as Report['type'],
      year: new Date().getFullYear(),
      createdDate: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    };
    setReports(prev => [newReport, ...prev]);
    setIsGenerating(false);
  };

  // Simple bar chart for visualization
  const chartData = [
    { label: 'חיים', value: 450, color: '#1e3a6e' },
    { label: 'בריאות', value: 280, color: '#2451a0' },
    { label: 'רכב', value: 320, color: '#c9a227' },
    { label: 'דירה', value: 180, color: '#16a34a' },
    { label: 'פנסיה', value: 1200, color: '#9333ea' },
  ];
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{t('myReports')}</h1>
          <p style={{ color: '#6b7a9a', fontSize: '14px', marginTop: '4px' }}>
            ניתוח מקיף של הביטוחים וההשקעות שלך
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: '10px 20px',
            background: isGenerating ? '#93b8ea' : 'linear-gradient(135deg, #c9a227, #a87c1a)',
            color: 'white', border: 'none', borderRadius: '10px',
            cursor: isGenerating ? 'default' : 'pointer',
            fontSize: '14px', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {isGenerating ? (
            <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> יוצר...</>
          ) : (
            <>📊 {t('generateReport')}</>
          )}
        </button>
      </div>

      {/* Premium chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '20px' }}>
          📊 פרמיות חודשיות לפי סוג ביטוח
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '160px' }}>
          {chartData.map(item => (
            <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.value} ₪</div>
              <div style={{
                width: '100%',
                height: `${(item.value / maxValue) * 100}px`,
                background: `linear-gradient(180deg, ${item.color}cc, ${item.color})`,
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.3s ease',
              }} />
              <div style={{ fontSize: '12px', color: '#6b7a9a', fontWeight: '600' }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#f8faff',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
        }}>
          <span style={{ color: '#6b7a9a' }}>סה"כ פרמיה חודשית:</span>
          <span style={{ fontWeight: '800', color: '#1e3a6e', fontSize: '16px' }}>
            {chartData.reduce((s, d) => s + d.value, 0).toLocaleString()} ₪
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7a9a', marginBottom: '4px' }}>
            {t('selectType')}
          </label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="input-field"
            style={{ width: 'auto', fontSize: '14px', cursor: 'pointer' }}
          >
            {types.map(type => (
              <option key={type} value={type}>{typeLabels[type]}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7a9a', marginBottom: '4px' }}>
            {t('selectYear')}
          </label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="input-field"
            style={{ width: 'auto', fontSize: '14px', cursor: 'pointer' }}
          >
            {years.map(y => (
              <option key={y} value={y}>{y === 'all' ? t('all') : y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports list */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(report => (
            <div key={report.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: `${typeColors[report.type]}15`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                }}>
                  {typeIcons[report.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#1a2744', fontSize: '15px' }}>{report.title}</div>
                  <div style={{ fontSize: '13px', color: '#6b7a9a', marginTop: '2px' }}>
                    נוצר: {new Date(report.createdDate).toLocaleDateString('he-IL')} | {report.size}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px 14px', background: '#f0f6ff', border: '1px solid #c8dbf0',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e3a6e', fontWeight: '600',
                  }}>
                    👁️ {t('view')}
                  </button>
                  <button style={{
                    padding: '8px 14px', background: '#1e3a6e', border: 'none',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'white', fontWeight: '600',
                  }}>
                    ⬇️ {t('downloadReport')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#6b7a9a' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{t('noReports')}</div>
        </div>
      )}
    </div>
  );
}
