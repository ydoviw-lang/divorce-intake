import { supabaseAdmin } from '../../../../lib/supabaseClient';
import { isAuthedRequest } from '../../../../lib/auth';
import { stripe } from '../../../../lib/stripe';

export default async function handler(req, res) {
  if (!isAuthedRequest(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileNo } = req.query;

  const { data: row, error } = await supabaseAdmin
    .from('packets')
    .select('*')
    .eq('file_no', fileNo)
    .single();

  if (error || !row) {
    return res.status(404).json({ error: 'Packet not found' });
  }
  if (row.status !== 'approved' && row.status !== 'delivered') {
    return res.status(400).json({ error: 'Packet must be approved before requesting payment' });
  }

  const origin = `https://${req.headers.host}`;
  const priceCents = parseInt(process.env.SERVICE_PRICE_CENTS || '0', 10);

  if (!priceCents) {
    return res.status(500).json({ error: 'SERVICE_PRICE_CENTS is not set in your environment variables' });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `NY Uncontested Divorce Document Preparation — ${fileNo}` },
        unit_amount: priceCents,
      },
      quantity: 1,
    }],
    customer_email: row.data.p1Email || undefined,
    metadata: { fileNo },
    success_url: `${origin}/payment-success?fileNo=${fileNo}`,
    cancel_url: `${origin}/payment-cancelled?fileNo=${fileNo}`,
  });

  const updatedData = { ...row.data, paymentStatus: 'unpaid', stripeSessionUrl: session.url, stripeSessionId: session.id };
  await supabaseAdmin.from('packets').update({ data: updatedData }).eq('file_no', fileNo);

  return res.status(200).json({ url: session.url });
}
