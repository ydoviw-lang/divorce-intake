import { useState } from 'react';

const STEPS = ['Eligibility', 'Spouses & Marriage', 'Children', 'Property & Support', 'Name Change', 'Review'];

const EMPTY = {
  residency: '',
  p1Name: '', p1MaidenName: '', p1DOB: '', p1SSN: '', p1Address: '', p1Email: '',
  p2Name: '', p2MaidenName: '', p2DOB: '', p2SSN: '', p2Address: '', p2Email: '',
  marriageDate: '', marriagePlace: '', hasChildren: '', children: [],
  hasProperty: '', propertyNotes: '', hasDebts: '', debtNotes: '',
  maintenance: '', maintenanceNotes: '', nameChange: '', newName: ''
};

function Pills({ value, onChange, options }) {
  return (
    <div className="radio-group">
      {options.map(o => (
        <div key={o} className={`radio-pill ${value === o ? 'selected' : ''}`}
          onClick={() => onChange(o)}>{o}</div>
      ))}
    </div>
  );
}

export default function Intake() {
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
          <h2 style={{ fontFamily: 'Fraunces, serif' }}>Packet received for review</h2>
          <p style={{ color: 'var(--ink-soft)' }}>Your file number is <b>{result}</b>. You'll hear back once your documents have been reviewed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="masthead">
        <div>
          <h1>Uncontested Divorce — Client Intake</h1>
          <div className="sub">New York State · Domestic Relations Law §170(7)</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
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
              <label>Residency situation</label>
              <Pills value={data.residency} onChange={v => set('residency', v)}
                options={['Both spouses live in NY', 'One spouse has lived in NY 1+ year', 'One spouse has lived in NY 2+ years', 'Not sure']} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: -14, marginBottom: 20 }}>
              Date of birth and Social Security Number are required by NY courts for the Certificate of Dissolution. Your SSN is encrypted the moment you submit this form.
            </p>
            <div className="row2">
              <div className="field"><label>Plaintiff full legal name</label>
                <input value={data.p1Name} onChange={e => set('p1Name', e.target.value)} /></div>
              <div className="field"><label>Defendant full legal name</label>
                <input value={data.p2Name} onChange={e => set('p2Name', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Plaintiff maiden name <span style={{fontWeight:400,color:'var(--ink-soft)'}}>(if applicable)</span></label>
                <input value={data.p1MaidenName} onChange={e => set('p1MaidenName', e.target.value)} /></div>
              <div className="field"><label>Defendant maiden name <span style={{fontWeight:400,color:'var(--ink-soft)'}}>(if applicable)</span></label>
                <input value={data.p2MaidenName} onChange={e => set('p2MaidenName', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Plaintiff date of birth</label>
                <input type="date" value={data.p1DOB} onChange={e => set('p1DOB', e.target.value)} /></div>
              <div className="field"><label>Defendant date of birth</label>
                <input type="date" value={data.p2DOB} onChange={e => set('p2DOB', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Plaintiff Social Security Number</label>
                <input value={data.p1SSN} onChange={e => set('p1SSN', e.target.value)} placeholder="XXX-XX-XXXX" /></div>
              <div className="field"><label>Defendant Social Security Number</label>
                <input value={data.p2SSN} onChange={e => set('p2SSN', e.target.value)} placeholder="XXX-XX-XXXX" /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Plaintiff address</label>
                <input value={data.p1Address} onChange={e => set('p1Address', e.target.value)} /></div>
              <div className="field"><label>Defendant address</label>
                <input value={data.p2Address} onChange={e => set('p2Address', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Plaintiff email address</label>
                <input type="email" value={data.p1Email} onChange={e => set('p1Email', e.target.value)} /></div>
              <div className="field"><label>Defendant email address</label>
                <input type="email" value={data.p2Email} onChange={e => set('p2Email', e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Date of marriage</label>
                <input type="date" value={data.marriageDate} onChange={e => set('marriageDate', e.target.value)} /></div>
              <div className="field"><label>Place of marriage (city, state)</label>
                <input value={data.marriagePlace} onChange={e => set('marriagePlace', e.target.value)} /></div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <label>Are there children of this marriage under 21?</label>
              <Pills value={data.hasChildren} onChange={v => set('hasChildren', v)} options={['Yes', 'No']} />
            </div>
            {data.hasChildren === 'Yes' && (
              <>
                {data.children.map((c, i) => (
                  <div key={i} style={{ border: '1px dashed var(--line)', padding: 16, marginBottom: 14 }}>
                    <div className="row2">
                      <div className="field"><label>Child's full name</label>
                        <input value={c.name} onChange={e => updateChild(i, 'name', e.target.value)} /></div>
                      <div className="field"><label>Date of birth</label>
                        <input type="date" value={c.dob} onChange={e => updateChild(i, 'dob', e.target.value)} /></div>
                    </div>
                    <div className="field"><label>Custody & parenting time arrangement</label>
                      <textarea value={c.custody} onChange={e => updateChild(i, 'custody', e.target.value)} /></div>
                    <button className="nav" onClick={() => removeChild(i)}>Remove</button>
                  </div>
                ))}
                <button className="nav" onClick={addChild}>+ Add child</button>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="field"><label>Is there marital property to divide?</label>
              <Pills value={data.hasProperty} onChange={v => set('hasProperty', v)} options={['Yes', 'No']} /></div>
            {data.hasProperty === 'Yes' && <div className="field"><label>Describe the agreed division</label>
              <textarea value={data.propertyNotes} onChange={e => set('propertyNotes', e.target.value)} /></div>}

            <div className="field"><label>Are there shared debts to divide?</label>
              <Pills value={data.hasDebts} onChange={v => set('hasDebts', v)} options={['Yes', 'No']} /></div>
            {data.hasDebts === 'Yes' && <div className="field"><label>Describe the agreed division</label>
              <textarea value={data.debtNotes} onChange={e => set('debtNotes', e.target.value)} /></div>}

            <div className="field"><label>Has either spouse agreed to pay maintenance?</label>
              <Pills value={data.maintenance} onChange={v => set('maintenance', v)} options={['Yes', 'No']} /></div>
            {data.maintenance === 'Yes' && <div className="field"><label>Amount and duration agreed</label>
              <input value={data.maintenanceNotes} onChange={e => set('maintenanceNotes', e.target.value)} /></div>}
          </>
        )}

        {step === 4 && (
          <>
            <div className="field"><label>Would either spouse like to change their name?</label>
              <Pills value={data.nameChange} onChange={v => set('nameChange', v)} options={['Yes', 'No']} /></div>
            {data.nameChange === 'Yes' && <div className="field"><label>Name to resume/change to</label>
              <input value={data.newName} onChange={e => set('newName', e.target.value)} /></div>}
          </>
        )}

        {step === 5 && (
          <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            <p><b>{data.p1Name}</b> & <b>{data.p2Name}</b> — married {data.marriageDate} in {data.marriagePlace}</p>
            <p>DOB: {data.p1DOB} / {data.p2DOB} · SSN on file: {data.p1SSN ? '••••' + data.p1SSN.slice(-4) : '—'} / {data.p2SSN ? '••••' + data.p2SSN.slice(-4) : '—'}</p>
            <p>Residency: {data.residency}</p>
            <p>Children: {data.hasChildren}{data.children.length > 0 && ` (${data.children.length})`}</p>
            <p>Property: {data.hasProperty} · Debts: {data.hasDebts} · Maintenance: {data.maintenance}</p>
            <p>Name change: {data.nameChange}{data.newName && ` → ${data.newName}`}</p>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
          <button className="nav" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Back</button>
          {step < STEPS.length - 1
            ? <button className="nav primary" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}>Continue →</button>
            : <button className="nav primary" disabled={submitting} onClick={submit}>{submitting ? 'Submitting…' : 'Submit for review'}</button>}
        </div>
      </div>
    </div>
  );
}
