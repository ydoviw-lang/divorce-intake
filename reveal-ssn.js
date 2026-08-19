import { supabaseAdmin } from '../../../../lib/supabaseClient';
import { isAuthedRequest } from '../../../../lib/auth';
import { decryptField } from '../../../../lib/crypto';

export default async function handler(req, res) {
  if (!isAuthedRequest(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileNo } = req.query;
  const { spouse } = req.body; // 'p1' or 'p2'

  const { data: rows, error } = await supabaseAdmin
    .from('packets')
    .select('data')
    .eq('file_no', fileNo)
    .single();

  if (error || !rows) {
    return res.status(404).json({ error: 'Packet not found' });
  }

  const encrypted = spouse === 'p2' ? rows.data.p2SSNEncrypted : rows.data.p1SSNEncrypted;
  if (!encrypted) {
    return res.status(404).json({ error: 'No SSN on file for this spouse' });
  }

  return res.status(200).json({ ssn: decryptField(encrypted) });
}
