import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import sgMail from "@sendgrid/mail"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("[v0] Password reset request received")
    
    // Initialize SendGrid inside the handler to ensure env vars are loaded
    if (!process.env.SENDGRID_API_KEY) {
      console.error("[v0] SENDGRID_API_KEY is not set!")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("[v0] Looking up user with email:", email)

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    console.log("[v0] Admin client created, querying auth users")

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error("[v0] Error listing auth users:", authError)
    }

    const userExists = authData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    console.log("[v0] Auth user lookup complete:", { found: !!userExists, totalUsers: authData?.users?.length })

    // Get profile for additional info
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    console.log("[v0] Profile lookup:", { found: !!profile })

    if (!userExists) {
      // Don't reveal if user exists or not for security
      console.log("[v0] User not found in auth, returning generic success message")
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, you will receive a password reset link.",
      })
    }

    console.log("[v0] User found in auth system:", userExists.id)

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    console.log("[v0] Generated reset token, storing in database")

    // Store the token in the database
    const { error: tokenError } = await supabaseAdmin.from("password_reset_tokens").insert({
      user_id: userExists.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (tokenError) {
      console.error("[v0] Error creating reset token:", tokenError)
      return NextResponse.json({ error: "Failed to create reset token" }, { status: 500 })
    }

    console.log("[v0] Reset token stored successfully, preparing email")

    // Create the reset link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"
    const resetLink = `${siteUrl}/auth/reset-password/${resetToken}`

    // Send email via SendGrid - use verified sender
    const fromEmail = "noreply@fna-app.com"
    const msg = {
      to: email,
      from: fromEmail,
      subject: "Reset Your Password - FNA App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #059669 0%, #14b8a6 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FNA App</h1>
                      <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 14px;">Financial Needs Analysis</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
                      <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Hello${profile?.full_name ? ` ${profile.full_name}` : ""},
                      </p>
                      <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #059669 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #475569; line-height: 1.6; margin: 20px 0; font-size: 14px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #059669; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                        ${resetLink}
                      </p>
                      
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                          ⏰ <strong>This link will expire in 1 hour</strong> for security reasons.
                        </p>
                      </div>
                      
                      <p style="color: #64748b; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                        If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #64748b; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} FNA App. All rights reserved.
                      </p>
                      <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">
                        🔒 This is an automated message. Please do not reply to this email.
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

    console.log("[v0] Sending email via SendGrid to:", email)
    console.log("[v0] SendGrid API key exists:", !!process.env.SENDGRID_API_KEY)
    console.log("[v0] SendGrid API key (first 10 chars):", process.env.SENDGRID_API_KEY?.substring(0, 10))

    try {
      const result = await sgMail.send(msg)
      console.log("[v0] Password reset email sent successfully:", {
        to: email,
        statusCode: result[0]?.statusCode,
        messageId: result[0]?.headers?.["x-message-id"],
      })
    } catch (emailError: any) {
      console.error("[v0] SendGrid error details:", {
        message: emailError.message,
        code: emailError.code,
        statusCode: emailError.response?.statusCode,
        body: emailError.response?.body,
      })
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, you will receive a password reset link.",
    })
  } catch (error: any) {
    console.error("[v0] Error in password reset:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      {
        error: "Failed to process password reset request",
      },
      { status: 500 },
    )
  }
}
