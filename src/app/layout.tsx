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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
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
