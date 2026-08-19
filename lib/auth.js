// Minimal single-admin auth. Good enough for one reviewer (you) logging into
// /dashboard. If you later add staff who each need their own login, swap
// this for Supabase Auth (email/password per user) instead.

export function isAuthedRequest(req) {
  const cookie = req.cookies?.admin_session;
  return !!cookie && cookie === process.env.ADMIN_PASSWORD;
}

export const SESSION_COOKIE_OPTS =
  'HttpOnly; Path=/; Max-Age=604800; SameSite=Lax' +
  (process.env.NODE_ENV === 'production' ? '; Secure' : '');
