import Link from 'next/link';

export default function Home() {
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <div className="masthead">
        <div>
          <h1>NY Uncontested Divorce — Document Preparation</h1>
          <div className="sub">New York State · Domestic Relations Law §170(7)</div>
        </div>
      </div>

      <div className="sheet" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 15, lineHeight: 1.7 }}>
          If you and your spouse agree on the terms of your divorce, you don't need
          to hire a lawyer to handle the paperwork. I prepare and file uncontested
          divorce cases for New York residents — start to finish, entirely online.
          You'll never need to come into an office or meet in person.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.7 }}>
          I spent years drafting, mailing, and filing this exact paperwork while
          working directly for a divorce attorney — the only difference here is
          that I handle it independently for uncontested cases, at a fraction of
          the cost of hiring a lawyer.
        </p>
      </div>

      <div className="sheet" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginTop: 0 }}>How it works</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <b>1. Complete your intake</b>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              Answer a guided set of questions about your marriage, any children,
              and how you and your spouse have agreed to handle property and support.
            </p>
          </div>
          <div>
            <b>2. I review your case personally</b>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              Every packet is checked by hand before anything moves forward —
              nothing here is fully automated.
            </p>
          </div>
          <div>
            <b>3. Documents are prepared</b>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              Your court paperwork is drafted based on your answers.
            </p>
          </div>
          <div>
            <b>4. I file with the court on your behalf</b>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              Once everything is signed, I handle filing directly with the court,
              under your name.
            </p>
          </div>
        </div>
      </div>

      <div className="sheet" style={{ marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginTop: 0 }}>Pricing</h2>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 42, fontWeight: 600, color: 'var(--accent)' }}>$835</div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>
          Flat fee, includes New York State court filing fees.
        </p>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, maxWidth: 460, margin: '10px auto 0' }}>
          Covers document preparation and filing with the court on your behalf.
          Payment is only collected after your case has been reviewed and approved —
          not upfront.
        </p>
      </div>

      <div className="sheet" style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: 18 }}>Ready to begin?</p>
        <Link href="/intake"><button className="nav primary">Start your intake →</button></Link>
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
        This service prepares and files documents based on information you provide.
        It does not offer legal advice, and does not represent you as an attorney would.
      </p>
    </div>
  );
}
