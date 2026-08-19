import { supabaseAdmin } from '../../lib/supabaseClient';
import { encryptField, last4 } from '../../lib/crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = { ...req.body };

  if (!payload?.p1Name || !payload?.p2Name || !payload?.marriageDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // SSNs are encrypted before they ever touch the database. Only a masked
  // last-4 is kept in plain form, for display in the review queue. The
  // encrypted value is never sent back to the browser except via the
  // dedicated reveal endpoint.
  if (payload.p1SSN) {
    payload.p1SSNLast4 = last4(payload.p1SSN);
    payload.p1SSNEncrypted = encryptField(payload.p1SSN);
    delete payload.p1SSN;
  }
  if (payload.p2SSN) {
    payload.p2SSNLast4 = last4(payload.p2SSN);
    payload.p2SSNEncrypted = encryptField(payload.p2SSN);
    delete payload.p2SSN;
  }

  const fileNo = `NY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error } = await supabaseAdmin.from('packets').insert({
    file_no: fileNo,
    status: 'pending',
    review_notes: '',
    data: payload
  });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not save your submission. Please try again.' });
  }

  return res.status(200).json({ fileNo });
}
