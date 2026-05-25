import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://assurance.co.il";

const title = "הזדמנויות נדל\"ן ייחודיות — Assurance";
const description =
  "פנייה אישית ללקוחות שמחפשים את ההשקעה הבאה שלהם בנדל\"ן: דירות יד ראשונה, נכסים מניבים, השקעות בחו\"ל ופרויקטים בלעדיים. מלאו את הטופס ונציג ייחזור אליכם בזמן הנוח לכם.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${BASE_URL}/landing/real-estate`,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: `${BASE_URL}/landing/real-estate`,
    siteName: "Assurance",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div lang="he" dir="rtl">{children}</div>;
}
