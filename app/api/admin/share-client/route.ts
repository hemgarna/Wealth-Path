import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid only if API key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request: Request) {
  try {
    // Use regular client for auth check
    const supabase = await createServerClient()
    const { clientId, advisorEmail } = await request.json()

    // Get current user (the advisor sharing)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Get current advisor profile using admin client
    const { data: currentAdvisor } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", user.id)
      .single()

    if (!currentAdvisor || currentAdvisor.role !== "advisor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: targetAdvisor, error: advisorError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("email", advisorEmail.trim().toLowerCase())
      .eq("role", "advisor")
      .single()

    if (advisorError || !targetAdvisor) {
      console.log("[v0] Advisor lookup failed:", advisorError?.message)
      return NextResponse.json(
        {
          error: "No advisor found with this email address. You can only share with existing advisors in the system.",
        },
        { status: 404 },
      )
    }

    if (targetAdvisor.id === user.id) {
      return NextResponse.json({ error: "You cannot share a client with yourself" }, { status: 400 })
    }

    // Get client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check if already shared
    const { data: existingShare } = await supabaseAdmin
      .from("case_sharing")
      .select("id")
      .eq("case_id", clientId)
      .eq("shared_with", targetAdvisor.id)
      .is("revoked_at", null)
      .single()

    if (existingShare) {
      return NextResponse.json({ error: "Client is already shared with this advisor" }, { status: 400 })
    }

    // Create the share record using admin client
    const { error: shareError } = await supabaseAdmin.from("case_sharing").insert({
      case_id: clientId,
      shared_by: currentAdvisor.id,
      shared_with: targetAdvisor.id,
      permission_level: "full_access",
    })

    if (shareError) {
      console.error("[v0] Error creating share:", shareError)
      return NextResponse.json({ error: "Failed to share client" }, { status: 500 })
    }

    // Send email notification to the receiving advisor
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fna-app.com"
      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send({
          from: process.env.ADMIN_EMAIL || "noreply@fna-app.com",
          to: targetAdvisor.email,
          subject: "New Client Shared With You - FNA App",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Client Shared With You</h2>
              <p>Hello ${targetAdvisor.full_name},</p>
              <p><strong>${currentAdvisor.full_name}</strong> has shared a client with you:</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Client Name:</strong> ${client.full_name || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Client Email:</strong> ${client.email}</p>
              </div>
              <p>You now have full access to this client's case. You can view and manage their information in your dashboard under "Shared Cases".</p>
              <p>
                <a href="${siteUrl}/admin" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  View Shared Client
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                If you have any questions, please contact ${currentAdvisor.full_name} at ${currentAdvisor.email}
              </p>
            </div>
          `,
        })
      } else {
        console.log("[v0] SENDGRID_API_KEY not configured, skipping email notification")
      }
    } catch (emailError) {
      console.error("[v0] Error sending notification email:", emailError)
      // Don't fail the request if email fails
    }

    // Create notification in database
    await supabaseAdmin.from("notifications").insert({
      user_id: targetAdvisor.id,
      advisor_id: currentAdvisor.id,
      type: "client_shared",
      title: "New Client Shared",
      message: `${currentAdvisor.full_name} has shared client ${client.full_name || client.email} with you`,
      read: false,
    })

    return NextResponse.json({ success: true, message: "Client shared successfully" })
  } catch (error) {
    console.error("[v0] Error in share-client API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
