import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "קרקע פרטית במתחם H קדימה צורן — Assurance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "linear-gradient(135deg, #0a1628 0%, #1e3a6e 55%, #0f2244 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "30px", fontWeight: 700 }}>
          <span style={{ fontSize: "56px" }}>🛡️</span>
          <span>Assurance</span>
          <span style={{ color: "#c9a227", marginInlineStart: "6px", fontWeight: 800 }}>· קדימה נדל&quot;ן</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "880px" }}>
          <div style={{ fontSize: "56px", fontWeight: 800, lineHeight: 1.15 }}>
            קרקע פרטית במתחם H קדימה צורן
          </div>
          <div style={{ fontSize: "28px", color: "#dae8f8", lineHeight: 1.4 }}>
            תוכנית מתאר מאושרת 2024 · החל מכ-320,000 ₪ · פוטנציאל השבחה משמעותי
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "22px",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <span>📐 כ-3,200 ₪ למ&quot;ר</span>
            <span>📋 ליווי משפטי מלא</span>
            <span>📈 פוטנציאל השבחה</span>
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #c9a227, #a87c1a)",
              fontWeight: 700,
              color: "white",
            }}
          >
            השאירו פרטים →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
