import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://assurance.co.il";

const title = "ביטוח חכם ומותאם אישית — Assurance";
const description =
  "פנייה אישית ללקוחות שמחפשים את הביטוח הנכון: ביטוח חיים, בריאות, רכב, דירה ועסק. מלאו את הטופס ונציג מומחה ייחזור אליכם בזמן הנוח לכם.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${BASE_URL}/landing/insurance`,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: `${BASE_URL}/landing/insurance`,
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
