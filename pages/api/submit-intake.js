import { supabaseAdmin } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;

  if (!payload?.p1Name || !payload?.p2Name || !payload?.marriageDate) {
    return res.status(400).json({ error: 'Missing required fields' });
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
