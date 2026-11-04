# Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Enter project name: `brando`
5. Set a database password (save it somewhere safe)
6. Choose region closest to you
7. Click "Create new project" (takes ~2 minutes)

### 2. Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste your keys:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### 4. Create Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql`
4. Paste and click "Run"
5. You should see success messages for each statement

### 5. Enable Email Auth (Optional)
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if needed

### 6. Test It
1. Restart your dev server: `npm run dev`
2. Go to http://localhost:3002/login
3. Sign up with your email
4. Create a project — it should persist!

## What You Get

✅ **Authentication** — Email/password login, secure sessions  
✅ **Database** — PostgreSQL with automatic backups  
✅ **Row Level Security** — Users can only access their own projects  
✅ **Real-time** — (Future) Live collaboration features  
✅ **Free Tier** — 500MB database, unlimited API requests  

## Troubleshooting

**"Failed to load projects" error?**
- Check your `.env.local` file has the correct keys
- Make sure you ran the SQL schema
- Check browser console for detailed errors

**Can't sign up?**
- Verify Email provider is enabled in Supabase dashboard
- Check spam folder for confirmation email (if email confirmation is required)

**Projects not saving?**
- Check browser network tab for API errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (needed for API routes)

## Next Steps

- Add OAuth providers (Google, GitHub) in Supabase dashboard
- Customize email templates
- Set up database backups
- Add more tables for assets, team collaboration, etc.
