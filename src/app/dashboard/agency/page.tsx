'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockAgencies, mockUsers } from '@/lib/mockData';
import { ROLE_LABELS_HE } from '@/lib/types';
import { useState } from 'react';

export default function AgencyPage() {
  const { t } = useLanguage();
  const [showAddAgent, setShowAddAgent] = useState(false);

  const agency = mockAgencies[0];
  const agents = mockUsers.filter(u => u.role === 'agent' || u.role === 'sub_agent');

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a6e', marginBottom: '6px' }}>
            🏢 {t('agencyManagement')}
          </h1>
          <p style={{ color: '#6b7a9a', fontSize: '15px' }}>ניהול סוכנות, סוכנויות משנה וסוכנים</p>
        </div>
        <button
          onClick={() => setShowAddAgent(!showAddAgent)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white',
            fontWeight: '700', fontSize: '14px',
          }}
        >
          ➕ {t('addAgent')}
        </button>
      </div>

      {/* Main Agency Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', borderInlineStart: '4px solid #c9a227' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e', marginBottom: '8px' }}>{agency.name}</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#6b7a9a', fontSize: '13px' }}>
              <span>📋 {t('licenseNumber')}: {agency.licenseNumber}</span>
              <span>📧 {agency.email}</span>
              <span>📞 {agency.phone}</span>
              <span>📍 {agency.address}</span>
            </div>
          </div>
          <div style={{
            padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '13px',
            background: '#e8f5e9', color: '#2e7d32',
          }}>
            ● {t('regulatoryStatus')}: פעיל
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: t('subAgencies'), value: agency.subAgencies?.length || 0, icon: '🏢', color: '#1e3a6e' },
          { label: t('agents'), value: agents.length, icon: '👥', color: '#2451a0' },
          { label: t('totalClients'), value: '52', icon: '👤', color: '#c9a227' },
          { label: t('totalRevenue'), value: '₪445,000', icon: '💰', color: '#1a8c5a' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px', borderInlineStart: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7a9a' }}>{s.label}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a6e' }}>{s.value}</div>
              </div>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sub Agencies */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          🏢 {t('subAgencies')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {agency.subAgencies?.map(sub => (
            <div key={sub.id} style={{
              padding: '16px', borderRadius: '12px', background: '#f0f6ff',
              border: '1px solid #dae8f8',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ fontWeight: '700', color: '#1e3a6e' }}>{sub.name}</h4>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '8px', background: '#e8f5e9', color: '#2e7d32', fontWeight: '700' }}>
                  פעיל
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#6b7a9a' }}>
                <span>📋 {sub.licenseNumber}</span>
                <span>📧 {sub.email}</span>
                <span>📞 {sub.phone}</span>
                <span>📍 {sub.address}</span>
              </div>
            </div>
          ))}
          <div
            onClick={() => setShowAddAgent(true)}
            style={{
              padding: '16px', borderRadius: '12px', border: '2px dashed #dae8f8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: '#6b7a9a', fontSize: '14px', fontWeight: '600', minHeight: '120px',
            }}
          >
            ➕ {t('addSubAgency')}
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a6e', marginBottom: '16px' }}>
          👥 {t('agents')}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {['שם', 'דוא"ל', 'טלפון', 'תפקיד', t('licenseNumber'), t('status')].map(h => (
                  <th key={h} style={{ padding: '12px 14px', background: '#f0f6ff', color: '#1e3a6e', fontWeight: '700', fontSize: '13px', textAlign: 'start' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '12px',
                      }}>
                        {agent.firstName[0]}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{agent.firstName} {agent.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{agent.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6b7a9a' }}>{agent.phone}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: agent.role === 'agent' ? '#e3f2fd' : '#f3e5f5',
                      color: agent.role === 'agent' ? '#1565c0' : '#7b1fa2',
                    }}>
                      {ROLE_LABELS_HE[agent.role]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px' }}>{agent.licenseNumber || '-'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: agent.isActive ? '#e8f5e9' : '#fce4ec',
                      color: agent.isActive ? '#2e7d32' : '#c62828',
                    }}>
                      {agent.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAddAgent(false)}
        >
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a6e', marginBottom: '20px' }}>
              ➕ {t('addAgent')}
            </h3>
            {['שם פרטי', 'שם משפחה', 'דוא"ל', 'טלפון', 'מספר רישיון'].map(label => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>{label}</label>
                <input style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                  fontSize: '14px', outline: 'none',
                }} />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a6e', marginBottom: '4px' }}>תפקיד</label>
              <select style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                fontSize: '14px', outline: 'none', background: 'white',
              }}>
                <option value="agent">סוכן</option>
                <option value="sub_agent">סוכן משנה</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddAgent(false)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #dae8f8',
                background: 'white', color: '#6b7a9a', fontWeight: '600', cursor: 'pointer',
              }}>{t('cancel')}</button>
              <button onClick={() => { setShowAddAgent(false); alert('סוכן נוסף בהצלחה!'); }} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', color: 'white',
                fontWeight: '700', cursor: 'pointer',
              }}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
