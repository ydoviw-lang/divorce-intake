import { useState } from 'react';
import Link from 'next/link';
import { T } from '../lib/i18n';

export default function Home() {
  const [lang, setLang] = useState('en');
  const t = T[lang];

  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <div className="masthead">
        <div>
          <h1>{t.homeTitle}</h1>
          <div className="sub">{t.homeSub}</div>
        </div>
        <div>
          <button className="nav" onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
      </div>

      <div className="sheet" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 15, lineHeight: 1.7 }}>{t.introP1}</p>
        <p style={{ fontSize: 15, lineHeight: 1.7 }}>{t.introP2}</p>
      </div>

      <div className="sheet" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginTop: 0 }}>{t.howItWorks}</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div><b>{t.step1Title}</b><p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>{t.step1Body}</p></div>
          <div><b>{t.step2Title}</b><p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>{t.step2Body}</p></div>
          <div><b>{t.step3Title}</b><p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>{t.step3Body}</p></div>
          <div><b>{t.step4Title}</b><p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>{t.step4Body}</p></div>
        </div>
      </div>

      <div className="sheet" style={{ marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginTop: 0 }}>{t.pricing}</h2>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 42, fontWeight: 600, color: 'var(--accent)' }}>$835</div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>{t.priceFlat}</p>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, maxWidth: 460, margin: '10px auto 0' }}>{t.priceNote}</p>
      </div>

      <div className="sheet" style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: 18 }}>{t.readyToBegin}</p>
        <Link href={`/intake?lang=${lang}`}><button className="nav primary">{t.startIntake}</button></Link>
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>{t.disclaimer}</p>
    </div>
  );
}
