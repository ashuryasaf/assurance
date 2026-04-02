'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  key: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: '🏠' },
  { key: 'policies', href: '/dashboard/policies', icon: '📋' },
  { key: 'documents', href: '/dashboard/documents', icon: '��' },
  { key: 'marketplace', href: '/dashboard/marketplace', icon: '🛒' },
  { key: 'reports', href: '/dashboard/reports', icon: '📊' },
  { key: 'esign', href: '/dashboard/esign', icon: '✍️' },
  { key: 'profile', href: '/dashboard/profile', icon: '👤' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f2244 0%, #1e3a6e 60%, #1a3060 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '28px', marginBottom: '4px' }}>🛡️</div>
        <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>אשורי</div>
        <div style={{ color: '#93b8ea', fontSize: '11px', marginTop: '2px' }}>סוכנות לביטוח</div>
      </div>

      {/* User info */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0,
        }}>
          {user?.firstName?.[0] || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: 'white', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ color: '#93b8ea', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
              style={{ marginBottom: '2px', textDecoration: 'none' }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '8px 12px', marginBottom: '6px' }}>
          <LanguageSwitcher />
        </div>
        <button
          onClick={() => { logout(); }}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isRtl } = useLanguage();

  return (
    <>
      <style>{`
        .sidebar-desktop { display: flex; }
        .mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop no-print">
        <SidebarContent />
      </div>

      {/* Mobile toggle button */}
      <button
        className="mobile-toggle no-print"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: '12px',
          [isRtl ? 'right' : 'left']: '12px',
          zIndex: 1001,
          background: '#1e3a6e',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '20px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
