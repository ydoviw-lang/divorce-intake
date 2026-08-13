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

## Updating an already-deployed app (document generation)
This version adds a **"Generate documents"** button on approved packets in
your dashboard. It downloads a zip containing three of the official NY
uncontested divorce forms (Summons with Notice, Verified Complaint, Sworn
Affirmation of Plaintiff), pre-filled from the client's intake answers,
following the exact structure and legal language of the official forms
published at nycourts.gov (Rev. 3/1/26) — plus a checklist of what still
needs manual confirmation before filing (county, residency basis, military
status, etc.).

No new environment variables are needed for this update — just push the
updated code to GitHub the same way as before (Add file → Upload files),
and Vercel will redeploy automatically.

**Important:** this covers the three documents that *start* a case. The
remaining forms in the full packet (Affirmation of Service, Note of Issue,
Findings of Fact, Judgment of Divorce, Certificate of Dissolution, and the
rest) aren't generated yet — that's the natural next phase of this feature.
Also worth knowing: NY's official forms are plain documents, not fillable
PDFs, so this generates Word documents that reproduce their exact text and
structure rather than "filling in" the court's own PDF — which is the
standard, accurate way this is done in practice.

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
