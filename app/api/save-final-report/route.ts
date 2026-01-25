import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reportData = await request.json()

    console.log("[v0] Saving final report for user:", user.id)

    const { data: existingReport } = await supabase
      .from("final_report")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    const isNewSubmission = !existingReport

    const { data, error } = await supabase
      .from("final_report")
      .upsert(
        {
          user_id: user.id,
          ...reportData,
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving final report:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Final report saved successfully:", data.id)

    if (isNewSubmission) {
      // Get user profile with advisor assignment
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, advisor_id")
        .eq("id", user.id)
        .single()

      if (profile?.advisor_id) {
        const { data: advisor } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", profile.advisor_id)
          .single()

        if (advisor) {
          const baseUrl = "https://v0-financial-plan-analysis.vercel.app"
          const caseUrl = `${baseUrl}/admin/case/${user.id}`

          const fromEmail = "noreply@fna-app.com" // Verified SendGrid sender
          try {
            await sgMail.send({
              to: advisor.email,
              from: fromEmail,
              subject: `Client Assessment Completed - ${profile?.full_name || profile?.email}`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                      .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                      .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                      .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
                      .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>✅ Client Assessment Completed</h1>
                      </div>
                      <div class="content">
                        <p>Hello ${advisor.full_name || "Advisor"},</p>
                        <p><strong>Great news!</strong> Your client has completed all sections of their financial assessment and submitted their final report.</p>
                        
                        <div class="info-box">
                          <h3 style="margin-top: 0;">Client Information</h3>
                          <p><strong>Name:</strong> ${profile?.full_name || "Not provided"}</p>
                          <p><strong>Email:</strong> ${profile?.email}</p>
                          <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>

                        <p>The client has completed all assessment sections:</p>
                        <ul>
                          <li>✅ Financial Goals & Retirement Planning</li>
                          <li>✅ Growth Strategy (Investments & Retirement Accounts)</li>
                          <li>✅ Defense Strategy (Insurance & Protection)</li>
                          <li>✅ Savings vs Spending (Budget Analysis)</li>
                          <li>✅ Final Report Review</li>
                        </ul>

                        <p>Click the button below to review the complete case and provide your expert guidance:</p>
                        <div style="text-align: center;">
                          <a href="${caseUrl}" class="button">Review Client Case</a>
                        </div>

                        <p style="margin-top: 30px;">
                          Best regards,<br>
                          FNA App
                        </p>
                      </div>
                      <div class="footer">
                        <p>© ${new Date().getFullYear()} FNA App. All rights reserved.</p>
                        <p>This is an automated notification.</p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
            })
            console.log(`[v0] Completion notification sent to advisor: ${advisor.email}`)
          } catch (emailError) {
            console.error(`[v0] Failed to send email to ${advisor.email}:`, emailError)
          }

          // Update case status to in_review
          await supabase.from("case_status").upsert(
            {
              user_id: user.id,
              status: "in_review",
              last_reviewed_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            },
          )

          console.log("[v0] Advisor notification sent and case status updated to in_review")
        }
      } else {
        console.log("[v0] No advisor assigned to this client, skipping notification")
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in save-final-report API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
