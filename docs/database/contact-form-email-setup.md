# Contact Form Email Setup with Supabase and Resend

This document outlines how the contact form email functionality is implemented using Supabase Edge Functions with Resend API and how to set it up in your environment.

## Overview

The contact form on the website allows users to submit inquiries that are:
1. Stored in a Supabase database table
2. Sent as email notifications using Supabase Edge Functions with Resend API

## Implementation Details

### Database Setup

1. A `contact_submissions` table in Supabase stores all form submissions with the following schema:

```sql
create table public.contact_submissions (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  message text not null,
  agreed_to_privacy boolean not null default false,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table public.contact_submissions enable row level security;

-- Create policy to allow only authenticated users to view submissions
create policy "Only authenticated users can view contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (true);

-- Create policy to allow anyone to insert submissions
create policy "Anyone can submit contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Create policy to allow service role to do everything
create policy "Service role can do everything"
  on public.contact_submissions
  for all
  to service_role
  using (true)
  with check (true);
```

> **Important**: The RLS policies have been updated to allow both anonymous and authenticated users to insert records without requiring the `agreed_to_privacy` check in the database (this is still validated in the frontend). This helps prevent 403 Forbidden errors when submitting the form.

### Edge Function for Email Sending

A Supabase Edge Function named `send-contact-email` handles the email delivery using Resend API:

1. Create a new Edge Function in your Supabase project:

```bash
supabase functions new send-contact-email
```

2. Implement the function with the following code:

```typescript
// supabase/functions/send-contact-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    // Get Resend API key from environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || ''
    const EMAIL_TO = Deno.env.get('EMAIL_TO') || ''

    // Validate environment variables
    if (!RESEND_API_KEY || !EMAIL_FROM || !EMAIL_TO) {
      console.error('Missing required environment variables:', {
        hasResendApiKey: Boolean(RESEND_API_KEY),
        hasEmailFrom: Boolean(EMAIL_FROM),
        hasEmailTo: Boolean(EMAIL_TO)
      })
      throw new Error('Missing required environment variables for email sending')
    }

    // Parse request body
    const { firstName, lastName, email, phone, message } = await req.json()

    // Log received data for debugging (excluding sensitive information)
    console.log('Received contact form submission:', {
      name: `${firstName} ${lastName}`,
      hasEmail: Boolean(email),
      hasPhone: Boolean(phone),
      messageLength: message?.length || 0
    })

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      console.error('Missing required fields in form submission')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format email content
    const emailSubject = `New Contact Form Submission from ${firstName} ${lastName}`
    const emailBody = `
      New contact form submission:
      
      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      
      Message:
      ${message}
    `

    // Create HTML version of the email for better formatting
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `

    console.log('Sending email via Resend API')

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: emailSubject,
        text: emailBody,
        html: emailHtml,
        reply_to: email // Set reply-to as the submitter's email for easy responses
      })
    })

    const responseData = await response.json()
    
    if (!response.ok) {
      console.error('Resend API error:', responseData)
      throw new Error(`Failed to send email via Resend: ${JSON.stringify(responseData)}`)
    }

    console.log('Email sent successfully via Resend:', responseData)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

3. Deploy the function:

```bash
supabase functions deploy send-contact-email
```

## Configuration Steps

To set up the email functionality in your Supabase project:

1. **Create the database table**:
   - Execute the SQL commands provided above in the Supabase SQL Editor

2. **Set up environment variables**:
   - In the Supabase dashboard, go to Settings > API > Edge Functions
   - Add the following environment variables:
     - `RESEND_API_KEY`: Your Resend API key (get this from your Resend dashboard)
     - `EMAIL_FROM`: The sender email address (must be verified in Resend)
     - `EMAIL_TO`: The recipient email address for contact form submissions

3. **Deploy the Edge Function**:
   - Follow the deployment steps mentioned above

4. **Test the functionality**:
   - Submit a test contact form on your website
   - Verify that the submission is stored in the `contact_submissions` table
   - Check that the email is received at the specified `EMAIL_TO` address

## Troubleshooting

### Common Issues

#### 403 Forbidden Error When Submitting the Form

If you see a 403 Forbidden error in the console when submitting the form:

```
Failed to load resource: the server responded with a status of 403 ()
```

This is likely due to Row Level Security (RLS) policies in Supabase. Make sure:

1. The SQL migration has been applied correctly with the updated RLS policies
2. The user has permission to insert into the `contact_submissions` table
3. The Supabase client is properly initialized with the correct API key

If you're getting this error and the table already exists, you can update just the RLS policies using the following SQL:

```sql
-- Run this in the Supabase SQL Editor
DROP POLICY IF EXISTS "Only authenticated users can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service role can do everything" ON public.contact_submissions;

-- Create policy to allow only authenticated users to view submissions
CREATE POLICY "Only authenticated users can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow anyone to insert submissions
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything"
  ON public.contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

This SQL script is also available at `supabase/migrations/20250425_update_contact_submissions_policies.sql`.

#### CORS Errors When Calling Edge Functions

If you see CORS errors in the console when trying to call the Edge Function:

```
Access to fetch at 'https://your-project.supabase.co/functions/v1/send-contact-email' has been blocked by CORS policy
```

This is a common issue with Supabase Edge Functions. Make sure:

1. The Edge Function has proper CORS headers:
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Max-Age': '86400',
   }
   ```

2. The Edge Function properly handles OPTIONS requests (preflight requests) with a 200 status code:
   ```typescript
   if (req.method === 'OPTIONS') {
     return new Response('ok', { 
       status: 200,
       headers: corsHeaders 
     })
   }
   ```

3. The Edge Function is deployed with the latest changes
4. You're using the correct project URL and API key

#### Form Submission Shows "Sending..." But Never Completes

If the form submission button shows "Sending..." and never completes:

1. Check browser console for errors
2. Verify that the Supabase Edge Function is properly deployed and accessible
3. Check that the Resend API key and email settings are correct
4. Try closing and reopening the feedback dialog if it appears

#### Email Not Being Sent

If emails are not being sent:

1. Check the Supabase Edge Function logs in the Supabase dashboard
2. Verify that all environment variables are correctly set
3. Ensure your Resend API key is valid and not expired
4. Check that the sender email address is verified in your Resend account
5. Look for any rate limiting or other restrictions in your Resend account

#### Form Submission Shows Success But No Data is Saved

The form is now designed to show a success message only after both the database insertion and email sending have been attempted. If data isn't being saved:

1. Check browser console for errors
2. Verify that the Supabase project URL and API key are correct
3. Check that the table structure matches what the form is trying to insert
4. Verify that the RLS policies allow the current user to insert data

## Security Considerations

- The contact form implements validation on both client and server sides
- Sensitive API keys are stored as environment variables, not in the code
- Row Level Security (RLS) ensures that only authenticated users can view submissions
- The Edge Function validates all inputs before processing
- Resend API provides additional security features and monitoring

## Future Improvements

- Add email templates for more professional-looking emails
- Implement rate limiting to prevent abuse
- Add spam detection mechanisms
- Set up email delivery status tracking
- Add analytics for contact form submissions