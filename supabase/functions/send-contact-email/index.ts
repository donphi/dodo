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