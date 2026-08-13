import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [packets, setPackets] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({}); // { p1: '123-45-6789', p2: '...' }
  const router = useRouter();

  const revealSSN = async (spouse) => {
    const res = await fetch(`/api/packets/${activeFile}/reveal-ssn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spouse })
    });
    if (res.ok) {
      const json = await res.json();
      setRevealed(r => ({ ...r, [spouse]: json.ssn }));
    }
  };

  const load = async () => {
    const res = await fetch('/api/packets');
    if (res.status === 401) { router.push('/login'); return; }
    const json = await res.json();
    setPackets(json.packets || []);
    if (!activeFile && json.packets?.length) setActiveFile(json.packets[0].file_no);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const active = packets.find(p => p.file_no === activeFile);
  useEffect(() => { setNotes(active?.review_notes || ''); setRevealed({}); }, [activeFile]);

  const setStatus = async (status) => {
    await fetch(`/api/packets/${activeFile}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes: notes })
    });
    load();
  };

  const logout = async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/login'); };

  if (loading) return <div className="wrap">Loading…</div>;

  return (
    <div className="wrap" style={{ maxWidth: 1180 }}>
      <div className="masthead">
        <div>
          <h1>Review Queue</h1>
          <div className="sub">Packets awaiting your review before delivery</div>
        </div>
        <button className="nav" onClick={logout}>Log out</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', border: '1px solid var(--ink)', minHeight: 500 }}>
        <div style={{ background: 'var(--paper-deep)', borderRight: '1px solid var(--ink)', overflowY: 'auto', maxHeight: 700 }}>
          {packets.length === 0 && <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-soft)' }}>No packets submitted yet.</div>}
          {packets.map(p => (
            <div key={p.file_no} onClick={() => setActiveFile(p.file_no)}
              style={{
                padding: '14px 16px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
                background: p.file_no === activeFile ? 'var(--white)' : 'transparent',
                borderLeft: p.file_no === activeFile ? '4px solid var(--accent)' : '4px solid transparent'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--ink-soft)' }}>{p.file_no}</span>
                <span className={`badge ${p.status}`}>{p.status.replace('_', ' ')}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.data.p1Name} & {p.data.p2Name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Submitted {new Date(p.submitted_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--white)', padding: '32px 36px', overflowY: 'auto', maxHeight: 700 }}>
          {!active ? <p style={{ color: 'var(--ink-soft)' }}>Select a packet to review it.</p> : (
            <>
              <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', margin: '0 0 4px' }}>{active.data.p1Name} & {active.data.p2Name}</h2>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--ink-soft)' }}>{active.file_no}</div>
              </div>

              <div style={{ fontSize: 13.5, lineHeight: 1.9 }}>
                <p><b>Plaintiff:</b> {active.data.p1Name}{active.data.p1MaidenName && ` (née ${active.data.p1MaidenName})`} · DOB {active.data.p1DOB} · {active.data.p1Email}
                  <br />SSN: {revealed.p1 ? revealed.p1 : `•••-••-${active.data.p1SSNLast4 || '????'}`}
                  {!revealed.p1 && active.data.p1SSNLast4 && <button className="nav" style={{ marginLeft: 8, padding: '2px 8px', fontSize: 10 }} onClick={() => revealSSN('p1')}>Reveal</button>}
                </p>
                <p><b>Defendant:</b> {active.data.p2Name}{active.data.p2MaidenName && ` (née ${active.data.p2MaidenName})`} · DOB {active.data.p2DOB} · {active.data.p2Email}
                  <br />SSN: {revealed.p2 ? revealed.p2 : `•••-••-${active.data.p2SSNLast4 || '????'}`}
                  {!revealed.p2 && active.data.p2SSNLast4 && <button className="nav" style={{ marginLeft: 8, padding: '2px 8px', fontSize: 10 }} onClick={() => revealSSN('p2')}>Reveal</button>}
                </p>
                <p><b>Residency:</b> {active.data.residency}</p>
                <p><b>Marriage:</b> {active.data.marriageDate} in {active.data.marriagePlace}</p>
                <p><b>Children:</b> {active.data.hasChildren}
                  {active.data.children?.map((c, i) => <span key={i}><br />— {c.name} ({c.dob}): {c.custody}</span>)}
                </p>
                <p><b>Property:</b> {active.data.hasProperty} {active.data.propertyNotes && `— ${active.data.propertyNotes}`}</p>
                <p><b>Debts:</b> {active.data.hasDebts} {active.data.debtNotes && `— ${active.data.debtNotes}`}</p>
                <p><b>Maintenance:</b> {active.data.maintenance} {active.data.maintenanceNotes && `— ${active.data.maintenanceNotes}`}</p>
                <p><b>Name change:</b> {active.data.nameChange} {active.data.newName && `→ ${active.data.newName}`}</p>
              </div>

              <div className="field" style={{ marginTop: 20 }}>
                <label>Reviewer notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="act approve" onClick={() => setStatus('approved')}>Approve for drafting</button>
                <button className="act changes" onClick={() => setStatus('changes_requested')}>Request changes</button>
                <button className="act" onClick={() => setStatus('delivered')} disabled={active.status !== 'approved'}>Mark delivered</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
