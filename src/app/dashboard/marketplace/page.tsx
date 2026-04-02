'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockProducts } from '@/lib/mockData';
import { useState } from 'react';

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', ...new Set(mockProducts.map(p => p.category))];
  const filtered = mockProducts.filter(p => {
    const matchSearch = !search || p.name.includes(search) || p.provider.includes(search);
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '24px' }}>
        🛒 {t('marketplace')}
      </h1>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
          style={{ flex: 1, minWidth: '200px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #dae8f8', fontSize: '14px', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              background: category === cat ? '#1e3a6e' : '#f0f6ff', color: category === cat ? 'white' : '#1e3a6e',
            }}>
              {cat === 'all' ? 'הכל' : cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map(product => (
          <div key={product.id} className="card" style={{ padding: '22px', transition: 'transform 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '4px' }}>{product.name}</h3>
                <div style={{ color: '#6b7a9a', fontSize: '13px' }}>{product.provider} • {product.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c9a227', fontWeight: '700' }}>
                ⭐ {product.rating}
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#c9a227', marginBottom: '12px' }}>
              {product.price}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {product.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7a9a' }}>
                  <span style={{ color: '#22c55e' }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button style={{
              width: '100%', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white', fontWeight: '700', fontSize: '14px',
            }}>
              קבל הצעת מחיר
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
