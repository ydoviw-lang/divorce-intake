import { buffer } from 'micro';
import { supabaseAdmin } from '../../lib/supabaseClient';
import { stripe } from '../../lib/stripe';

// Stripe requires the raw, unparsed request body to verify the webhook
// signature, so Next.js's automatic body parsing is turned off here.
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const fileNo = session.metadata?.fileNo;

    if (fileNo) {
      const { data: row } = await supabaseAdmin.from('packets').select('data').eq('file_no', fileNo).single();
      if (row) {
        const updatedData = { ...row.data, paymentStatus: 'paid', paidAt: new Date().toISOString() };
        await supabaseAdmin.from('packets').update({ data: updatedData }).eq('file_no', fileNo);
      }
    }
  }

  return res.status(200).json({ received: true });
}
