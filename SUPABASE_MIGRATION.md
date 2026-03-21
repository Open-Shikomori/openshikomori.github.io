# Supabase Migration Guide

This project has been migrated from Firebase to Supabase for better free tier limits and PostgreSQL database.

## Key Changes

### Environment Variables

**Before (Firebase):**
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

**After (Supabase):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
VITE_R2_WORKER_URL=https://your-worker.workers.dev
```

### Anonymous Auth

Supabase anonymous auth uses the `authenticated` role (not `anonymous` role). The JWT contains an `is_anonymous` claim to distinguish anonymous from permanent users.

### Free Tier Comparison

| Feature | Firebase Free | Supabase Free |
|---------|--------------|---------------|
| Auth Users | Unlimited | Unlimited |
| Database | Firestore (1GB) | PostgreSQL (500MB) |
| Bandwidth | 10GB/month | 2GB/month |
| Storage | 1GB | 1GB |
| Egress Fees | Yes | No |

## Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "openshikomori"
4. Choose region closest to your users
5. Wait for database to provision

### 2. Enable Anonymous Auth

1. In your Supabase Dashboard, go to **Authentication > Providers**
2. Find "Anonymous" and click **Enable**
3. Save settings

### 3. Run Database Setup

1. Go to **SQL Editor > New Query**
2. Copy contents of `supabase-setup.sql` from this repo
3. Paste and click **Run**
4. This creates all tables, indexes, functions, and RLS policies

### 4. Get Environment Variables

1. Go to **Project Settings > API**
2. Copy:
   - `URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### 5. Add Yourself as Admin

After first visiting the app (which creates your anonymous user):

1. Go to **Table Editor > admin_config**
2. Click **Insert Row**
3. Add your `user_id` (find it in browser console or auth.users table)

### 6. Update .env

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_R2_WORKER_URL=https://your-worker.workers.dev
```

### 7. Install Dependencies

```bash
bun install
```

### 8. Test

```bash
bun run dev
```

Visit `/contribute` and verify:
- Anonymous auth works (no login required)
- Recording and transcription work
- Data appears in Supabase tables

## Database Schema

### users
Extends `auth.users` with contribution metadata.

### clips
Audio recordings with transcription and review status.

### corrections
Suggested transcription corrections pending review.

### admin_config
List of admin user IDs for moderation access.

## Row Level Security (RLS)

All tables have RLS enabled:

- Users can only read/write their own data
- Approved clips are publicly readable
- Only admins can review corrections
- Anonymous users have same access as authenticated (per Supabase design)

## Troubleshooting

### "Anonymous provider is not enabled"
Enable it in Authentication > Providers > Anonymous.

### "new row violates row-level security policy"
Check that your RLS policies match the SQL setup script.

### Auth not persisting
Supabase stores session in localStorage by default. Check browser DevTools > Application > Local Storage.

### Can't access admin pages
Add your user_id to the `admin_config` table.

## Migration from Firebase (if you had data)

Export from Firebase:
```bash
firebase firestore:export --project your-project
```

Import to Supabase using the [Supabase Import Tool](https://supabase.com/docs/guides/database/import-data) or write a migration script.

## Resources

- [Supabase JavaScript Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Anonymous Auth Guide](https://supabase.com/docs/guides/auth/auth-anonymous)
- [RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security)
