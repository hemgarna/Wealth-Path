import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caseId, advisorId, financialGoals, growthStrategy, defenseStrategy, savingsVsSpending, finalReport } =
      await request.json()

    console.log("[v0] Saving advisor analysis for case:", caseId)

    const ADVISOR_FINANCIAL_GOALS_COLUMNS = [
      "current_age",
      "retirement_age",
      "years_to_retirement",
      "retirement_begin_year",
      "retirement_end_year",
      "monthly_retirement_income_today",
      "annual_retirement_income_today",
      "annual_retirement_income_pretax",
      "annual_retirement_income_inflation",
      "total_monthly_expenses",
      "children",
      "special_needs_description",
      "monthly_groceries",
      "monthly_home_taxes",
      "monthly_utilities",
      "monthly_home_insurance",
      "monthly_entertainment",
      "monthly_home_repairs",
      "monthly_maintenance",
      "monthly_car_insurance",
      "monthly_hoa",
      "federal_tax_last_year",
      "federal_tax_expected_this_year",
      "current_net_worth",
      "projected_net_worth_retirement",
      "top_priorities",
      "healthcare_philosophy",
      "ltc_begin_year",
      "ltc_end_year",
      "ltc_years_from_today",
      "has_ltc_insurance",
      "special_needs_amount",
      "special_needs_begin_year",
      "special_needs_end_year",
      "special_needs_years",
      "charity_amount",
      "charity_begin_year",
      "charity_end_year",
      "charity_years",
      "vacation_home_amount",
      "vacation_home_begin_year",
      "vacation_home_end_year",
      "vacation_home_years",
      "travel_amount",
      "travel_begin_year",
      "travel_end_year",
      "travel_years_from_today",
      "legacy_asset_amount",
      "legacy_asset_begin_year",
      "legacy_asset_end_year",
      "legacy_asset_years",
      "legacy_kids_home_amount",
      "legacy_kids_home_begin_year",
      "legacy_kids_home_end_year",
      "legacy_kids_home_years",
      "healthcare_outofpocket_20years",
      "longterm_care_3years",
      "other_goal_amount",
      "other_goal_begin_year",
      "other_goal_end_year",
      "other_goal_years",
      "other_goal_description",
      "completed",
      "original_form_id",
    ]

    const ADVISOR_DEFENSE_STRATEGY_COLUMNS = [
      "completed",
      "work_life_coverage_self",
      "has_work_life_self",
      "original_form_id",
      "work_life_coverage_spouse",
      "work_life_employer_paid_spouse",
      "work_life_monthly_premium_spouse",
      "has_personal_life_self",
      "personal_life_coverage_self",
      "personal_life_premium_self",
      "personal_life_start_year_self",
      "personal_life_expiration_self",
      "personal_life_is_cash_value_self",
      "personal_life_cash_value_self",
      "has_personal_life_spouse",
      "personal_life_coverage_spouse",
      "personal_life_premium_spouse",
      "personal_life_start_year_spouse",
      "personal_life_expiration_spouse",
      "personal_life_is_cash_value_spouse",
      "personal_life_cash_value_spouse",
      "has_work_disability_self",
      "work_disability_short_term_self",
      "work_disability_long_term_self",
      "work_disability_monthly_benefit_self",
      "has_work_disability_spouse",
      "work_disability_short_term_spouse",
      "work_disability_long_term_spouse",
      "work_disability_monthly_benefit_spouse",
      "has_ltc_self",
      "trust_fully_funded",
      "fbar_filing_date",
      "fbar_filed_this_year",
      "exceeds_fbar_threshold",
      "total_foreign_assets_usd",
      "foreign_liquid_assets",
      "foreign_permanent_assets",
      "foreign_gold",
      "foreign_bank_accounts",
      "foreign_stocks",
      "foreign_properties",
      "foreign_retirement_accounts",
      "currency_exchange_rate",
      "has_foreign_assets",
      "children_life_insurance",
      "life_insurance_gap",
      "life_insurance_need_total",
      "education_costs",
      "mortgage_x_10",
      "income_x_10",
      "total_debt",
      "umbrella_annual_premium",
      "work_disability_benefit_period_self",
      "personal_life_provider_spouse",
      "personal_life_type_spouse",
      "umbrella_coverage",
      "has_umbrella",
      "mortgage_protection_monthly_premium",
      "mortgage_protection_coverage",
      "has_mortgage_protection",
      "ltc_monthly_premium_spouse",
      "ltc_benefit_period_years_spouse",
      "ltc_provider_self",
      "ltc_provider_spouse",
      "work_disability_benefit_period_spouse",
      "mortgage_protection_provider",
      "ltc_monthly_benefit_spouse",
      "umbrella_provider",
      "guardian_name",
      "personal_life_provider_self",
      "personal_life_type_self",
      "foreign_countries",
      "has_ltc_spouse",
      "ltc_monthly_premium_self",
      "ltc_benefit_period_years_self",
      "ltc_monthly_benefit_self",
      "has_work_life_spouse",
      "work_life_monthly_premium_self",
      "work_life_employer_paid_self",
    ]

    const ADVISOR_SAVINGS_VS_SPENDING_COLUMNS = [
      "annual_gross_income",
      "federal_tax",
      "state_tax",
      "fica_medicare",
      "pre_tax_401k",
      "pre_tax_hsa",
      "espp",
      "monthly_rsu",
      "net_monthly_income",
      "monthly_mortgage_rent",
      "monthly_property_taxes",
      "monthly_home_insurance",
      "monthly_utilities",
      "monthly_hoa",
      "total_housing",
      "monthly_groceries",
      "monthly_dining_out",
      "monthly_subscriptions",
      "monthly_shopping",
      "monthly_local_travel",
      "monthly_hobbies",
      "monthly_entertainment",
      "monthly_car_insurance",
      "monthly_term_life_premiums",
      "monthly_kids_activities",
      "monthly_other_discretionary",
      "total_lifestyle",
      "monthly_401k",
      "monthly_roth_ira",
      "monthly_college_529",
      "monthly_emergency_fund",
      "monthly_cash_value_life_insurance",
      "total_retirement_savings",
      "monthly_car_loan_payment",
      "monthly_credit_card_payments",
      "monthly_other_debt_payments",
      "monthly_home_maintenance",
      "monthly_other_short_term",
      "total_short_term",
      "loans",
      "scenarios",
      "completed",
      "original_form_id",
    ]

    // Helper function to filter object to only include whitelisted columns
    const filterColumns = (obj: any, whitelist: string[]) => {
      if (!obj) return {}
      const filtered: any = {}
      whitelist.forEach((col) => {
        if (col in obj) {
          filtered[col] = obj[col]
        }
      })
      return filtered
    }

    // Save/update advisor's analyzed versions
    const results = await Promise.all([
      // Financial Goals
      financialGoals
        ? supabase.from("advisor_financial_goals").upsert(
            {
              user_id: caseId,
              advisor_id: advisorId,
              ...filterColumns(financialGoals, ADVISOR_FINANCIAL_GOALS_COLUMNS),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,advisor_id" },
          )
        : Promise.resolve({ data: null, error: null }),

      // Growth Strategy
      growthStrategy
        ? supabase.from("advisor_growth_strategy").upsert(
            {
              user_id: caseId,
              advisor_id: advisorId,
              ...(({ id, created_at, updated_at, ...rest }) => rest)(growthStrategy),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,advisor_id" },
          )
        : Promise.resolve({ data: null, error: null }),

      // Defense Strategy - Now using whitelist to only include columns that exist in advisor table
      defenseStrategy
        ? supabase.from("advisor_defense_strategy").upsert(
            {
              user_id: caseId,
              advisor_id: advisorId,
              ...filterColumns(defenseStrategy, ADVISOR_DEFENSE_STRATEGY_COLUMNS),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,advisor_id" },
          )
        : Promise.resolve({ data: null, error: null }),

      // Savings vs Spending
      savingsVsSpending
        ? supabase.from("advisor_savings_vs_spending").upsert(
            {
              user_id: caseId,
              advisor_id: advisorId,
              ...filterColumns(savingsVsSpending, ADVISOR_SAVINGS_VS_SPENDING_COLUMNS),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,advisor_id" },
          )
        : Promise.resolve({ data: null, error: null }),

      // Final Report
      finalReport
        ? supabase.from("advisor_final_report").upsert(
            {
              user_id: caseId,
              advisor_id: advisorId,
              ...(({ id, created_at, updated_at, ...rest }) => rest)(finalReport),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,advisor_id" },
          )
        : Promise.resolve({ data: null, error: null }),
    ])

    // Check for errors
    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error("[v0] Errors saving analysis:", errors)
      return NextResponse.json({ error: "Failed to save some forms", details: errors }, { status: 500 })
    }

    console.log("[v0] Analysis saved successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
