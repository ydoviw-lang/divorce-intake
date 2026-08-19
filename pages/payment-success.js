import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const { fileNo } = router.query;

  return (
    <div className="wrap">
      <div className="sheet" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif' }}>Payment received</h2>
        <p style={{ color: 'var(--ink-soft)' }}>
          Thank you — your payment for file <b>{fileNo}</b> has been received.
          Your documents are being finalized and you'll be contacted with next steps shortly.
        </p>
      </div>
    </div>
  );
}
