# Conversion Tracking System

This document describes the conversion tracking implementation for the Financial Planning Platform.

## Overview

The platform now tracks 8 key events throughout the client journey to populate the conversion funnel analytics dashboard.

## Tracked Events

1. **landing_page_view** - When a visitor views the landing page
2. **signup** - When a new client account is created (either self-signup or by advisor)
3. **started_questionnaire** - When a client begins the financial assessment
4. **step1_complete** - Personal information step completed
5. **step2_complete** - Income & expenses step completed
6. **step3_complete** - Assets & liabilities step completed
7. **step4_complete** - Goals & planning step completed
8. **consultation_booked** - When the assessment is fully submitted

## Implementation

### Tracking Library

Location: `lib/tracking.ts`

The `trackEvent()` function automatically:
- Gets the current user ID if not provided
- Retrieves the advisor_id for clients
- Inserts the event into the `conversion_tracking` table
- Handles errors gracefully without disrupting user experience

### Tracking Points

| Event | Location | Trigger |
|-------|----------|---------|
| landing_page_view | `app/page.tsx` | Page load (useEffect) |
| signup | `app/api/admin/create-client/route.ts` | Client account created by advisor |
| signup | `app/auth/sign-up/page.tsx` | Self-signup (if enabled) |
| started_questionnaire | `app/assessment/page.tsx` | Assessment page load |
| step1_complete | `app/assessment/page.tsx` | Next button clicked on step 1 |
| step2_complete | `app/assessment/page.tsx` | Next button clicked on step 2 |
| step3_complete | `app/assessment/page.tsx` | Next button clicked on step 3 |
| step4_complete | `app/assessment/page.tsx` | Next button clicked on step 4 |
| consultation_booked | `app/assessment/page.tsx` | Final submission |

## Analytics Dashboard

### CEO Analytics
Location: `/ceo/analytics`

View conversion funnel for:
- All advisors combined
- Individual advisor performance
- Custom date ranges (7, 30, 60, 90 days)

### Advisor Analytics
Location: `/admin/analytics`

Each advisor can view their own conversion funnel data.

## Database Schema

Table: `conversion_tracking`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | The user who triggered the event (nullable for anonymous) |
| advisor_id | uuid | The advisor associated with the user (nullable) |
| event_type | text | One of the 8 event types |
| metadata | jsonb | Additional event data |
| created_at | timestamp | Event timestamp |

## How to View Analytics

### For CEOs:
1. Log in to the CEO dashboard
2. Click "Analytics" button in the header
3. Select date range and/or specific advisor
4. View conversion metrics and funnel progression

### For Advisors:
1. Log in to the advisor dashboard
2. Click "Analytics" button in the header
3. View your own conversion metrics
4. Filter by date range

## Metrics Calculated

- **Total Visitors**: Count of landing_page_view events
- **Conversions**: Count of consultation_booked events
- **Conversion Rate**: (Conversions / Total Visitors) × 100
- **Total Dropoffs**: Total Visitors - Conversions

## Notes

- Tracking is non-blocking - if tracking fails, the user experience continues normally
- All tracking events are logged to the console for debugging
- Anonymous visitors (before signup) have null user_id but still generate landing page view events
- Once a user signs up or logs in, all subsequent events are linked to their user_id and advisor_id
