import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY || process.env.Send_Grid!)

export async function POST(request: Request) {
  try {
    const { createServerClient } = await import("@/lib/supabase/server")
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "advisor") {
      return NextResponse.json({ error: "Unauthorized - Advisor access required" }, { status: 403 })
    }

    const { clientName, clientEmail, temporaryPassword } = await request.json()

    const loginUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"

    console.log("[v0] Attempting to send credentials to client:", clientEmail)

    const msg = {
      to: clientEmail,
      from: process.env.ADMIN_EMAIL || "onboarding@yourdomain.com",
      replyTo: profile.email,
      subject: "Your Financial Planning Account - Login Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Your Financial Planning Platform</h2>
          <p>Hello ${clientName},</p>
          <p>Your financial advisor, <strong>${profile.full_name || profile.email}</strong>, has created an account for you. Here are your login credentials:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${clientEmail}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</span></p>
            <p style="margin: 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}/auth/login" style="color: #2563eb;">${loginUrl}/auth/login</a></p>
          </div>

          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b;"><strong>⚠️ Important Security Step:</strong> Please change your password immediately after logging in for the first time.</p>
          </div>

          <p><strong>Getting Started:</strong></p>
          <ol style="line-height: 1.8;">
            <li>Click the login link above or copy it into your browser</li>
            <li>Log in using your email and temporary password</li>
            <li><strong>Change your password</strong> in your account settings</li>
            <li>Complete your financial assessment</li>
            <li>Review your personalized financial plan</li>
          </ol>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>Need Help?</strong> Reply to this email to contact your financial advisor directly at ${profile.email}</p>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This email was sent by your financial advisor ${profile.full_name || profile.email}. If you did not request this account, please contact them directly.
          </p>
        </div>
      `,
    }

    try {
      await sgMail.send(msg)
      console.log("[v0] ✅ Credentials email sent successfully to client:", clientEmail)
      return NextResponse.json({
        success: true,
        sentTo: "client",
        message: `Credentials sent directly to ${clientEmail}`,
      })
    } catch (emailError: any) {
      console.error("[v0] Failed to send email to client, sending to advisor as fallback:", emailError.message)

      try {
        const fallbackMsg = {
          to: profile.email,
          from: process.env.ADMIN_EMAIL || "onboarding@yourdomain.com",
          subject: `Client Credentials for ${clientName} - Please Forward`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;"><strong>⚠️ Email Delivery Issue:</strong> We couldn't send credentials directly to the client. Please forward these credentials to your client.</p>
              </div>

              <h2 style="color: #2563eb;">Client Account Created: ${clientName}</h2>
              <p>You have successfully created an account for your client. Please forward these credentials to <strong>${clientEmail}</strong>:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Client Login Credentials:</h3>
                <p style="margin: 10px 0;"><strong>Client Name:</strong> ${clientName}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${clientEmail}</p>
                <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</span></p>
                <p style="margin: 10px 0;"><strong>Login URL:</strong> <a href="${loginUrl}/auth/login" style="color: #2563eb;">${loginUrl}/auth/login</a></p>
              </div>

              <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;"><strong>📧 Next Steps:</strong> Please forward these credentials to your client at ${clientEmail} via your preferred communication method.</p>
              </div>

              <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #991b1b;"><strong>Security Reminder:</strong> Advise your client to change their password immediately after logging in.</p>
              </div>
            </div>
          `,
        }

        await sgMail.send(fallbackMsg)
        console.log("[v0] ✅ Credentials sent to advisor email as fallback:", profile.email)
        return NextResponse.json({
          success: true,
          sentTo: "advisor",
          message: `Email delivery issue. Credentials have been sent to your email (${profile.email}) to forward to the client.`,
          note: `Please forward the credentials to ${clientEmail}`,
        })
      } catch (fallbackError: any) {
        console.error("[v0] ❌ Failed to send fallback email to advisor:", fallbackError.message)
        return NextResponse.json(
          {
            error: "Failed to send credentials email. Please share the credentials manually with your client.",
          },
          { status: 500 },
        )
      }
    }
  } catch (error: any) {
    console.error("[v0] Error in send-client-credentials:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
