# NY Uncontested Divorce — Intake & Review Backend

A real, working backend: clients fill out `/intake`, submissions save to a
database, and you review them at `/dashboard` (password-protected).

## What's here
- `/intake` — the client-facing intake wizard
- `/dashboard` — your review queue (requires login)
- `/login` — reviewer login
- `/api/*` — the backend: saves submissions, lists packets, updates status

## One-time setup (~15 minutes)

### 1. Create a Supabase project (the database)
1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Pick any name/region, set a database password (save it somewhere — you won't need it again for this app, but keep it).
3. Once it's ready, go to **SQL Editor** → **New query**, paste in the contents of `supabase-schema.sql` from this project, and click **Run**. This creates the table that stores every submitted packet.
4. Go to **Project Settings → API**. You'll need two values from this page in step 3 below: the **Project URL** and the **service_role** key (NOT the anon/public key — the service role key, which is kept secret).

### 2. Put the code on GitHub
1. Go to https://github.com and sign up if you don't have an account.
2. Create a new repository (any name, e.g. `divorce-intake`).
3. Upload this entire project folder to that repository (GitHub's web uploader works fine for this — drag the folder contents in, or use `git push` if you're comfortable with git).

### 3. Deploy on Vercel (hosting)
1. Go to https://vercel.com and sign up using your GitHub account — this lets Vercel see your repositories.
2. Click **Add New → Project**, and select the repository you just created.
3. Before clicking deploy, open **Environment Variables** and add:
   - `SUPABASE_URL` → the Project URL from step 1.4
   - `SUPABASE_SERVICE_ROLE_KEY` → the service_role key from step 1.4
   - `ADMIN_PASSWORD` → a strong password you'll use to log into `/dashboard`
4. Click **Deploy**. In about a minute, Vercel gives you a live URL like `your-project.vercel.app`.

That's it — your intake form and dashboard are now live on the internet,
backed by a real database. Send clients to `your-project.vercel.app/intake`.
You log in at `your-project.vercel.app/dashboard`.

## Updating an already-deployed app (payment collection)
This version adds a **"Request payment"** button, available once a packet
is approved. Clicking it creates a secure Stripe payment link and shows it
to you, along with a pre-filled email draft to send it to the client. Once
they pay, Stripe notifies the app automatically and the packet is marked
"Paid."

### Setting up Stripe (~10 minutes)
1. Go to https://stripe.com and sign up (free to create an account; Stripe
   takes a small percentage only when a payment actually goes through).
2. In the Stripe Dashboard, go to **Developers → API keys**. Copy the
   **Secret key** (starts with `sk_test_...` while you're testing, or
   `sk_live_...` once you're ready for real payments).
3. Decide what you'll charge per case, in cents (e.g. $600.00 = `60000`).
4. In Vercel, add three new environment variables:
   - `STRIPE_SECRET_KEY` → the secret key from step 2
   - `SERVICE_PRICE_CENTS` → your price in cents from step 3
   - `STRIPE_WEBHOOK_SECRET` → see the next step
5. **Set up the webhook** (this is what tells your app a payment succeeded):
   in Stripe, go to **Developers → Webhooks → Add endpoint**. For the
   endpoint URL, use `https://your-vercel-domain.vercel.app/api/stripe-webhook`
   (use your actual domain). For the event to listen to, select
   `checkout.session.completed`. After creating it, Stripe shows a
   **Signing secret** (starts with `whsec_...`) — copy that into the
   `STRIPE_WEBHOOK_SECRET` variable in Vercel.
6. Push the updated code to GitHub the same way as before, and Vercel will
   redeploy with the new code and variables.

### Testing before going live
Stripe starts you in **test mode** — payments made with test mode's fake
card numbers (like `4242 4242 4242 4242`, any future expiry, any CVC) don't
charge anyone real money, which is a safe way to confirm the whole flow
works before you switch to live payments. When you're ready to accept real
money, toggle to **Live mode** in Stripe, generate a new live secret key
and live webhook, and update the same two Vercel variables with the live
values.

## Updating an already-deployed app (adding SSN/DOB fields)
This version adds date of birth, Social Security Number, maiden name, and
email for both spouses — required for NY's Certificate of Dissolution.
SSNs are encrypted before they're ever saved to the database.

If you already deployed an earlier version, here's how to update it:

1. **Add a new environment variable in Vercel:** go to your project →
   Settings → Environment Variables → Add New:
   - Key: `SSN_ENCRYPTION_KEY`
   - Value: `bbad42c321c56dc78aadcbfc746839ad89819e300ff581e6db41315702712c85`
   (This was randomly generated for you. Keep it exactly as-is — if you ever
   need to regenerate it, any previously-submitted SSNs encrypted with the
   old key won't be able to be decrypted anymore, so don't change it once
   real client data is stored.)
2. **Push the updated code to GitHub:** go to your repository, click
   **Add file → Upload files**, and drag in this entire updated project
   folder. GitHub will update the changed files and add the new ones.
3. Vercel will automatically redeploy when it sees the new commit. Wait
   for the deploy to finish, then test `/intake` again to confirm the new
   fields appear, and check `/dashboard` to confirm the "Reveal" button
   next to SSN works.

## A note on security & compliance
This handles genuinely sensitive information — names, addresses, custody
details, finances. This build gives you:
- Encrypted connections (Vercel and Supabase are both HTTPS by default)
- A locked-down database (row-level security enabled, only your server can
  read/write it — never the browser directly)
- A password-protected dashboard with an HTTP-only session cookie

Before taking on real clients, it's worth having someone review this against
whatever NY rules apply to non-attorney document preparers, and considering
whether you want stronger admin auth (e.g. multi-factor) if more than one
person will review packets. This is a solid technical foundation, not a
substitute for that check.

## Local development (optional)
If you want to run this on your own computer before deploying:
```
npm install
cp .env.example .env.local   # fill in your real values
npm run dev
```
Then visit http://localhost:3000/intake and http://localhost:3000/dashboard.
