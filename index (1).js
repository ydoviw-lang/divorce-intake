import Link from 'next/link';

export default function Home() {
  return (
    <div className="wrap">
      <div className="masthead">
        <div>
          <h1>NY Uncontested Divorce — Document Prep</h1>
          <div className="sub">New York State · Domestic Relations Law §170(7)</div>
        </div>
      </div>
      <div className="sheet">
        <p>Start your intake to begin the document preparation process.</p>
        <Link href="/intake"><button className="nav primary">Start intake →</button></Link>
      </div>
    </div>
  );
}
