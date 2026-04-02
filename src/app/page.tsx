'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const features = [
    { icon: '📋', key: '1' },
    { icon: '🔗', key: '2' },
    { icon: '🤖', key: '3' },
    { icon: '✍️', key: '4' },
    { icon: '📊', key: '5' },
    { icon: '🔒', key: '6' },
  ];

  const stats = [
    { value: '20+', label: t('yearsExperience') },
    { value: '5,000+', label: t('trustedBy') },
    { value: '15', label: t('certifiedAgents') },
    { value: '98%', label: 'שביעות רצון לקוחות' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0a1628, #1e3a6e)',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', height: '72px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🛡️</span>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '20px', lineHeight: '1.2' }}>Assurance</div>
              <div style={{ color: '#c9a227', fontSize: '12px', fontWeight: '600' }}>סוכנות ביטוח דיגיטלית</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#services" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>{t('ourServices')}</a>
            <a href="#about" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>{t('about')}</a>
            <a href="#contact" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '15px' }}>{t('contact')}</a>
            <LanguageSwitcher />
            <Link href="/login" style={{
              background: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)',
              color: 'white', padding: '8px 18px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '600',
            }}>{t('login')}</Link>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
              color: 'white', padding: '8px 18px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '700',
              boxShadow: '0 2px 8px rgba(201,162,39,0.3)',
            }}>{t('register')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1e3a6e 40%, #1a3060 80%, #0f2244 100%)',
        padding: '100px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-100px', insetInlineEnd: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
            borderRadius: '24px', padding: '6px 16px', marginBottom: '24px',
            color: '#d4b44a', fontSize: '13px', fontWeight: '600',
          }}>
            ✨ {t('trustedBy')}
          </div>
          <h1 style={{
            color: 'white', fontSize: 'clamp(32px, 5vw, 60px)',
            fontWeight: '800', marginBottom: '20px', lineHeight: '1.2',
          }}>
            {t('heroTitle')}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(16px, 2vw, 20px)',
            marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.7',
          }}>
            {t('heroSubtitle')}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #c9a227, #a87c1a)',
              color: 'white', padding: '14px 32px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '17px', fontWeight: '700',
              boxShadow: '0 4px 20px rgba(201,162,39,0.4)',
            }}>
              🚀 {t('getStarted')}
            </Link>
            <a href="#services" style={{
              background: 'rgba(255,255,255,0.1)', color: 'white',
              padding: '14px 32px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '17px', fontWeight: '600',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}>
              {t('learnMoreAboutUs')}
            </a>
          </div>

          {/* Israeli services badges */}
          <div style={{ marginTop: '60px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: t('harBituach'), icon: '🏔️' },
              { label: t('harHakesef'), icon: '💰' },
              { label: t('maslakaHapensionit'), icon: '🏦' },
              { label: t('gamalNet'), icon: '💼' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px',
                color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '600',
              }}>
                <span>{s.icon}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a6e, #2451a0)', padding: '48px 40px' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center',
        }}>
          {stats.map(stat => (
            <div key={stat.label}>
              <div style={{ color: '#c9a227', fontSize: '40px', fontWeight: '800', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="services" style={{ padding: '80px 40px', background: '#f5f7fc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a6e', marginBottom: '12px' }}>{t('ourServices')}</h2>
            <p style={{ color: '#6b7a9a', fontSize: '17px' }}>{t('whyChooseUs')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {features.map(f => (
              <div key={f.key} className="card animate-fadeIn" style={{ padding: '32px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(30,58,110,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(10,22,40,0.06)'; }}>
                <div style={{
                  width: '56px', height: '56px', background: 'linear-gradient(135deg, #1e3a6e, #2451a0)',
                  borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', marginBottom: '20px',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#1e3a6e', marginBottom: '10px' }}>{t(`feature${f.key}Title`)}</h3>
                <p style={{ color: '#6b7a9a', lineHeight: '1.6' }}>{t(`feature${f.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Israeli Services Section */}
      <section id="about" style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a6e', marginBottom: '12px' }}>
              שירותי רשות שוק ההון
            </h2>
            <p style={{ color: '#6b7a9a', fontSize: '17px' }}>
              חיבור ישיר למערכות רגולטוריות עם ניתוח AI
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🏔️', title: t('harBituach'), desc: t('harBituachDesc'), color: '#1e3a6e' },
              { icon: '💰', title: t('harHakesef'), desc: t('harHakesefDesc'), color: '#2451a0' },
              { icon: '🏦', title: t('maslakaHapensionit'), desc: t('maslakaDesc'), color: '#1a3060' },
              { icon: '💼', title: t('gamalNet'), desc: t('gamalNetDesc'), color: '#c9a227' },
            ].map(s => (
              <div key={s.title} style={{
                padding: '32px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)`,
                color: 'white', display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <div style={{ fontSize: '40px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #0a1628, #1e3a6e)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ color: 'white', fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>מוכן להתחיל?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px', marginBottom: '32px' }}>
            הצטרף לאלפי לקוחות שכבר נהנים מניהול ביטוח חכם עם AI
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #c9a227, #a87c1a)', color: 'white',
              padding: '14px 36px', borderRadius: '10px', textDecoration: 'none',
              fontSize: '17px', fontWeight: '700', boxShadow: '0 4px 20px rgba(201,162,39,0.4)',
            }}>{t('getStarted')}</Link>
            <Link href="/login" style={{
              background: 'rgba(255,255,255,0.1)', color: 'white',
              padding: '14px 36px', borderRadius: '10px', textDecoration: 'none',
              fontSize: '17px', fontWeight: '600', border: '1.5px solid rgba(255,255,255,0.3)',
            }}>{t('login')}</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ background: '#0a1628', color: 'rgba(255,255,255,0.7)', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px', marginBottom: '40px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>🛡️</span>
                <div>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>Assurance</div>
                  <div style={{ color: '#c9a227', fontSize: '12px' }}>סוכנות ביטוח דיגיטלית</div>
                </div>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.7' }}>{t('footerTagline')}</p>
              <p style={{ fontSize: '12px', marginTop: '12px', color: 'rgba(255,255,255,0.4)' }}>{t('licenseInfo')}</p>
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '16px' }}>{t('footerServices')}</h4>
              {['policies', 'documents', 'marketplace', 'reports', 'esign', 'regulatory'].map(k => (
                <div key={k} style={{ marginBottom: '8px' }}>
                  <Link href={`/dashboard/${k}`} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>{t(k)}</Link>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '16px' }}>{t('footerLegal')}</h4>
              {[t('privacyPolicy'), t('termsOfService'), t('accessibility')].map(k => (
                <div key={k} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>{k}</a>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '16px' }}>{t('contact')}</h4>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>📞 1-700-123-456</div>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>✉️ service@assurance.co.il</div>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>🌐 www.assurance.co.il</div>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>🏢 תל אביב, ישראל</div>
              <div style={{ fontSize: '14px' }}>⏰ א׳-ה׳ 9:00-18:00</div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          }}>
            <span style={{ fontSize: '13px' }}>© {new Date().getFullYear()} Assurance - סוכנות ביטוח דיגיטלית. {t('allRightsReserved')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
