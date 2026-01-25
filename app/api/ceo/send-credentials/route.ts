import { type NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY || process.env.Send_Grid!)

export async function POST(request: NextRequest) {
  try {
    const { email, name, tempPassword, requestedRole } = await request.json()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"
    const loginUrl = `${siteUrl}/auth/login`

    const roleText = requestedRole === "advisor" ? "Financial Strategist" : "Client"

    const msg = {
      from: process.env.ADMIN_EMAIL || "noreply@fna-app.com",
      to: email,
      subject: "Your FNA App Access Has Been Approved",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .credentials { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .credential-row { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
              .label { font-weight: bold; color: #4b5563; }
              .value { color: #1f2937; font-family: monospace; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to FNA App</h1>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                
                <p>Great news! Your access request to FNA App as a <strong>${roleText}</strong> has been approved by our Admin team.</p>
                
                <div class="credentials">
                  <h3 style="margin-top: 0;">Your Login Credentials</h3>
                  
                  <div class="credential-row">
                    <span class="label">Email:</span><br>
                    <span class="value">${email}</span>
                  </div>
                  
                  <div class="credential-row">
                    <span class="label">Temporary Password:</span><br>
                    <span class="value">${tempPassword}</span>
                  </div>
                  
                  <div class="credential-row">
                    <span class="label">Login URL:</span><br>
                    <a href="${loginUrl}" class="value">${loginUrl}</a>
                  </div>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important Security Notice:</strong><br>
                  Please log in and change your password immediately for security. This temporary password will expire in 7 days.
                </div>
                
                <div style="text-align: center;">
                  <a href="${loginUrl}" class="button">Login to Your Account</a>
                </div>
                
                <p style="margin-top: 30px;">If you have any questions or need assistance, please reply to this email.</p>
                
                <p>Best regards,<br>The FNA App Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    await sgMail.send(msg)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send-credentials API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
