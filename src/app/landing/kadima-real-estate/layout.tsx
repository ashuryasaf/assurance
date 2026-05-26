import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://assurance.co.il";

const title = "קרקע פרטית במתחם H קדימה צורן — Assurance";
const description =
  "הזדמנות להיכנס מוקדם לאזור עם פוטנציאל עליית ערך יוצא דופן. קרקע פרטית במתחם H קדימה צורן — תוכנית מתאר מאושרת 2024, החל מכ-320,000 ₪. השאירו פרטים לקבלת שמאות, נסח טאבו ומידע תכנוני.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${BASE_URL}/landing/kadima-real-estate`,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: `${BASE_URL}/landing/kadima-real-estate`,
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
