'use client';

import { useEffect, useMemo, useState } from 'react';

type TimeSlot = 'morning' | 'noon' | 'evening';

const TIME_SLOTS: { key: TimeSlot; label: string; hours: string; emoji: string }[] = [
  { key: 'morning', label: 'בוקר', hours: '09:00 – 12:00', emoji: '🌅' },
  { key: 'noon', label: 'צהריים', hours: '12:00 – 17:00', emoji: '☀️' },
  { key: 'evening', label: 'ערב', hours: '17:00 – 20:00', emoji: '🌆' },
];

const HIGHLIGHTS = [
  { icon: '🏙️', title: 'נכסים בלעדיים', body: 'גישה מוקדמת לפרויקטים שלא מפורסמים בפומבי – יד ראשונה, נדל"ן מניב והשקעות בחו"ל.' },
  { icon: '📊', title: 'ניתוח שווי שוק', body: 'הערכת תשואה, מימון משלים והתאמה לפרופיל הסיכון שלך – לפני שאתה מתחייב.' },
  { icon: '🤝', title: 'נציג אישי', body: 'אותו נציג מהשיחה הראשונה ועד החתימה. בלי מחזורי שיחות חוזרים, בלי הפתעות.' },
  { icon: '🛡️', title: 'שקיפות מלאה', body: 'כל הנתונים, החוזים והמסמכים שלך זמינים בלוח בקרה דיגיטלי מאובטח.' },
];

const TESTIMONIALS = [
  { quote: 'תוך שבועיים סגרנו דירה להשקעה במחיר שלא חשבנו שאפשרי. ליווי צמוד עד הקבלן.', author: 'יואב ושרית, רעננה' },
  { quote: 'הציעו לנו 3 חלופות מותאמות לתקציב, לא ניסו "למכור" – פשוט ייעצו. סוף סוף.', author: 'מרים, חיפה' },
  { quote: 'נציג אחד, אחראי על הכל. הכי הרגעת ראש שאפשר היה לקבל בעסקה כזו.', author: 'אסף, תל אביב' },
];

export default function RealEstateLandingPage() {
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

  // Capture UTM params + referrer once on mount so they ride along with the
  // form payload. Useful for tracking which campaign sourced each lead.
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
          campaignType: 'real-estate',
          source: 'real-estate-landing',
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
      {/* HERO */}
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
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em' }}>Assurance · נדל&quot;ן</span>
            </div>
            <h1 style={{ fontSize: '44px', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
              הזדמנויות נדל&quot;ן ייחודיות, <br />
              <span style={{ color: '#d4b44a' }}>במחיר ובזמן שמתאים לכם.</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', maxWidth: '540px', lineHeight: 1.6, marginBottom: '32px' }}>
              דירות יד ראשונה, נכסים מניבים, השקעות בחו&quot;ל ופרויקטים בלעדיים — מותאמים לפרופיל ההשקעה שלכם.
              השאירו פרטים ונציג בכיר יחזור אליכם בזמן שמתאים לכם.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '36px' }}>
              {[
                ['🏘️', '+1,200 לקוחות', 'תיק אישי'],
                ['📞', '24 שעות', 'זמן מענה'],
                ['🔒', '100%', 'דיסקרטיות'],
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
              קבלו הצעה אישית →
            </a>
          </div>

          {/* Form card */}
          <FormCard
            id="contact-form"
            form={form}
            setForm={setForm}
            submit={submit}
            submitting={submitting}
            success={success}
            error={error}
          />
        </div>
      </section>

      {/* HIGHLIGHTS */}
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

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: '1180px', margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a6e', marginBottom: '24px', textAlign: 'center' }}>
          איך התהליך עובד?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            ['1', '📩 השארת פרטים', 'ממלאים את הטופס בעמוד הזה - שם, טלפון ושעה נוחה.'],
            ['2', '☎️ שיחת היכרות', 'נציג אישי יחזור אליכם בזמן שביקשתם, ללא ספאם.'],
            ['3', '🏘️ הצעות מותאמות', 'נשלח 2-3 הצעות שתואמות את התקציב והפרופיל שלכם.'],
            ['4', '🤝 ליווי עד החתימה', 'מימון, משא ומתן וביקורת — אנחנו לצידכם.'],
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

      {/* TESTIMONIALS */}
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
              <div style={{ fontSize: '32px', color: '#c9a227', marginBottom: '6px' }}>“</div>
              <div style={{ fontSize: '15px', color: '#1e3a6e', lineHeight: 1.6, marginBottom: '12px' }}>{t.quote}</div>
              <div style={{ fontSize: '13px', color: '#52668c', fontWeight: 600 }}>— {t.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '720px', margin: '64px auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
          color: 'white', padding: '36px 24px', borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(15,34,68,0.18)',
        }}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>מוכנים להתקדם?</h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>
            דקה למילוי, נציג חוזר אליכם בזמן הנוח לכם.
          </p>
          <a href="#contact-form" style={{
            display: 'inline-block', padding: '14px 28px', borderRadius: '12px',
            background: '#c9a227', color: 'white', fontWeight: 800, textDecoration: 'none',
          }}>
            השארת פרטים →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '28px 16px 48px', color: '#6b7a9a', fontSize: '12px' }}>
        © {new Date().getFullYear()} Assurance · אין מדובר בייעוץ או הצעת רכישה. הפנייה תיענה תוך 24 שעות בימי עסקים.
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
}) {
  if (success) {
    return (
      <div id={id} style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '20px 8px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a6e', marginBottom: '8px' }}>תודה! קיבלנו את הפנייה.</h2>
          <p style={{ color: '#52668c', fontSize: '14px', lineHeight: 1.7 }}>
            נציג נדל&quot;ן בכיר יחזור אליך תוך 24 שעות, בזמן שביקשת.
          </p>
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
          ⚠️ {error}
        </div>
      )}

      <Field label="שם מלא *">
        <input
          required
          value={form.fullName}
          autoComplete="name"
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          placeholder="ישראל ישראלי"
          style={inputStyle}
        />
      </Field>

      <Field label="טלפון נייד *">
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
      </Field>

      <Field label="אימייל">
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </Field>

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

      <Field label="הערות (לא חובה)">
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
          placeholder="ספרו לנו על מה שמעניין אתכם — סוג נכס, אזור, תקציב..."
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
        />
      </Field>

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
        {submitting ? 'שולח...' : 'שלחו לי הצעה אישית'}
      </button>

      <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7a9a', textAlign: 'center' }}>
        🔒 הפרטים שלכם מאובטחים ולא יועברו לצד שלישי.
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
