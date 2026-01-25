# Email Configuration Guide for Supabase

## Problem
Supabase's default email service is rate-limited and unreliable. Emails may not arrive or go to spam.

## Solution Options

### Option 1: Disable Email Confirmation (Development Only)

**Steps:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `gxtyixmzcrhtzfmixlve`
3. Navigate to: **Authentication → Providers → Email**
4. Scroll down to "Confirm email"
5. **Toggle OFF** the "Confirm email" setting
6. Click "Save"

**Result:** Users can sign in immediately without email verification.

**⚠️ Warning:** This is NOT secure for production. Only use for development/testing.

---

### Option 2: Set Up Custom SMTP with Resend (Recommended)

#### Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up for free account
3. Verify your email address
4. Go to API Keys section
5. Create a new API key
6. Copy the API key (starts with `re_`)

#### Step 2: Configure Resend Domain (Optional but Recommended)

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records provided by Resend to your domain registrar
4. Verify domain

**OR** use Resend's default domain: `onboarding.resend.dev`

#### Step 3: Configure Supabase to Use Resend

1. Go to Supabase Dashboard → Your Project
2. Navigate to: **Project Settings → Authentication**
3. Scroll down to "SMTP Settings"
4. Click "Enable Custom SMTP"
5. Fill in the following:

```
SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP Username: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@yourdomain.com (or onboarding@resend.dev)
Sender Name: Your App Name
```

6. Click "Save"

#### Step 4: Test Email Delivery

1. Go to your sign-up page
2. Create a new test account
3. Check email inbox (should arrive within seconds)

---

### Option 3: Alternative SMTP Providers

#### SendGrid

1. Sign up at https://sendgrid.com
2. Get API key
3. Configure in Supabase:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: [Your SendGrid API Key]

#### AWS SES

1. Set up AWS SES account
2. Verify domain
3. Get SMTP credentials
4. Configure in Supabase:
   - Host: `email-smtp.[region].amazonaws.com`
   - Port: `587`
   - Username: [Your SMTP Username]
   - Password: [Your SMTP Password]

---

## Troubleshooting

### Emails Still Not Arriving?

1. **Check Spam Folder** - Most common issue
2. **Wait 5-10 minutes** - Some providers have delays
3. **Check Resend Logs** - Go to Resend dashboard → Logs to see delivery status
4. **Verify Domain** - Make sure your sending domain is verified
5. **Check Rate Limits** - Free tiers have sending limits

### Testing Email Delivery

Use the "Resend Confirmation Email" page in your app:
- URL: `/auth/resend-confirmation`
- Enter email address
- Check if email arrives

### Verifying SMTP Configuration

In Supabase Dashboard:
1. Go to Authentication → Email Templates
2. Click "Send test email"
3. Enter your email
4. Check if test email arrives

---

## Current Status

**Your Logs Show:**
- ✅ Supabase IS sending emails successfully
- ✅ No errors in auth logs
- ❌ Emails not being received by users

**Cause:** Supabase's default email service is unreliable and rate-limited.

**Recommendation:** Set up Resend SMTP for reliable email delivery.

---

## Quick Fix for Immediate Use

If you need to test the app RIGHT NOW:

1. Disable email confirmation (Option 1 above)
2. Users can sign in immediately
3. Set up proper SMTP later for production

---

## Support

If you continue having issues:
- Check Supabase logs: Dashboard → Logs → Auth
- Check Resend logs: Resend Dashboard → Logs
- Contact Supabase support: https://supabase.com/support
