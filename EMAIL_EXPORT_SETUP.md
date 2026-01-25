# Email Export Feature Setup

This application includes an automated email export feature that sends a comprehensive Excel report to the admin when clients complete all four assessment sections.

## Features

- **Automatic Excel Generation**: Creates a detailed Excel workbook with all client data across 4 sections
- **Email Delivery**: Automatically sends the report to admin via email using Resend API
- **Background Process**: Runs automatically when client views Final Report (no visible UI to client)

## Required Environment Variables

Add the following environment variables to your Vercel project:

### RESEND_API_KEY

Get your API key from [Resend Dashboard](https://resend.com/api-keys)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ADMIN_EMAIL

The email address where all client reports should be sent automatically.

```bash
ADMIN_EMAIL=nithyavananda8@gmail.com
```

## How to Set Up

1. **Sign up for Resend** (if not already):
   - Go to https://resend.com
   - Create a free account
   - Verify your domain (or use the test domain for development)

2. **Get your API Key**:
   - Navigate to API Keys in the Resend dashboard
   - Click "Create API Key"
   - Copy the key

3. **Add to Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables (or use the "Vars" section in the v0 sidebar)
   - Add `RESEND_API_KEY` with your key value
   - Add `ADMIN_EMAIL` with value: **nithyavananda8@gmail.com**
   - Redeploy your application

## How It Works

1. Client completes all 4 assessment sections
2. Client submits Section 4 (Savings vs Spending)
3. Client is automatically redirected to Final Report page
4. **Report is automatically sent to admin email in the background**
5. Client sees their final report (no email UI visible to them)
6. Admin receives Excel file with complete client data

## Excel Report Contents

The generated Excel file includes 5 worksheets:

1. **Client Information**
   - Name, email, phone, age, retirement age

2. **Financial Goals**
   - Retirement income needs
   - Healthcare philosophy
   - Long-term care insurance status
   - Net worth

3. **Growth Strategy**
   - All retirement account balances (401k, IRA, Roth, HSA)
   - Brokerage accounts
   - Real estate holdings
   - Business ownership

4. **Defense Strategy**
   - Life insurance coverage and gaps
   - Disability insurance
   - Long-term care insurance
   - Umbrella coverage
   - Foreign assets (FBAR)

5. **Savings vs Spending**
   - Income breakdown with taxes
   - Housing expenses (30%)
   - Lifestyle expenses (30%)
   - Retirement savings (20%)
   - Short-term savings (20%)

## Email Details

**Subject**: New Client Report - [Client Name] ([Client Email])

**Content**: Includes client summary and complete assessment data as Excel attachment

**Filename Format**: Financial_Report_[ClientName]_YYYY-MM-DD.xlsx

## Testing

To test the feature:

1. Complete all 4 assessment sections as a test user
2. Submit Section 4 
3. View the Final Report page (email is sent automatically)
4. Check your admin email inbox for the report

## Customization

To customize the admin email template, edit:
- File: `app/api/send-report/route.ts`
- Section: Email HTML content in the Resend API call

To customize Excel structure:
- File: `app/api/send-report/route.ts`
- Section: Workbook creation with ExcelJS

To change the admin email address:
- Update the `ADMIN_EMAIL` environment variable in Vercel

## Notes

- The "from" email in development uses Resend's test domain: `onboarding@resend.dev`
- For production, configure a verified domain in Resend
- Free tier includes 100 emails/day, 3,000/month
- Email delivery typically takes 1-5 seconds
- Process runs in background - client is not notified of email status
- If email fails, error is logged but client experience is not affected
