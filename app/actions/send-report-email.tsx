"use server"

import { createClient } from "@/lib/supabase/server"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function sendReportEmail(userId: string) {
  const supabase = await createClient()

  // Fetch all section data
  const [financialGoals, growthStrategy, defenseStrategy, savingsVsSpending] = await Promise.all([
    supabase.from("financial_goals").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("growth_strategy").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("defense_strategy").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("savings_vs_spending").select("*").eq("user_id", userId).maybeSingle(),
  ])

  // Get user email from auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    throw new Error("User email not found")
  }

  // Create Excel-like CSV data
  const csvData = generateCSVReport({
    financialGoals: financialGoals.data,
    growthStrategy: growthStrategy.data,
    defenseStrategy: defenseStrategy.data,
    savingsVsSpending: savingsVsSpending.data,
  })

  // Send email with CSV attachment - use verified SendGrid sender
  const fromEmail = "noreply@fna-app.com"
  
  try {
    await sgMail.send({
      from: fromEmail,
      to: process.env.ADMIN_EMAIL || "admin@yourdomain.com",
      subject: `Financial Assessment Report - ${user.email}`,
      html: `
        <h2>New Financial Assessment Completed</h2>
        <p><strong>Client Email:</strong> ${user.email}</p>
        <p><strong>Completed At:</strong> ${new Date().toLocaleString()}</p>
        <p>Please find the complete assessment details in the attached CSV file.</p>
      `,
      attachments: [
        {
          filename: `financial-assessment-${Date.now()}.csv`,
          content: Buffer.from(csvData).toString("base64"),
          type: "text/csv",
          disposition: "attachment",
        },
      ],
    })
  } catch (error) {
    console.error("[v0] Email send error:", error)
    throw error
  }

  return { success: true }
}

function generateCSVReport(data: any) {
  let csv = ""

  // Section 1: Financial Goals
  csv += "SECTION 1: FINANCIAL GOALS\n"
  csv += "Field,Value\n"
  if (data.financialGoals) {
    csv += `Name,${data.financialGoals.name || ""}\n`
    csv += `Email,${data.financialGoals.email || ""}\n`
    csv += `Phone,${data.financialGoals.phone || ""}\n`
    csv += `Current Age,${data.financialGoals.current_age || ""}\n`
    csv += `Retirement Age,${data.financialGoals.retirement_age || ""}\n`
    csv += `Annual Retirement Income (Today),${data.financialGoals.annual_retirement_income_today || ""}\n`
    csv += `Annual Retirement Income (Inflation Adjusted),${data.financialGoals.annual_retirement_income_inflation || ""}\n`
    csv += `Annual Retirement Income (Pre-Tax),${data.financialGoals.annual_retirement_income_pretax || ""}\n`
    csv += `Monthly HOA,${data.financialGoals.monthly_hoa || ""}\n`
    csv += `Travel Years From Today,${data.financialGoals.travel_years_from_today || ""}\n`
    csv += `Travel Budget,${data.financialGoals.travel_budget || ""}\n`
    csv += `Major Purchase Description,${data.financialGoals.major_purchase_description || ""}\n`
    csv += `Major Purchase Years,${data.financialGoals.major_purchase_years || ""}\n`
    csv += `Major Purchase Amount,${data.financialGoals.major_purchase_amount || ""}\n`
    csv += `Charity Amount,${data.financialGoals.charity_amount || ""}\n`
    csv += `Legacy Amount,${data.financialGoals.legacy_amount || ""}\n`

    // Children data
    if (data.financialGoals.children && Array.isArray(data.financialGoals.children)) {
      csv += "\nChildren College Planning\n"
      csv += "Child Name,Current Age,Years Until College,Annual Cost,Years of College,Estimated Total Needed\n"
      data.financialGoals.children.forEach((child: any) => {
        csv += `${child.name || ""},${child.current_age || ""},${child.years_until_college || ""},${child.annual_cost || ""},${child.years_of_college || ""},${child.estimated_total_needed || ""}\n`
      })
    }
  }

  csv += "\n\n"

  // Section 2: Growth Strategy
  csv += "SECTION 2: GROWTH STRATEGY\n"
  csv += "Field,Value\n"
  if (data.growthStrategy) {
    csv += `401k Balance (Self),${data.growthStrategy.current_401k_balance_self || ""}\n`
    csv += `401k Balance (Spouse),${data.growthStrategy.current_401k_balance_spouse || ""}\n`
    csv += `401k Return Rate (Self),${data.growthStrategy.return_rate_401k_self || ""}\n`
    csv += `401k Return Rate (Spouse),${data.growthStrategy.return_rate_401k_spouse || ""}\n`
    csv += `Traditional IRA Balance (Self),${data.growthStrategy.traditional_ira_balance_self || ""}\n`
    csv += `Traditional IRA Balance (Spouse),${data.growthStrategy.traditional_ira_balance_spouse || ""}\n`
    csv += `Traditional IRA Return Rate (Self),${data.growthStrategy.return_rate_traditional_ira_self || ""}\n`
    csv += `Traditional IRA Return Rate (Spouse),${data.growthStrategy.return_rate_traditional_ira_spouse || ""}\n`
    csv += `Roth Balance (Self),${data.growthStrategy.roth_balance_self || ""}\n`
    csv += `Roth Balance (Spouse),${data.growthStrategy.roth_balance_spouse || ""}\n`
    csv += `Roth Return Rate (Self),${data.growthStrategy.return_rate_roth_self || ""}\n`
    csv += `Roth Return Rate (Spouse),${data.growthStrategy.return_rate_roth_spouse || ""}\n`
    csv += `HSA Balance (Self),${data.growthStrategy.hsa_balance_self || ""}\n`
    csv += `HSA Balance (Spouse),${data.growthStrategy.hsa_balance_spouse || ""}\n`
    csv += `HSA Return Rate (Self),${data.growthStrategy.return_rate_hsa_self || ""}\n`
    csv += `HSA Return Rate (Spouse),${data.growthStrategy.return_rate_hsa_spouse || ""}\n`
    csv += `Brokerage Balance,${data.growthStrategy.brokerage_balance || ""}\n`
    csv += `Brokerage Return Rate,${data.growthStrategy.return_rate_brokerage || ""}\n`
    csv += `Primary Home Value,${data.growthStrategy.primary_home_value || ""}\n`
    csv += `Primary Home Mortgage Balance,${data.growthStrategy.primary_home_mortgage_balance || ""}\n`
    csv += `Primary Home Monthly Payment,${data.growthStrategy.primary_home_monthly_payment || ""}\n`
    csv += `Rental Property Value,${data.growthStrategy.rental_property_value || ""}\n`
    csv += `Rental Monthly Income,${data.growthStrategy.rental_monthly_income || ""}\n`
  }

  csv += "\n\n"

  // Section 3: Defense Strategy
  csv += "SECTION 3: DEFENSE STRATEGY\n"
  csv += "Field,Value\n"
  if (data.defenseStrategy) {
    csv += `Has Life Insurance (Self),${data.defenseStrategy.has_life_insurance_self ? "Yes" : "No"}\n`
    csv += `Life Coverage Amount (Self),${data.defenseStrategy.life_coverage_self || ""}\n`
    csv += `Has Life Insurance (Spouse),${data.defenseStrategy.has_life_insurance_spouse ? "Yes" : "No"}\n`
    csv += `Life Coverage Amount (Spouse),${data.defenseStrategy.life_coverage_spouse || ""}\n`
    csv += `Has Disability Insurance (Self),${data.defenseStrategy.has_disability_insurance_self ? "Yes" : "No"}\n`
    csv += `Disability Monthly Benefit (Self),${data.defenseStrategy.disability_monthly_benefit_self || ""}\n`
    csv += `Has Disability Insurance (Spouse),${data.defenseStrategy.has_disability_insurance_spouse ? "Yes" : "No"}\n`
    csv += `Disability Monthly Benefit (Spouse),${data.defenseStrategy.disability_monthly_benefit_spouse || ""}\n`
    csv += `Has LTC Insurance (Self),${data.defenseStrategy.has_ltc_insurance_self ? "Yes" : "No"}\n`
    csv += `LTC Monthly Benefit (Self),${data.defenseStrategy.ltc_monthly_benefit_self || ""}\n`
    csv += `Has LTC Insurance (Spouse),${data.defenseStrategy.has_ltc_insurance_spouse ? "Yes" : "No"}\n`
    csv += `LTC Monthly Benefit (Spouse),${data.defenseStrategy.ltc_monthly_benefit_spouse || ""}\n`
    csv += `Has Umbrella Insurance,${data.defenseStrategy.has_umbrella_insurance ? "Yes" : "No"}\n`
    csv += `Umbrella Coverage Amount,${data.defenseStrategy.umbrella_coverage_amount || ""}\n`
    csv += `Has Trust,${data.defenseStrategy.has_trust ? "Yes" : "No"}\n`
    csv += `Trust Fully Funded,${data.defenseStrategy.trust_fully_funded ? "Yes" : "No"}\n`
    csv += `Has Foreign Financial Assets,${data.defenseStrategy.has_foreign_financial_assets ? "Yes" : "No"}\n`
    csv += `FBAR Filed This Year,${data.defenseStrategy.fbar_filed_this_year ? "Yes" : "No"}\n`
  }

  csv += "\n\n"

  // Section 4: Savings vs Spending
  csv += "SECTION 4: SAVINGS VS SPENDING\n"
  csv += "Field,Value\n"
  if (data.savingsVsSpending) {
    csv += `Gross Monthly Income (Self),${data.savingsVsSpending.gross_monthly_income_self || ""}\n`
    csv += `Gross Monthly Income (Spouse),${data.savingsVsSpending.gross_monthly_income_spouse || ""}\n`
    csv += `Federal Tax Rate,${data.savingsVsSpending.federal_tax_rate || ""}\n`
    csv += `State Tax Rate,${data.savingsVsSpending.state_tax_rate || ""}\n`
    csv += `FICA Tax Rate,${data.savingsVsSpending.fica_tax_rate || ""}\n`
    csv += `Monthly Mortgage/Rent,${data.savingsVsSpending.monthly_mortgage_rent || ""}\n`
    csv += `Monthly Property Taxes,${data.savingsVsSpending.monthly_property_taxes || ""}\n`
    csv += `Monthly Home Insurance,${data.savingsVsSpending.monthly_home_insurance || ""}\n`
    csv += `Monthly HOA,${data.savingsVsSpending.monthly_hoa || ""}\n`
    csv += `Total Housing,${data.savingsVsSpending.total_housing || ""}\n`
    csv += `Monthly 401k Contribution (Self),${data.savingsVsSpending.monthly_401k_contribution_self || ""}\n`
    csv += `Monthly 401k Contribution (Spouse),${data.savingsVsSpending.monthly_401k_contribution_spouse || ""}\n`
    csv += `Monthly Roth Contribution (Self),${data.savingsVsSpending.monthly_roth_contribution_self || ""}\n`
    csv += `Monthly Roth Contribution (Spouse),${data.savingsVsSpending.monthly_roth_contribution_spouse || ""}\n`
    csv += `Monthly HSA Contribution (Self),${data.savingsVsSpending.monthly_hsa_contribution_self || ""}\n`
    csv += `Monthly HSA Contribution (Spouse),${data.savingsVsSpending.monthly_hsa_contribution_spouse || ""}\n`
    csv += `Monthly Brokerage Contribution,${data.savingsVsSpending.monthly_brokerage_contribution || ""}\n`
    csv += `Total Retirement Savings,${data.savingsVsSpending.total_retirement_savings || ""}\n`
    csv += `Monthly College Savings,${data.savingsVsSpending.monthly_college_savings || ""}\n`
    csv += `Monthly Charity,${data.savingsVsSpending.monthly_charity || ""}\n`
    csv += `Total Savings,${data.savingsVsSpending.total_savings || ""}\n`
    csv += `Monthly Discretionary Spending,${data.savingsVsSpending.monthly_discretionary_spending || ""}\n`

    // Loans data
    if (data.savingsVsSpending.loans && Array.isArray(data.savingsVsSpending.loans)) {
      csv += "\nLoans\n"
      csv += "Loan Type,Balance,Monthly Payment,APR\n"
      data.savingsVsSpending.loans.forEach((loan: any) => {
        csv += `${loan.type || ""},${loan.balance || ""},${loan.monthly_payment || ""},${loan.apr || ""}\n`
      })
    }
  }

  return csv
}
