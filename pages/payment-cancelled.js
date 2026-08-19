import { useRouter } from 'next/router';

export default function PaymentCancelled() {
  const router = useRouter();
  const { fileNo } = router.query;

  return (
    <div className="wrap">
      <div className="sheet" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif' }}>Payment not completed</h2>
        <p style={{ color: 'var(--ink-soft)' }}>
          Your payment for file <b>{fileNo}</b> wasn't completed. No charge was made.
          Please reach out if you'd like a new payment link sent.
        </p>
      </div>
    </div>
  );
}
