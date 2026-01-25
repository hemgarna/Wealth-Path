import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"
import { createClient } from "@/lib/supabase/server"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] send-credentials-email received:", JSON.stringify(body))
    
    const { name, email, temporaryPassword } = body

    // Validate required fields
    if (!email) {
      console.error("[v0] Missing email in request")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    
    if (!name) {
      console.error("[v0] Missing name in request")
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    
    if (!temporaryPassword) {
      console.error("[v0] Missing temporaryPassword in request")
      return NextResponse.json({ error: "Temporary password is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get advisor profile for fallback email
    const { data: advisorProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"
    const loginUrl = `${siteUrl}/auth/login`

    if (!process.env.SENDGRID_API_KEY) {
      console.error("[v0] SENDGRID_API_KEY not configured")
      return NextResponse.json({ 
        error: "Email service not configured",
        credentials: { email, password: temporaryPassword, loginUrl }
      }, { status: 500 })
    }

    try {
      await sgMail.send({
        from: process.env.ADMIN_EMAIL || "noreply@fna-app.com",
        to: email,
        subject: "Your FNA App Account - Login Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to FNA App</h2>
            <p>Hello ${name},</p>
            <p>Your financial advisor has created an account for you. Here are your login credentials:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email/Username:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="color: #dc2626; font-weight: bold; font-family: monospace;">${temporaryPassword}</span></p>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol style="line-height: 1.8;">
              <li>Visit the login page: <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></li>
              <li>Log in using the credentials above</li>
              <li><strong>Change your password immediately</strong> after logging in for security</li>
              <li>Complete your financial assessment to get started</li>
            </ol>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>Important:</strong> This is a temporary password for your first login. Please change it immediately for your security.</p>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions, please contact your financial advisor.</p>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
              © ${new Date().getFullYear()} FNA App. All rights reserved.
            </p>
          </div>
        `,
      })

      console.log("[v0] Credentials email sent successfully to client:", email)
      return NextResponse.json({
        success: true,
        message: "Credentials email sent to client",
        sentTo: email,
      })
    } catch (emailError: any) {
      console.error("[v0] SendGrid client email failed:", emailError)

      // Fallback: send to advisor instead
      if (advisorProfile?.email) {
        try {
          await sgMail.send({
            from: process.env.ADMIN_EMAIL || "noreply@fna-app.com",
            to: advisorProfile.email,
            subject: `[Forward to Client] Login Credentials for ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
                  <p style="margin: 0; color: #991b1b;"><strong>Action Required:</strong> Please forward this email to your client at <strong>${email}</strong></p>
                </div>

                <h2 style="color: #2563eb;">Client Account Created for ${name}</h2>
                <p>Login credentials for your client:</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Client Name:</strong> ${name}</p>
                  <p style="margin: 5px 0;"><strong>Email/Username:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="color: #dc2626; font-weight: bold; font-family: monospace;">${temporaryPassword}</span></p>
                </div>

                <p><strong>Instructions for Client:</strong></p>
                <ol style="line-height: 1.8;">
                  <li>Visit: <a href="${loginUrl}">${loginUrl}</a></li>
                  <li>Log in with the credentials above</li>
                  <li>Change password immediately</li>
                  <li>Complete financial assessment</li>
                </ol>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} FNA App. All rights reserved.
                </p>
              </div>
            `,
          })

          console.log("[v0] Fallback email sent to advisor:", advisorProfile.email)
          return NextResponse.json({
            success: true,
            message: "Email sent to your inbox. Please forward to client.",
            sentToFallback: true,
          })
        } catch (fallbackError) {
          console.error("[v0] Fallback email also failed:", fallbackError)
        }
      }

      return NextResponse.json({
        error: "Failed to send email",
        credentials: { email, password: temporaryPassword, loginUrl }
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("[v0] Error sending credentials email:", error)
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 })
  }
}
