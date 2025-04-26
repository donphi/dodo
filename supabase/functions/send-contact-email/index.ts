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