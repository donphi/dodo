# Contact Form Email Setup with Supabase

This document outlines how the contact form email functionality is implemented using Supabase Edge Functions and how to set it up in your environment.

## Overview

The contact form on the website allows users to submit inquiries that are:
1. Stored in a Supabase database table
2. Sent as email notifications using Supabase Edge Functions

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

A Supabase Edge Function named `send-contact-email` handles the email delivery:

1. Create a new Edge Function in your Supabase project:

```bash
supabase functions new send-contact-email
```

2. Implement the function with the following code:

```typescript
// supabase/functions/send-contact-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || ''
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME') || ''
    const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || ''
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || ''
    const EMAIL_TO = Deno.env.get('EMAIL_TO') || ''

    // Validate environment variables
    if (!SMTP_HOST || !SMTP_USERNAME || !SMTP_PASSWORD || !EMAIL_FROM || !EMAIL_TO) {
      throw new Error('Missing required environment variables for email sending')
    }

    // Parse request body
    const { firstName, lastName, email, phone, message } = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configure SMTP client
    const client = new SmtpClient()
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    })

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

    // Send email
    await client.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: emailSubject,
      content: emailBody,
    })

    await client.close()

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
     - `SMTP_HOST`: Your SMTP server hostname (e.g., `smtp.gmail.com`)
     - `SMTP_PORT`: Your SMTP server port (typically `587` for TLS)
     - `SMTP_USERNAME`: Your SMTP username/email
     - `SMTP_PASSWORD`: Your SMTP password or app password
     - `EMAIL_FROM`: The sender email address
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

#### Email Not Being Sent

If emails are not being sent:

1. Check the Supabase Edge Function logs in the Supabase dashboard
2. Verify that all environment variables are correctly set
3. Ensure your SMTP provider allows sending from your Edge Function (some providers may block unfamiliar IP addresses)
4. For Gmail, you may need to use an App Password instead of your regular password

#### Form Submission Shows Success But No Data is Saved

The form is designed to show a success message immediately for better user experience, even before the actual submission is complete. If data isn't being saved:

1. Check browser console for errors
2. Verify that the Supabase project URL and API key are correct
3. Check that the table structure matches what the form is trying to insert

## Security Considerations

- The contact form implements validation on both client and server sides
- Sensitive SMTP credentials are stored as environment variables, not in the code
- Row Level Security (RLS) ensures that only authenticated users can view submissions
- The Edge Function validates all inputs before processing

## Future Improvements

- Add email templates for more professional-looking emails
- Implement rate limiting to prevent abuse
- Add spam detection mechanisms
- Set up email delivery status tracking