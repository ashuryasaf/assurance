import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://assurance.co.il";

const title = "הזדמנויות השקעה בלעדיות — Assurance";
const description =
  "פנייה אישית למשקיעים שמחפשים תשואות גבוהות: קרנות, ניירות ערך, נדל\"ן מניב, פנסיה והשתלמות. מלאו את הטופס ונציג השקעות ייחזור אליכם.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${BASE_URL}/landing/investments`,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: `${BASE_URL}/landing/investments`,
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
