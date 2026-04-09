# Security Setup — RLS + Edge Function

## Overview
PIN validation is handled server-side via a Supabase Edge Function.
The buildings table (and all others) are locked down with RLS so no
anonymous user can query them directly.

---

## Step 1 — Run the RLS Migration

In the Supabase dashboard → SQL Editor, run:

```
guidelines/migrations/007_rls_security.sql
```

This enables RLS on all tables and sets up policies so:
- `profile`, `buildings`, `building_apartment_sizes`, `member` — authenticated admins only
- `stop_types`, `miscellaneous_items`, `room_sizes` — anon read (active records only)

---

## Step 2 — Deploy the Edge Function

### Install Supabase CLI (if not already installed)
```bash
brew install supabase/tap/supabase
```

### Login and link your project
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```
Your project ref is in Supabase dashboard → Settings → General.

### Deploy the function
```bash
supabase functions deploy validate-pin --no-verify-jwt
```

The `--no-verify-jwt` flag allows the function to be called without a
logged-in user (the booking form is public-facing).

---

## Step 3 — Verify Environment Variables

The Edge Function reads these automatically from Supabase's runtime:
- `SUPABASE_URL` — set automatically
- `SUPABASE_SERVICE_ROLE_KEY` — set automatically

No manual secret configuration needed for these.

---

## Step 4 — Test It

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/validate-pin \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"pin": "1234"}'
```

Expected responses:
- Valid PIN:   `200 { "building_id": "...", "payee_id": "..." }`
- Invalid PIN: `401 { "error": "Invalid PIN" }`

---

## What's Protected After Setup

| Table | Anon Access | Admin Access |
|---|---|---|
| profile | None | Full |
| buildings | None (via Edge Function only) | Full |
| building_apartment_sizes | None | Full |
| member | None | Full |
| stop_types | Read (active only) | Full |
| miscellaneous_items | Read (active only) | Full |
| room_sizes | Read | Full |

---

## Admin Auth (Future)
Currently admins access `/admin` and `/profile` routes without login.
Next step is to add Supabase Auth (email/password) so that authenticated
sessions are required for the admin and enrollment pages, and RLS policies
can verify `auth.uid()`.
