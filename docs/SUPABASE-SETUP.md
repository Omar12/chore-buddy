# Supabase Setup Guide

This guide walks you through setting up Supabase for Chore Buddy.

## Table of Contents

- [Create Supabase Project](#create-supabase-project)
- [Run Database Migration](#run-database-migration)
- [Configure Authentication](#configure-authentication)
- [Get API Credentials](#get-api-credentials)
- [Test Your Setup](#test-your-setup)
- [Troubleshooting](#troubleshooting)

## Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `chore-buddy` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 1-2 minutes for project to be ready

## Run Database Migration

### Step 1: Open SQL Editor

1. In your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Run the Migration

1. Open the file: `supabase/migrations/20240101000000_init_schema.sql` in your code editor
2. Copy **ALL** the contents (it's a long file)
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** or press `Ctrl/Cmd + Enter`

You should see: ✅ **Success. No rows returned**

This creates all your tables, indexes, RLS policies, and triggers.

### Step 3: Verify Tables

1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - users
   - families
   - profiles
   - chores
   - chore_comments
   - rewards
   - reward_redemptions
   - points_transactions

If you see all 8 tables, you're good! ✅

## Configure Authentication

### For Development (Disable Email Confirmation)

This allows you to test without checking emails:

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Scroll to **"Email"** section
3. **Disable** "Enable email confirmations"
4. Click **"Save"**

**Important**: Re-enable this in production!

### For Production (Enable Email Confirmation)

1. Go to **Authentication** → **Settings**
2. Enable "Enable email confirmations"
3. Configure **SMTP Settings** (or use Supabase's default):
   - Supabase provides free email sending for development
   - For production, configure your own SMTP (recommended)

### Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-domain.com`
3. Add redirect URLs:
   - `http://localhost:3000/**` (development)
   - `https://your-domain.com/**` (production)

### Email Templates (Optional)

Customize email templates:

1. Go to **Authentication** → **Email Templates**
2. Edit templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Get API Credentials

### Step 1: Find Your Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **API Keys**:
     - `anon` `public` - Safe to use in client (this is what you need)
     - `service_role` - **NEVER** expose to client (backend only)

### Step 2: Add to Your App

**Local Development (.env.local):**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Docker (.env):**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Important**:
- Use the **`anon` `public`** key (not `service_role`)
- Never commit `.env` or `.env.local` to git
- Keep your `service_role` key secret

## Test Your Setup

### Step 1: Start Your App

```bash
# Local
npm run dev

# Docker Dev
npm run docker:dev
```

### Step 2: Try to Register

1. Go to `http://localhost:3000/auth/register`
2. Fill in:
   - Family Name: "Test Family"
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Create Account"

### Step 3: Expected Behavior

**If email confirmation is DISABLED (recommended for dev):**
- ✅ You're redirected to profile selector immediately
- ✅ You can use the app right away

**If email confirmation is ENABLED:**
- 📧 You'll receive a confirmation email
- ⏳ You must click the link in the email before you can sign in
- Check spam folder if you don't see it

### Step 4: Verify in Supabase

1. Go to **Authentication** → **Users** in Supabase
2. You should see your test user listed
3. Check the user's email confirmation status

## Troubleshooting

### Issue: "Invalid API key" or "Failed to fetch"

**Cause**: Wrong Supabase credentials

**Solution**:
1. Double-check your `.env` file
2. Make sure you're using the **`anon` `public`** key (not `service_role`)
3. Verify the URL is correct (no trailing slash)
4. Restart your app after changing `.env`

```bash
# Restart local dev
# Press Ctrl+C, then:
npm run dev

# Restart Docker dev
npm run docker:dev:down
npm run docker:dev
```

### Issue: "Email not confirmed"

**Cause**: Email confirmation is enabled but email wasn't confirmed

**Solutions**:

**Option A: Disable email confirmation (Development)**
1. Go to **Authentication** → **Settings**
2. Disable "Enable email confirmations"
3. Delete the user from **Authentication** → **Users**
4. Register again

**Option B: Confirm the email**
1. Check your email for confirmation link
2. Click the link
3. Try signing in again

**Option C: Manually confirm in Supabase**
1. Go to **Authentication** → **Users**
2. Find your user
3. Click on the user
4. Set "Email Confirmed" to true
5. Click "Update user"

### Issue: "Failed to create family" or "Failed to create profile"

**Cause**: Database migration not run correctly or RLS policies blocking

**Solution**:
1. Check if all tables exist (**Table Editor**)
2. Re-run the migration SQL
3. Check RLS is enabled:
   - Go to **Table Editor**
   - Click each table
   - Look for "RLS enabled" badge
4. Check Supabase logs (**Logs** → **Postgres Logs**)

### Issue: "Row level security policy violation"

**Cause**: User trying to access data they don't have permission for

**Common causes**:
1. User not properly authenticated
2. Family/profile not created correctly
3. RLS policies too restrictive

**Solution**:
1. Check **Authentication** → **Users** - is user authenticated?
2. Check **Table Editor** → **profiles** - does user have a profile?
3. Check **Table Editor** → **families** - does family exist?
4. Review migration file for RLS policy errors

### Issue: Can't sign in after registration

**Check these in order**:

1. **Email confirmation**:
   - Is email confirmation enabled?
   - If yes, did you confirm the email?

2. **User exists**:
   - Go to **Authentication** → **Users**
   - Is the user there?
   - Is email confirmed?

3. **Profile created**:
   - Go to **Table Editor** → **profiles**
   - Do you see a profile for this user?
   - Check the `user_id` matches your user's ID

4. **Credentials correct**:
   - Are you using the right email/password?
   - Is Caps Lock on?

### Issue: "Fetch failed" in Docker

**Cause**: Environment variables not passed to Docker

**Solution**:
1. Check `.env` file exists and has correct values
2. Restart Docker:
   ```bash
   npm run docker:dev:down
   npm run docker:dev
   ```
3. Check logs:
   ```bash
   npm run docker:dev:logs
   ```

## Security Checklist

Before deploying to production:

- [ ] Email confirmation is **enabled**
- [ ] Only using `anon` `public` key in frontend
- [ ] `service_role` key is kept secret (backend only)
- [ ] RLS is enabled on all tables
- [ ] Site URL is set to production domain
- [ ] Redirect URLs include production domain
- [ ] SMTP configured (not using default)
- [ ] 2FA enabled on your Supabase account
- [ ] Database backups configured
- [ ] Regular security reviews scheduled

## Advanced Configuration

### Custom SMTP (Production)

1. Go to **Authentication** → **Settings** → **SMTP**
2. Configure your email service:
   - **SendGrid**
   - **Mailgun**
   - **AWS SES**
   - **Postmark**
   - Custom SMTP server

### Rate Limiting

Configure in **Authentication** → **Rate Limits**:
- Sign ups per hour
- Sign ins per hour
- Password resets per hour

### Password Requirements

Configure in **Authentication** → **Settings**:
- Minimum password length (default: 6)
- Require special characters
- Require numbers
- Require uppercase/lowercase

### OAuth Providers (Future)

Add social login:
1. Go to **Authentication** → **Providers**
2. Enable providers:
   - Google
   - GitHub
   - Facebook
   - Apple
   - Discord
3. Configure OAuth credentials

## Useful Supabase Features

### SQL Editor
- Write custom queries
- Create functions
- Test RLS policies

### Table Editor
- View/edit data directly
- Add rows manually
- Export to CSV

### Logs
- **Postgres Logs**: Database queries and errors
- **Auth Logs**: Sign-in attempts, registration
- **API Logs**: API calls and responses

### Database
- **Backups**: Configure automatic backups
- **Extensions**: Enable Postgres extensions
- **Replication**: Set up replicas (paid plans)

## Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

## Next Steps

After setup is complete:
1. Test registration and login
2. Create a test family and profiles
3. Test creating chores and rewards
4. Review RLS policies for your use case
5. Configure production environment

---

**Setup Complete! 🎉**

You're now ready to develop Chore Buddy with Supabase!
