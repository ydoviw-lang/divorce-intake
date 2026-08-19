import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { T, optLabel } from '../lib/i18n';

const EMPTY = {
  residency: '',
  p1Name: '', p1MaidenName: '', p1DOB: '', p1SSN: '', p1Address: '', p1Email: '',
  p2Name: '', p2MaidenName: '', p2DOB: '', p2SSN: '', p2Address: '', p2Email: '',
  marriageDate: '', marriagePlace: '', hasChildren: '', children: [],
  hasProperty: '', propertyNotes: '', hasDebts: '', debtNotes: '',
  maintenance: '', maintenanceNotes: '', nameChange: '', newName: ''
};

function Pills({ value, onChange, options, lang }) {
  return (
    <div className="radio-group">
      {options.map(o => (
        <div key={o} className={`radio-pill ${value === o ? 'selected' : ''}`}
          onClick={() => onChange(o)}>{optLabel(o, lang)}</div>
      ))}
    </div>
  );
}

export default function Intake() {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  useEffect(() => {
    if (router.query.lang === 'es') setLang('es');
  }, [router.query.lang]);
  const t = T[lang];

  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const addChild = () => setData(d => ({ ...d, children: [...d.children, { name: '', dob: '', custody: '' }] }));
  const updateChild = (i, key, val) => setData(d => {
    const children = [...d.children];
    children[i] = { ...children[i], [key]: val };
    return { ...d, children };
  });
  const removeChild = (i) => setData(d => ({ ...d, children: d.children.filter((_, idx) => idx !== i) }));

  const canAdvance = () => {
    if (step === 0) return !!data.residency;
    if (step === 1) return data.p1Name && data.p2Name && data.marriageDate && data.p1DOB && data.p2DOB && data.p1SSN && data.p2SSN;
    if (step === 2) return !!data.hasChildren;
    if (step === 3) return data.hasProperty && data.hasDebts && data.maintenance;
    if (step === 4) return !!data.nameChange;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setResult(json.fileNo);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="wrap">
        <div className="sheet" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif' }}>{t.fileReceivedTitle}</h2>
          <p style={{ color: 'var(--ink-soft)' }}>{t.fileReceivedBody} <b>{result}</b>. {t.fileReceivedBody2}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="masthead">
        <div>
          <h1>{t.intakeTitle}</h1>
          <div className="sub">{t.homeSub}</div>
        </div>
        <div>
          <button className="nav" onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {t.steps.map((s, i) => (
          <div key={s} style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '6px 10px',
            border: '1px solid var(--line)', background: i === step ? 'var(--white)' : 'var(--paper-deep)',
            fontWeight: i === step ? 600 : 400
          }}>{i + 1}. {s}</div>
        ))}
      </div>

      <div className="sheet">
        {step === 0 && (
          <>
            <div className="field">
              <label>{t.residencyLabel}</label>
              <Pills lang={lang} value={data.residency} onChange={v => set('residency', v)}
                options={['Both spouses live in NY', 'One spouse has lived in NY 1+ year', 'One spouse has lived in NY 2+ years', 'Not sure']} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: -14, marginBottom: 20 }}>{t.ssnNotice}</p>
            <div className="row2">
              <div className="field"><label>{t.plaintiffName}</label>
                <input value={data.p1Name} onChange={e => set('p1Name', e.target.value)} /></div>
              <div className="field"><label>{t.defendantName}</label>
                <input value={data.p2Name} onChange={e => set('p2Name', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t.plaintiffMaiden} <span style={{fontWeight:400,color:'var(--ink-soft)'}}>{t.ifApplicable}</span></label>
                <input value={data.p1MaidenName} onChange={e => set('p1MaidenName', e.target.value)} /></div>
              <div className="field"><label>{t.defendantMaiden} <span style={{fontWeight:400,color:'var(--ink-soft)'}}>{t.ifApplicable}</span></label>
                <input value={data.p2MaidenName} onChange={e => set('p2MaidenName', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t.plaintiffDOB}</label>
                <input type="date" value={data.p1DOB} onChange={e => set('p1DOB', e.target.value)} /></div>
              <div className="field"><label>{t.defendantDOB}</label>
                <input type="date" value={data.p2DOB} onChange={e => set('p2DOB', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t.plaintiffSSN}</label>
                <input value={data.p1SSN} onChange={e => set('p1SSN', e.target.value)} placeholder="XXX-XX-XXXX" /></div>
              <div className="field"><label>{t.defendantSSN}</label>
                <input value={data.p2SSN} onChange={e => set('p2SSN', e.target.value)} placeholder="XXX-XX-XXXX" /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t.plaintiffAddress}</label>
                <input value={data.p1Address} onChange={e => set('p1Address', e.target.value)} /></div>
              <div className="field"><label>{t.defendantAddress}</label>
                <input value={data.p2Address} onChange={e => set('p2Address', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t.plaintiffEmail}</label>
                <input type="email" value={data.p1Email} onChange={e => set('p1Email', e.target.value)} /></div>
              <div className="field"><label>{t.defendantEmail}</label>
                <input type="email" value={data.p2Email} onChange={e => set('p2Email', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{t.marriageDate}</label>
                <input type="date" value={data.marriageDate} onChange={e => set('marriageDate', e.target.value)} /></div>
              <div className="field"><label>{t.marriagePlace}</label>
                <input value={data.marriagePlace} onChange={e => set('marriagePlace', e.target.value)} /></div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <label>{t.childrenQ}</label>
              <Pills lang={lang} value={data.hasChildren} onChange={v => set('hasChildren', v)} options={['Yes', 'No']} />
            </div>
            {data.hasChildren === 'Yes' && (
              <>
                {data.children.map((c, i) => (
                  <div key={i} style={{ border: '1px dashed var(--line)', padding: 16, marginBottom: 14 }}>
                    <div className="row2">
                      <div className="field"><label>{t.childName}</label>
                        <input value={c.name} onChange={e => updateChild(i, 'name', e.target.value)} /></div>
                      <div className="field"><label>{t.childDOB}</label>
                        <input type="date" value={c.dob} onChange={e => updateChild(i, 'dob', e.target.value)} /></div>
                    </div>
                    <div className="field"><label>{t.custodyLabel}</label>
                      <textarea value={c.custody} onChange={e => updateChild(i, 'custody', e.target.value)} /></div>
                    <button className="nav" onClick={() => removeChild(i)}>{t.removeChild}</button>
                  </div>
                ))}
                <button className="nav" onClick={addChild}>{t.addChild}</button>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="field"><label>{t.hasPropertyQ}</label>
              <Pills lang={lang} value={data.hasProperty} onChange={v => set('hasProperty', v)} options={['Yes', 'No']} /></div>
            {data.hasProperty === 'Yes' && <div className="field"><label>{t.propertyDescribe}</label>
              <textarea value={data.propertyNotes} onChange={e => set('propertyNotes', e.target.value)} /></div>}

            <div className="field"><label>{t.hasDebtsQ}</label>
              <Pills lang={lang} value={data.hasDebts} onChange={v => set('hasDebts', v)} options={['Yes', 'No']} /></div>
            {data.hasDebts === 'Yes' && <div className="field"><label>{t.debtsDescribe}</label>
              <textarea value={data.debtNotes} onChange={e => set('debtNotes', e.target.value)} /></div>}

            <div className="field"><label>{t.maintenanceQ}</label>
              <Pills lang={lang} value={data.maintenance} onChange={v => set('maintenance', v)} options={['Yes', 'No']} /></div>
            {data.maintenance === 'Yes' && <div className="field"><label>{t.maintenanceAmount}</label>
              <input value={data.maintenanceNotes} onChange={e => set('maintenanceNotes', e.target.value)} /></div>}
          </>
        )}

        {step === 4 && (
          <>
            <div className="field"><label>{t.nameChangeQ}</label>
              <Pills lang={lang} value={data.nameChange} onChange={v => set('nameChange', v)} options={['Yes', 'No']} /></div>
            {data.nameChange === 'Yes' && <div className="field"><label>{t.newNameLabel}</label>
              <input value={data.newName} onChange={e => set('newName', e.target.value)} /></div>}
          </>
        )}

        {step === 5 && (
          <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            <p><b>{data.p1Name}</b> & <b>{data.p2Name}</b> — {t.reviewMarried} {data.marriageDate} {t.reviewIn} {data.marriagePlace}</p>
            <p>{t.reviewDOBLine}: {data.p1DOB} / {data.p2DOB} · {t.reviewSSNLine}: {data.p1SSN ? '••••' + data.p1SSN.slice(-4) : '—'} / {data.p2SSN ? '••••' + data.p2SSN.slice(-4) : '—'}</p>
            <p>{t.reviewResidency}: {optLabel(data.residency, lang)}</p>
            <p>{t.reviewChildren}: {optLabel(data.hasChildren, lang)}{data.children.length > 0 && ` (${data.children.length})`}</p>
            <p>{t.reviewProperty}: {optLabel(data.hasProperty, lang)} · {t.reviewDebts}: {optLabel(data.hasDebts, lang)} · {t.reviewMaintenance}: {optLabel(data.maintenance, lang)}</p>
            <p>{t.reviewNameChange}: {optLabel(data.nameChange, lang)}{data.newName && ` → ${data.newName}`}</p>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
          <button className="nav" disabled={step === 0} onClick={() => setStep(s => s - 1)}>{t.back}</button>
          {step < t.steps.length - 1
            ? <button className="nav primary" disabled={!canAdvance()}
