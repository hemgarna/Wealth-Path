import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"
import { createClient } from "@supabase/supabase-js"

console.log("[v0] create-client route - SENDGRID_API_KEY EXISTS:", !!process.env.SENDGRID_API_KEY)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.error("[v0] ERROR: SENDGRID_API_KEY is not configured in create-client route")
}

export async function POST(req: Request) {
  try {
    console.log("[v0] Starting client creation...")

    const { createServerClient } = await import("@/lib/supabase/server")
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No user found - unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", user.id)
      .single()

    console.log("[v0] Advisor profile:", profile)

    if (profile?.role !== "advisor") {
      console.log("[v0] User is not an advisor")
      return NextResponse.json({ error: "Advisor access required" }, { status: 403 })
    }

    // ----------------------------------------
    // Normalize request body
    // ----------------------------------------
    const body = await req.json()
    console.log("[v0] Request body:", body)

    const email = body.email ?? body.clientEmail
    const fullName = body.fullName ?? body.clientName

    if (!email || !fullName) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating client:", { email, fullName })

    // ----------------------------------------
    // Generate temporary password
    // ----------------------------------------
    const temporaryPassword = Math.random().toString(36).slice(-10)

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Creating auth user with admin client...")

    // ----------------------------------------
    // CREATE SUPABASE AUTH USER
    // ----------------------------------------
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        role: "client",
        advisor_id: user.id,
        full_name: fullName,
      },
    })

    if (authError) {
      console.error("[v0] Supabase createUser error:", authError)
      return NextResponse.json({ error: `Failed to create client auth user: ${authError.message}` }, { status: 500 })
    }

    console.log("[v0] Auth user created successfully:", authUser.user.id)

    // ----------------------------------------
    // UPDATE OR INSERT PROFILE
    // ----------------------------------------
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: authUser.user.id,
      email,
      full_name: fullName,
      role: "client",
      advisor_id: user.id,
    })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
    } else {
      console.log("[v0] Profile created successfully")
    }

    // ----------------------------------------
    // CREATE CASE STATUS ENTRY
    // ----------------------------------------
    await supabaseAdmin.from("case_status").insert({
      user_id: authUser.user.id,
      status: "active",
    })

    const landingPageUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"
    const websiteUrl = landingPageUrl

    console.log("[v0] Sending email to client...")

    // ----------------------------------------
    // SEND EMAIL TO CLIENT
    // ----------------------------------------
    // Use verified SendGrid sender - noreply@fna-app.com
    const fromEmail = "noreply@fna-app.com"
    console.log("[v0] Using from email:", fromEmail)
    
    const clientMsg = {
      to: email,
      from: fromEmail,
      replyTo: profile.email,
      subject: "Your Client Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#2563eb;">Welcome to FNA App</h2>

          <p>Hello ${fullName},</p>

          <p>
            Your financial advisor
            <strong>${profile.full_name || profile.email}</strong>
            has created your account.
          </p>

          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
            <p>
              <strong>Login URL:</strong>
              <a href="${websiteUrl}" style="color:#2563eb;">
                ${websiteUrl}
              </a>
            </p>
          </div>

          <div style="background:#fee2e2;padding:12px;border-left:4px solid #dc2626;">
            ⚠️ Please log in and change your password immediately for security.
          </div>

          <p style="margin-top:24px;font-size:12px;color:#6b7280;">
            Need help? Reply to this email to contact your advisor.
          </p>
        </div>
      `,
    }

    try {
      console.log("[v0] SendGrid config check - API Key exists:", !!process.env.SENDGRID_API_KEY)
      console.log("[v0] SendGrid config check - ADMIN_EMAIL:", process.env.ADMIN_EMAIL)
      console.log("[v0] Sending to:", email, "from:", fromEmail)
      
      const result = await sgMail.send(clientMsg)
      console.log("[v0] Email sent successfully to client, status:", result[0]?.statusCode)

      return NextResponse.json({
        success: true,
        emailStatus: {
          sent: true,
          sentTo: "client",
          message: "Credentials have been sent directly to the client's email",
        },
        credentials: {
          email,
          password: temporaryPassword,
          loginUrl: websiteUrl,
        },
      })
    } catch (emailError: any) {
      // Extract detailed SendGrid error
      const sgError = emailError?.response?.body?.errors?.[0]?.message || emailError?.message || "Unknown error"
      const sgCode = emailError?.code || emailError?.response?.statusCode || "N/A"
      console.error("[v0] SendGrid client email failed - Code:", sgCode, "Error:", sgError)
      console.error("[v0] Full error:", JSON.stringify(emailError?.response?.body || emailError, null, 2))

      // ----------------------------------------
      // FALLBACK → SEND TO ADVISOR
      // ----------------------------------------
      try {
        await sgMail.send({
          to: profile.email,
          from: fromEmail,
          subject: `Client Credentials for ${fullName}`,
          html: `
            <p>Client email delivery failed.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${temporaryPassword}</p>
            <p><a href="${websiteUrl}">${websiteUrl}</a></p>
          `,
        })

        console.log("[v0] Fallback email sent to advisor")

        return NextResponse.json({
          success: true,
          emailStatus: {
            sent: true,
            sentTo: "advisor",
            message: "Client email delivery failed. Credentials have been sent to your email instead.",
          },
          credentials: {
            email,
            password: temporaryPassword,
            loginUrl: websiteUrl,
          },
        })
      } catch (fallbackError: any) {
        const fbError = fallbackError?.response?.body?.errors?.[0]?.message || fallbackError?.message || "Unknown error"
        console.error("[v0] Fallback email also failed:", fbError)
        console.error("[v0] Fallback full error:", JSON.stringify(fallbackError?.response?.body || fallbackError, null, 2))

        return NextResponse.json({
          success: true,
          emailStatus: {
            sent: false,
            sentTo: "none",
            message: "Email delivery failed. Please share credentials manually.",
          },
          credentials: {
            email,
            password: temporaryPassword,
            loginUrl: websiteUrl,
          },
        })
      }
    }
  } catch (error: any) {
    console.error("[v0] ERROR:", error)

    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
