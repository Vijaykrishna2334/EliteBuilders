# Database Setup Instructions

## Prerequisites
- Supabase account (https://supabase.com)
- Supabase project created

## Setup Steps

### 1. Create a Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Wait for the project to be provisioned

### 2. Configure Authentication Providers

#### Google OAuth
1. Go to Authentication > Providers in Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URLs

#### GitHub OAuth
1. Go to Authentication > Providers in Supabase dashboard
2. Enable GitHub provider
3. Create a GitHub OAuth App at https://github.com/settings/developers
4. Add callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
5. Add Client ID and Client Secret to Supabase

### 3. Run Database Migrations
1. Copy the content of `migrations/001_initial_schema.sql`
2. Go to SQL Editor in Supabase dashboard
3. Paste and run the migration script

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in the Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings > API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY`: Found in Project Settings > API (keep secret!)

### 5. Verify Setup
- Check that all tables are created in Table Editor
- Test authentication by signing up
- Verify profile is automatically created on signup

## Database Schema Overview

- `profiles`: User profiles (extends auth.users)
- `challenges`: Challenge definitions
- `challenge_participants`: Tracks who started which challenge
- `submissions`: MVP submissions (repo, deck, video)
- `scores`: LLM evaluation results
- `reports`: Moderation reports
- `leaderboard` (view): Ranked submissions per challenge

## Security
- Row Level Security (RLS) is enabled on all tables
- Public read access for challenges, submissions, scores, and leaderboard
- Users can only modify their own data
- Service role key should only be used in server-side code
