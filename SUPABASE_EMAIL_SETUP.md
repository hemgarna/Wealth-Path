# Supabase Email Configuration Guide

This guide will help you configure email settings in Supabase to ensure confirmation emails are sent to users during sign-up.

## Problem

Users are not receiving confirmation emails after creating an account.

## Solution

Follow these steps to configure email settings in your Supabase project:

### 1. Configure Site URL

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to your production URL (e.g., `https://yourdomain.com`)
   - For development, you can temporarily set it to `http://localhost:3000`
   - The Site URL is critical for email confirmations and password resets

### 2. Configure Redirect URLs

1. In the same **URL Configuration** section
2. Add your redirect URLs to the **Redirect URLs** list:
   ```
   http://localhost:3000/home
   https://yourdomain.com/home
   https://preview-financial-plan-analysis-*.vercel.app/home
   ```
3. The `emailRedirectTo` option in your code must exactly match one of these URLs

### 3. Enable Email Confirmations

1. Navigate to **Authentication** → **Providers** → **Email**
2. Ensure **Enable email confirmations** is checked
3. This requires users to confirm their email before they can sign in

### 4. Configure Email Templates (Optional but Recommended)

1. Navigate to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: The email sent when users sign up
   - **Reset password**: The email sent for password resets
   - **Change email address**: The email sent when users change their email

3. Default template variables you can use:
   - `{{ .ConfirmationURL }}` - The confirmation link
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Email }}` - User's email address

### 5. SMTP Configuration (Production)

For production, you should configure a custom SMTP server instead of using Supabase's default email service:

1. Navigate to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun):
   - **SMTP Host**: Your provider's SMTP host
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your SMTP username
   - **SMTP Password**: Your SMTP password
   - **Sender Email**: The "from" email address
   - **Sender Name**: Display name for emails

3. Recommended providers:
   - **SendGrid**: Free tier includes 100 emails/day
   - **AWS SES**: Pay-as-you-go pricing
   - **Mailgun**: Free tier includes 5,000 emails/month
   - **Resend**: Modern API-first email service

### 6. Test Email Configuration

1. After configuring, create a test account
2. Check that:
   - Confirmation email is received
   - Links in the email work correctly
   - User is redirected to the correct page after confirmation

### 7. Environment Variables

Ensure your environment variables are set correctly:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/home
```

For production, remove or update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`.

## Troubleshooting

### Emails go to spam
- Configure SPF, DKIM, and DMARC records for your domain
- Use a reputable SMTP provider
- Avoid spammy content in email templates

### Wrong redirect URL
- Ensure the URL in your code matches exactly what's configured in Supabase
- Check for trailing slashes and http vs https

### No email received at all
- Check Supabase logs in **Logs** → **Auth Logs**
- Verify email confirmations are enabled
- Check if your SMTP configuration is correct

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Configuration](https://supabase.com/docs/guides/auth/auth-email)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
