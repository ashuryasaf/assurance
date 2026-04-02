'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockProducts, InsuranceProduct } from '@/lib/mockData';

const typeIcons: Record<string, string> = {
  life: '💙',
  health: '💚',
  car: '🚗',
  home: '🏠',
  pension: '🏦',
  travel: '✈️',
  critical: '❤️',
};

function ProductCard({ product, t }: { product: InsuranceProduct; t: (k: string) => string }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="card" style={{
      padding: '24px',
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(30,58,110,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(10,22,40,0.06)';
      }}
    >
      {/* Badges */}
      <div style={{ position: 'absolute', top: '16px', insetInlineStart: '16px', display: 'flex', gap: '6px' }}>
        {product.isRecommended && (
          <span style={{
            background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
            color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
          }}>⭐ {t('recommended')}</span>
        )}
        {product.isBestValue && (
          <span style={{
            background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
            color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
          }}>💎 {t('bestValue')}</span>
        )}
      </div>

      <div style={{ marginTop: product.isRecommended || product.isBestValue ? '28px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #f0f6ff, #dae8f8)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px',
          }}>
            {typeIcons[product.type]}
          </div>
          <div>
            <h3 style={{ fontWeight: '800', color: '#1e3a6e', fontSize: '17px' }}>{product.name}</h3>
            <div style={{ color: '#6b7a9a', fontSize: '13px' }}>{product.insurer}</div>
          </div>
        </div>

        <p style={{ color: '#6b7a9a', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
          {product.description}
        </p>

        {/* Price */}
        <div style={{
          background: '#f8faff', borderRadius: '10px', padding: '14px',
          marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '4px',
        }}>
          <span style={{ fontSize: '13px', color: '#6b7a9a' }}>{t('from')}</span>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#1e3a6e' }}>{product.monthlyPriceFrom}</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a6e' }}>₪</span>
          <span style={{ fontSize: '13px', color: '#6b7a9a' }}>{t('perMonth')}</span>
        </div>

        {/* Features */}
        {showDetails && (
          <div className="animate-fadeIn" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a6e', marginBottom: '8px' }}>
              {t('features')}:
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {product.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4a5568' }}>
                  <span style={{ color: '#16a34a' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              flex: 1, padding: '10px', background: '#f0f6ff', border: '1px solid #c8dbf0',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e3a6e', fontWeight: '600',
            }}
          >
            {showDetails ? '▲ ' + t('close') : '▼ ' + t('learnMore')}
          </button>
          <button style={{
            flex: 1, padding: '10px',
            background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', color: 'white', fontWeight: '700',
          }}>
            🛒 {t('getQuote')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [activeType, setActiveType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const types = ['all', 'life', 'health', 'car', 'home', 'pension', 'travel', 'critical'];
  const typeLabels: Record<string, string> = {
    all: t('all'),
    life: t('lifeInsurance'),
    health: t('healthInsurance'),
    car: t('carInsurance'),
    home: t('homeInsurance'),
    pension: t('pension'),
    travel: t('travelInsurance'),
    critical: t('criticalIllness'),
  };

  const filtered = mockProducts.filter(p => {
    const matchType = activeType === 'all' || p.type === activeType;
    const matchSearch = !searchTerm || p.name.includes(searchTerm) || p.description.includes(searchTerm);
    return matchType && matchSearch;
  });

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a6e' }}>{t('insuranceMarketplace')}</h1>
        <p style={{ color: '#6b7a9a', fontSize: '14px', marginTop: '4px' }}>
          {t('browseProducts')} — השווה מחירים ורכוש ביטוח בקלות
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
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
          {types.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: '7px 14px', borderRadius: '20px', border: '1.5px solid',
                borderColor: activeType === type ? '#1e3a6e' : '#d1dce8',
                background: activeType === type ? '#1e3a6e' : 'white',
                color: activeType === type ? 'white' : '#6b7a9a',
                cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              }}
            >
              {typeIcons[type] && type !== 'all' ? `${typeIcons[type]} ` : ''}{typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} t={t} />)}
      </div>

      {/* CTA banner */}
      <div style={{
        marginTop: '32px',
        background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '6px' }}>
            לא מצאת מה שחיפשת?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
            צור קשר עם הסוכן שלך לפתרון מותאם אישית
          </p>
        </div>
        <button style={{
          padding: '12px 28px',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
          border: 'none', borderRadius: '10px', cursor: 'pointer',
          color: 'white', fontSize: '15px', fontWeight: '700',
          whiteSpace: 'nowrap',
        }}>
          📞 {t('contact')}
        </button>
      </div>
    </div>
  );
}
