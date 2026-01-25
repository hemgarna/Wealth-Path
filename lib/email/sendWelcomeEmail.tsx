import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendWelcomeEmail(to: string, name: string, role: "advisor" | "client") {
  console.log("[v0] SENDGRID_API_KEY available:", !!process.env.SENDGRID_API_KEY)
  console.log("[v0] Sending welcome email to:", to, "role:", role)

  try {
    const subject =
      role === "advisor"
        ? "Welcome to FNA App - Advisor Account Created"
        : "Welcome to FNA App - Your Financial Journey Begins"

    const html =
      role === "advisor"
        ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to FNA App, ${name}!</h2>
          <p>Your financial advisor account has been successfully created.</p>
          <p>You can now log in to manage your clients and help them with their financial planning needs.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Log in to your advisor dashboard</li>
            <li>Create client accounts</li>
            <li>Review client assessments and reports</li>
            <li>Track client progress</li>
          </ul>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>FNA App Team</p>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to FNA App, ${name}!</h2>
          <p>Your account has been successfully created by your financial advisor.</p>
          <p>You can now log in to start your comprehensive financial assessment.</p>
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Complete your financial questionnaire</li>
            <li>Receive personalized financial analysis</li>
            <li>Get tailored recommendations</li>
            <li>Track your financial progress</li>
          </ul>
          <p>Your advisor will guide you through the process and answer any questions you may have.</p>
          <p>Best regards,<br>FNA App Team</p>
        </div>
      `

    const fromEmail = "noreply@fna-app.com" // Verified SendGrid sender
    const response = await sgMail.send({
      to,
      from: fromEmail,
      subject,
      html,
    })

    console.log("[v0] SendGrid response:", response)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] SendGrid error:", error.response?.body || error)
    return { success: false, error }
  }
}
