'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { AIAssistantBar } from '@/components/dashboard/AIAssistantBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a1628, #1e3a6e)',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>טוען...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f7fc',
    }}>
      <DashboardSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AIAssistantBar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
