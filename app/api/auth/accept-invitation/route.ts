import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    const supabase = await createServerClient()

    const { data: invitation, error: invitationError } = await supabase
      .from("client_invitations")
      .select("*")
      .eq("invitation_token", token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 })
    }

    if (invitation.status === "accepted") {
      return NextResponse.json({ error: "Invitation already used" }, { status: 400 })
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: invitation.client_email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: invitation.client_name,
        role: "client",
      },
    })

    if (authError) {
      console.error("[v0] Error creating user:", authError)
      throw authError
    }

    console.log("[v0] User created successfully:", authData.user.id)

    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authData.user.id,
      email: invitation.client_email,
      full_name: invitation.client_name,
      role: "client",
      onboarding_completed: false,
      advisor_id: invitation.invited_by, // Critical: Link to advisor who sent invitation
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("[v0] Error creating profile:", profileError)
      throw new Error("Failed to create client profile") // Fail fast if profile creation fails
    }

    console.log("[v0] Profile created with advisor_id:", invitation.invited_by)

    const { error: caseError } = await adminClient.from("case_status").insert({
      user_id: authData.user.id,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (caseError) {
      console.error("[v0] Error creating case status:", caseError)
    }

    await adminClient.from("conversion_tracking").insert({
      user_id: authData.user.id,
      advisor_id: invitation.invited_by,
      event_type: "signup",
      event_data: {
        via_invitation: true,
        invitation_id: invitation.id,
      },
    })

    await supabase
      .from("client_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id)

    console.log("[v0] Account setup completed for:", invitation.client_email)

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error accepting invitation:", error)
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 })
  }
}
