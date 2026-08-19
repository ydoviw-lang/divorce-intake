import { supabaseAdmin } from '../../../lib/supabaseClient';
import { isAuthedRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!isAuthedRequest(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileNo } = req.query;
  const { status, reviewNotes } = req.body;

  const { error } = await supabaseAdmin
    .from('packets')
    .update({ status, review_notes: reviewNotes, updated_at: new Date().toISOString() })
    .eq('file_no', fileNo);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not update packet' });
  }

  return res.status(200).json({ ok: true });
}
