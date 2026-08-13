import { supabaseAdmin } from '../../../lib/supabaseClient';
import { isAuthedRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!isAuthedRequest(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, error } = await supabaseAdmin
    .from('packets')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not load packets' });
  }

  return res.status(200).json({ packets: data });
}
