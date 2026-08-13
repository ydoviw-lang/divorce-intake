import { SESSION_COOKIE_OPTS } from '../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  res.setHeader('Set-Cookie', `admin_session=${password}; ${SESSION_COOKIE_OPTS}`);
  return res.status(200).json({ ok: true });
}
