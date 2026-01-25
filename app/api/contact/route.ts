import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, subject, description } = await request.json()

    // Validate required fields
    if (!email || !subject || !description) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Create admin Supabase client to fetch CEO emails
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Fetch all CEO emails
    const { data: ceos, error: ceoError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("role", "ceo")

    if (ceoError) {
      console.error("[v0] Error fetching CEOs:", ceoError)
      return NextResponse.json({ message: "Failed to process request" }, { status: 500 })
    }

    if (!ceos || ceos.length === 0) {
      console.error("[v0] No CEOs found in database")
      return NextResponse.json({ message: "No administrators found" }, { status: 500 })
    }

    // Send email to all CEOs - use verified sender
    const fromEmail = "noreply@fna-app.com"
    const emailPromises = ceos.map((ceo) => {
      const msg = {
        to: ceo.email,
        from: fromEmail,
        subject: `Contact Form Submission: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Contact Form Submission</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">New Contact Form Submission</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                            Hello ${ceo.full_name || "Admin"},
                          </p>
                          
                          <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                            You have received a new message through the Wealth Path contact form:
                          </p>
                          
                          <!-- Contact Details -->
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding-bottom: 15px;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                                <p style="margin: 5px 0 0; color: #111827; font-size: 16px; font-weight: 500;">${email}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 15px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                                <p style="margin: 5px 0 0; color: #111827; font-size: 16px; font-weight: 500;">${subject}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                                <p style="margin: 10px 0 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${description}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin-top: 30px;">
                            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                              <strong>Action Required:</strong> Please respond to this inquiry at your earliest convenience by replying directly to ${email}.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                            This is an automated message from the Wealth Path contact form.
                          </p>
                          <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                            © 2025 Wealth Path. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }

      return sgMail.send(msg)
    })

    await Promise.all(emailPromises)

    console.log("[v0] Contact form submission sent to all CEOs")

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}
