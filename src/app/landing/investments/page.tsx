'use client';

import { useEffect, useMemo, useState } from 'react';

type TimeSlot = 'morning' | 'noon' | 'evening';

const TIME_SLOTS: { key: TimeSlot; label: string; hours: string; emoji: string }[] = [
  { key: 'morning', label: 'בוקר', hours: '09:00 – 12:00', emoji: '🌅' },
  { key: 'noon', label: 'צהריים', hours: '12:00 – 17:00', emoji: '☀️' },
  { key: 'evening', label: 'ערב', hours: '17:00 – 20:00', emoji: '🌆' },
];

const HIGHLIGHTS = [
  { icon: '📈', title: 'תשואות מוכחות', body: 'גישה לקרנות נאמנות, תעודות סל ותיקי השקעה מנוהלים עם רקורד מוכח של תשואות.' },
  { icon: '🏦', title: 'פנסיה והשתלמות', body: 'אופטימיזציה של קופות הגמל, קרנות ההשתלמות והפנסיה שלכם — חיסכון אלפי שקלים.' },
  { icon: '🔍', title: 'ניתוח אישי', body: 'מיפוי פרופיל הסיכון, יעדי ההשקעה ולוח הזמנים שלכם לבניית תיק מותאם.' },
  { icon: '💎', title: 'השקעות אלטרנטיביות', body: 'גישה להשקעות פרטיות, קרנות גידור ונדל"ן מניב שלא זמינות לציבור הרחב.' },
];

const TESTIMONIALS = [
  { quote: 'בזכות הייעוץ הצמוד הגדלנו את התשואה על תיק ההשקעות ב-18% תוך שנה.', author: 'אבי ונורית, הרצליה' },
  { quote: 'גילינו שמשלמים דמי ניהול כפולים בפנסיה. החיסכון — מעל 200,000 ₪ לפנסיה.', author: 'שרון, רמת גן' },
  { quote: 'השקעה ראשונה בחיים — הרגשנו בטוחים עם הליווי. היום התיק מניב 12% שנתי.', author: 'ליאת ויותם, תל אביב' },
];

export default function InvestmentsLandingPage() {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    preferredTime: '' as '' | TimeSlot,
    notes: '',
    consent: false,
  });
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const captured: Record<string, string> = {};
    for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
      const val = params.get(`utm_${key}`);
      if (val) captured[key] = val.slice(0, 60);
    }
    setUtm(captured);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.preferredTime) {
      setError('נא לבחור שעה מועדפת לפנייה');
      return;
    }
    if (!form.consent) {
      setError('נא לאשר את תנאי השימוש לפני שליחה');
      return;
    }
    setSubmitting(true);
    try {
      const referrer = typeof document !== 'undefined' ? document.referrer.slice(0, 300) : undefined;
      const res = await fetch('/api/landing/real-estate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          preferredTime: form.preferredTime,
          notes: form.notes || undefined,
          campaignType: 'investments',
          source: 'investments-landing',
          referrer,
          utm,
          consent: true,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? 'אירעה שגיאה. נסו שוב.');
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || 'שגיאת רשת. בדקו חיבור.');
    } finally {
      setSubmitting(false);
    }
  };

  const heroBackground = useMemo(
    () => ({
      backgroundImage:
        "radial-gradient(circle at 20% 20%, rgba(201,162,39,0.18) 0%, transparent 38%), radial-gradient(circle at 85% 0%, rgba(36,81,160,0.35) 0%, transparent 45%), linear-gradient(135deg, #0a1628 0%, #1e3a6e 55%, #0f2244 100%)",
    }),
    [],
  );

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fc', color: '#1e3a6e', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <section
        style={{
          ...heroBackground,
          color: 'white',
          padding: '64px 24px 96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: '48px', alignItems: 'center' }}
          className="re-hero-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#dae8f8' }}>
              <span style={{ fontSize: '28px' }}>🛡️</span>
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em' }}>Assurance · השקעות</span>
            </div>
            <h1 style={{ fontSize: '44px', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
              הזדמנויות השקעה בלעדיות, <br />
              <span style={{ color: '#d4b44a' }}>תשואות שעובדות בשבילכם.</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', maxWidth: '540px', lineHeight: 1.6, marginBottom: '32px' }}>
              קרנות נאמנות, תיקי השקעות מנוהלים, פנסיה, קרנות השתלמות והשקעות אלטרנטיביות —
              השאירו פרטים ונציג השקעות יחזור אליכם בזמן שמתאים.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '36px' }}>
              {[
                ['📈', '₪2.5B+', 'נכסים מנוהלים'],
                ['📞', '24 שעות', 'זמן מענה'],
                ['🏆', '15+ שנות', 'ניסיון'],
              ].map(([icon, big, small]) => (
                <div key={small} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>{big}</div>
                    <div style={{ fontSize: '12px', color: '#aac4e6' }}>{small}</div>
                  </div>
                </div>
              ))}
            </div>

            <a href="#contact-form" style={{
              display: 'inline-block', padding: '14px 28px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white',
              textDecoration: 'none', fontWeight: 800, fontSize: '16px', boxShadow: '0 12px 32px rgba(201,162,39,0.35)',
            }}>
              קבלו ייעוץ השקעות אישי →
            </a>
          </div>

          <FormCard
            id="contact-form"
            form={form}
            setForm={setForm}
            submit={submit}
            submitting={submitting}
            success={success}
            error={error}
            successMessage="תודה! קיבלנו את הפנייה. יועץ השקעות בכיר יחזור אליך תוך 24 שעות, בזמן שביקשת."
            ctaLabel="שלחו לי הצעת השקעה"
          />
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '-56px auto 0', padding: '0 24px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px',
          background: 'white', padding: '24px', borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(15,34,68,0.12)', position: 'relative', zIndex: 2,
        }}>
          {HIGHLIGHTS.map(item => (
            <div key={item.title} style={{ padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '17px', color: '#1e3a6e', marginBottom: '6px' }}>{item.title}</div>
              <div style={{ fontSize: '14px', color: '#52668c', lineHeight: 1.6 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a6e', marginBottom: '24px', textAlign: 'center' }}>
          איך התהליך עובד?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            ['1', '📩 השארת פרטים', 'ממלאים את הטופס — שם, טלפון ושעה נוחה.'],
            ['2', '☎️ שיחת היכרות', 'יועץ השקעות מוסמך ימפה את הצרכים ופרופיל הסיכון.'],
            ['3', '📊 תכנית מותאמת', 'נבנה תיק מגוון שמתאים ליעדים הפיננסיים שלכם.'],
            ['4', '📈 ליווי שוטף', 'מעקב תשואות, איזון מחדש ודוחות תקופתיים.'],
          ].map(([n, title, body]) => (
            <div key={n} style={{
              background: 'white', borderRadius: '16px', padding: '20px',
              boxShadow: '0 8px 24px rgba(15,34,68,0.06)', borderInlineStart: '4px solid #c9a227',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#c9a227', marginBottom: '6px' }}>שלב {n}</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#1e3a6e', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: '#52668c', lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a6e', marginBottom: '24px', textAlign: 'center' }}>
          לקוחות מדברים
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              boxShadow: '0 8px 24px rgba(15,34,68,0.06)',
            }}>
              <div style={{ fontSize: '32px', color: '#c9a227', marginBottom: '6px' }}>&ldquo;</div>
              <div style={{ fontSize: '15px', color: '#1e3a6e', lineHeight: 1.6, marginBottom: '12px' }}>{t.quote}</div>
              <div style={{ fontSize: '13px', color: '#52668c', fontWeight: 600 }}>— {t.author}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '720px', margin: '64px auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
          color: 'white', padding: '36px 24px', borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(15,34,68,0.18)',
        }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>מוכנים להשקיע נכון?</h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>
            דקה למילוי, יועץ השקעות חוזר אליכם בזמן הנוח.
          </p>
          <a href="#contact-form" style={{
            display: 'inline-block', padding: '14px 28px', borderRadius: '12px',
            background: '#c9a227', color: 'white', fontWeight: 800, textDecoration: 'none',
          }}>
            השארת פרטים →
          </a>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '28px 16px 48px', color: '#6b7a9a', fontSize: '12px' }}>
        © {new Date().getFullYear()} Assurance · אין מדובר בייעוץ השקעות. הפנייה תיענה תוך 24 שעות בימי עסקים.
      </footer>

      <style jsx>{`
        @media (max-width: 880px) {
          :global(.re-hero-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function FormCard({
  id,
  form,
  setForm,
  submit,
  submitting,
  success,
  error,
  successMessage,
  ctaLabel,
}: {
  id: string;
  form: {
    fullName: string;
    phone: string;
    email: string;
    preferredTime: '' | TimeSlot;
    notes: string;
    consent: boolean;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  submit: (e: React.FormEvent) => void;
  submitting: boolean;
  success: boolean;
  error: string | null;
  successMessage: string;
  ctaLabel: string;
}) {
  if (success) {
    return (
      <div id={id} style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '20px 8px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a6e', marginBottom: '8px' }}>תודה! קיבלנו את הפנייה.</h2>
          <p style={{ color: '#52668c', fontSize: '14px', lineHeight: 1.7 }}>{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={submit} style={cardStyle}>
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a6e', marginBottom: '6px' }}>קבלו ייעוץ אישי</h2>
        <p style={{ fontSize: '14px', color: '#52668c' }}>נציג ייצור איתך קשר בזמן הנוח לך — ללא התחייבות.</p>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px', background: '#fce4ec',
          color: '#c62828', fontSize: '13px', fontWeight: 600, marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      <FieldWrapper label="שם מלא *">
        <input
          required
          value={form.fullName}
          autoComplete="name"
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          placeholder="ישראל ישראלי"
          style={inputStyle}
        />
      </FieldWrapper>

      <FieldWrapper label="טלפון נייד *">
        <input
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="050-1234567"
          style={inputStyle}
        />
      </FieldWrapper>

      <FieldWrapper label="אימייל">
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </FieldWrapper>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>שעה מועדפת לפנייה *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {TIME_SLOTS.map(slot => {
            const active = form.preferredTime === slot.key;
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => setForm(f => ({ ...f, preferredTime: slot.key }))}
                style={{
                  padding: '10px 6px', borderRadius: '12px', cursor: 'pointer',
                  border: active ? '2px solid #1e3a6e' : '1.5px solid #dae8f8',
                  background: active ? '#f0f6ff' : 'white',
                  color: '#1e3a6e', fontWeight: 600, fontSize: '13px',
                  textAlign: 'center', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '2px' }}>{slot.emoji}</div>
                <div style={{ fontWeight: 700 }}>{slot.label}</div>
                <div style={{ fontSize: '11px', color: '#6b7a9a', marginTop: '2px' }}>{slot.hours}</div>
              </button>
            );
          })}
        </div>
      </div>

      <FieldWrapper label="מה מעניין אתכם? (לא חובה)">
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
          placeholder="סוג השקעה, סכום, טווח זמן, רמת סיכון..."
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
        />
      </FieldWrapper>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#52668c', marginBottom: '16px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={form.consent}
          onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
          style={{ marginTop: '3px' }}
        />
        <span>
          אני מאשר/ת קבלת פנייה מסוכן Assurance בנושא ההצעה,
          ומסכים/ה כי הפרטים יישמרו במאגר המידע של החברה.
        </span>
      </label>

      <button type="submit" disabled={submitting} style={{
        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
        cursor: submitting ? 'wait' : 'pointer',
        background: submitting ? '#dae8f8' : 'linear-gradient(135deg, #1e3a6e, #2451a0)',
        color: 'white', fontWeight: 800, fontSize: '16px',
        boxShadow: submitting ? 'none' : '0 12px 32px rgba(30,58,110,0.25)',
        transition: 'all 0.15s',
      }}>
        {submitting ? 'שולח...' : ctaLabel}
      </button>

      <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7a9a', textAlign: 'center' }}>
        הפרטים שלכם מאובטחים ולא יועברו לצד שלישי.
      </div>
    </form>
  );
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  color: '#1e3a6e',
  borderRadius: '20px',
  padding: '28px 26px',
  boxShadow: '0 24px 60px rgba(15,34,68,0.25)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #dae8f8',
  fontSize: '15px',
  outline: 'none',
  background: 'white',
  color: '#1e3a6e',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#1e3a6e',
  marginBottom: '4px',
};
