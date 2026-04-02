import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Assurance - סוכנות ביטוח דיגיטלית מתקדמת',
  description: 'פורטל ביטוח דיגיטלי מתקדם - ניהול ביטוחים, פנסיה, השקעות, מסלקה פנסיונית, הר הביטוח, גמל נט',
  keywords: 'ביטוח, פנסיה, השקעות, הר הביטוח, מסלקה פנסיונית, גמל נט, סוכן ביטוח, assurance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
