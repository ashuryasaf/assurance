'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ROLE_LABELS_HE, hasPermission } from '@/lib/types';

interface NavItem {
  key: string;
  href: string;
  icon: string;
  requiredRole?: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: '🏠' },
  { key: 'policies', href: '/dashboard/policies', icon: '📋' },
  { key: 'documents', href: '/dashboard/documents', icon: '📁' },
  { key: 'regulatory', href: '/dashboard/regulatory', icon: '🏛️' },
  { key: 'investments', href: '/dashboard/investments', icon: '📈' },
  { key: 'marketplace', href: '/dashboard/marketplace', icon: '🛒' },
  { key: 'reports', href: '/dashboard/reports', icon: '📊' },
  { key: 'esign', href: '/dashboard/esign', icon: '✍️' },
  { key: 'ai_assistant', href: '/dashboard/ai-assistant', icon: '🤖' },
  { key: 'agency', href: '/dashboard/agency', icon: '🏢', requiredRole: 'agent' },
  { key: 'affiliates', href: '/dashboard/affiliates', icon: '🤝', requiredRole: 'agent' },
  { key: 'banking', href: '/dashboard/banking', icon: '🏦' },
  { key: 'recordings', href: '/dashboard/recordings', icon: '🎙️' },
  { key: 'architecture', href: '/dashboard/architecture', icon: '🔧' },
  { key: 'profile', href: '/dashboard/profile', icon: '👤' },
];

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    return hasPermission(user.role, item.requiredRole as never);
  });

  const roleLabel = user ? ROLE_LABELS_HE[user.role] : '';

  const sidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #0a1628 0%, #1a3060 100%)',
    }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>Assurance</div>
            <div style={{ color: '#c9a227', fontSize: '11px', fontWeight: '600' }}>סוכנות ביטוח דיגיטלית</div>
          </div>
        </Link>
      </div>

      {user && (
        <div style={{
          padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '16px',
          }}>
            {user.firstName[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{
              display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
              fontWeight: '700', background: 'rgba(201,162,39,0.2)', color: '#d4b44a',
            }}>
              {roleLabel}
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filteredNav.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? '700' : '500',
                background: isActive ? 'rgba(201,162,39,0.15)' : 'transparent',
                color: isActive ? '#d4b44a' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <LanguageSwitcher variant="compact" />
        <button
          onClick={logout}
          style={{
            width: '100%', marginTop: '8px', padding: '10px',
            background: 'rgba(255,59,48,0.15)', border: 'none', borderRadius: '10px',
            color: '#ff6b6b', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          🚪 {t('logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none', position: 'fixed', top: '12px', insetInlineStart: '12px',
          zIndex: 200, background: '#1e3a6e', color: 'white', border: 'none',
          borderRadius: '10px', padding: '10px 14px', fontSize: '20px', cursor: 'pointer',
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      <aside style={{
        width: '260px', minHeight: '100vh', flexShrink: 0,
      }} className="desktop-sidebar">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          display: 'flex',
        }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{ position: 'relative', width: '280px', height: '100%' }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
