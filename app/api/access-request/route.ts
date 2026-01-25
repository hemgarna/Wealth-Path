import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, message, advisorId, autoCreate } = await request.json()

    console.log("[v0] Processing access request for:", email, "autoCreate:", autoCreate)

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please login instead." },
        { status: 400 }
      )
    }

    // ===== MODE 1: Auto-create account (for workshops when self-registration is enabled) =====
    if (autoCreate) {
      if (!advisorId) {
        return NextResponse.json({ error: "Please select an advisor" }, { status: 400 })
      }

      // Verify advisor exists
      const { data: advisor, error: advisorError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", advisorId)
        .eq("role", "advisor")
        .single()

      if (advisorError || !advisor) {
        console.error("[v0] Advisor not found:", advisorError)
        return NextResponse.json({ error: "Selected advisor not found" }, { status: 400 })
      }

      console.log("[v0] Creating client under advisor:", advisor.full_name || advisor.email)

      // Generate temporary password
      const temporaryPassword = Math.random().toString(36).slice(-10)

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          role: "client",
          advisor_id: advisorId,
          full_name: name,
        },
      })

      if (authError) {
        console.error("[v0] Error creating auth user:", authError)
        return NextResponse.json({ error: `Failed to create account: ${authError.message}` }, { status: 500 })
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authUser.user.id,
        email,
        full_name: name,
        role: "client",
        advisor_id: advisorId,
      })

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
      }

      // Create case status
      await supabase.from("case_status").insert({
        user_id: authUser.user.id,
        status: "active",
      })

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"
      const loginUrl = `${siteUrl}/auth/login`
      const fromEmail = "noreply@fna-app.com"

      // Send credentials email to client
      if (process.env.SENDGRID_API_KEY) {
        try {
          await sgMail.send({
            from: fromEmail,
            to: email,
            subject: "Welcome to FNA App - Your Login Credentials",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(to right, #1e3a8a, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to FNA App</h1>
                </div>
                
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name},</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">Your client account has been created successfully. You have been assigned to <strong>${advisor.full_name || advisor.email}</strong>.</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; color: #1e3a8a;">Your Login Credentials:</h3>
                    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background-color: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${temporaryPassword}</code></p>
                  </div>
                  
                  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Please change your password immediately after your first login.</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" style="background-color: #1e3a8a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Login Now
                    </a>
                  </div>
                </div>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("[v0] Failed to send email to client:", emailError)
        }

        // Notify the advisor
        try {
          await sgMail.send({
            from: fromEmail,
            to: advisor.email,
            subject: `New Client Registered - ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(to right, #0f766e, #14b8a6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">New Client Registration</h1>
                </div>
                
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hello ${advisor.full_name || "Advisor"},</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">A new client has registered and selected you as their advisor.</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; color: #0f766e;">Client Details:</h3>
                    <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${siteUrl}/admin" style="background-color: #0f766e; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      View Client
                    </a>
                  </div>
                </div>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("[v0] Failed to send email to advisor:", emailError)
        }
      }

      // Create notification for the advisor
      await supabase.from("notifications").insert({
        user_id: advisor.id,
        advisor_id: advisor.id,
        title: "New Client Registered",
        message: `${name} (${email}) has registered as your client.`,
        type: "client_registered",
        read: false,
      })

      return NextResponse.json({
        message: "Your account has been created successfully!",
        success: true,
        credentials: {
          email,
          password: temporaryPassword,
        },
      })
    }

    // ===== MODE 2: Submit access request for admin review (default) =====
    if (!message) {
      return NextResponse.json({ error: "Please provide a message" }, { status: 400 })
    }

    // Check for existing pending request
    const { data: existingRequest } = await supabase
      .from("access_requests")
      .select("id, status")
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending access request. Please wait for admin review." },
        { status: 400 }
      )
    }

    // Create access request record
    const { error: insertError } = await supabase.from("access_requests").insert({
      email,
      full_name: name,
      message,
      requested_role: "client",
      status: "pending",
    })

    if (insertError) {
      console.error("[v0] Error creating access request:", insertError)
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
    }

    // Notify admins (CEOs and advisors) via email
    const fromEmail = "noreply@fna-app.com"
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"

    if (process.env.SENDGRID_API_KEY) {
      // Get all CEOs to notify
      const { data: ceos } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("role", "ceo")

      if (ceos && ceos.length > 0) {
        for (const ceo of ceos) {
          try {
            await sgMail.send({
              from: fromEmail,
              to: ceo.email,
              subject: `New Access Request - ${name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(to right, #7c3aed, #a855f7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">New Access Request</h1>
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${ceo.full_name || "Admin"},</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">A new user has requested access to FNA App.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                      <h3 style="margin-top: 0; color: #7c3aed;">Request Details:</h3>
                      <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                      <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                      <p style="margin: 10px 0;"><strong>Message:</strong> ${message}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${siteUrl}/ceo" style="background-color: #7c3aed; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Review Request
                      </a>
                    </div>
                  </div>
                </div>
              `,
            })
          } catch (emailError) {
            console.error("[v0] Failed to send notification to CEO:", ceo.email, emailError)
          }
        }
      }
    }

    console.log("[v0] Access request submitted for:", email)

    return NextResponse.json({
      message: "Your access request has been submitted successfully!",
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error in access request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
