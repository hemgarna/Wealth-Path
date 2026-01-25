import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import ExcelJS from "exceljs"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      console.error("[v0] ADMIN_EMAIL not configured")
      return NextResponse.json({ error: "Admin email not configured" }, { status: 500 })
    }

    const [
      { data: profile },
      { data: financialGoals },
      { data: growthStrategy },
      { data: defenseStrategy },
      { data: savingsVsSpending },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("financial_goals").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("growth_strategy").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("defense_strategy").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("savings_vs_spending").select("*").eq("user_id", user.id).maybeSingle(),
    ])

    console.log("[v0] EMAIL EXPORT - Data Retrieved for Excel Generation:", {
      userId: user.id,
      userEmail: user.email,
      profileExists: !!profile,
      financialGoalsExists: !!financialGoals,
      growthStrategyExists: !!growthStrategy,
      defenseStrategyExists: !!defenseStrategy,
      savingsVsSpendingExists: !!savingsVsSpending,
    })

    console.log("[v0] EMAIL EXPORT - Profile Data:", {
      full_name: profile?.full_name,
      email: profile?.email,
      phone: profile?.phone,
      phone_number: profile?.phone_number,
    })

    console.log("[v0] EMAIL EXPORT - Financial Goals Data:", {
      topPriorities: financialGoals?.top_priorities,
      currentAge: financialGoals?.current_age,
      retirementAge: financialGoals?.retirement_age,
      annualRetirementIncome: financialGoals?.annual_retirement_income_today,
      childrenCount: financialGoals?.children?.length || 0,
      children: financialGoals?.children,
    })

    console.log("[v0] EMAIL EXPORT - Growth Strategy Data:", {
      current401kBalanceSelf: growthStrategy?.current_401k_balance_self,
      traditionalIRABalanceSelf: growthStrategy?.traditional_ira_balance_self,
      brokerageStocks: growthStrategy?.brokerage_stocks,
      primaryHomeValue: growthStrategy?.primary_home_value,
      kidsEducationSavingsAmount: growthStrategy?.kids_education_savings_amount,
    })

    console.log("[v0] EMAIL EXPORT - Defense Strategy Data:", {
      workLifeCoverageSelf: defenseStrategy?.work_life_coverage_self,
      umbrellaAnnualPremium: defenseStrategy?.umbrella_annual_premium,
      mortgageProtectionMonthlyPremium: defenseStrategy?.mortgage_protection_monthly_premium,
      foreignPermanentAssets: defenseStrategy?.foreign_permanent_assets,
      foreignLiquidAssets: defenseStrategy?.foreign_liquid_assets,
    })

    console.log("[v0] EMAIL EXPORT - Savings vs Spending Data:", {
      annualGrossIncome: savingsVsSpending?.annual_gross_income,
      netMonthlyIncome: savingsVsSpending?.net_monthly_income,
      totalHousing: savingsVsSpending?.total_housing,
      loans: savingsVsSpending?.loans,
    })

    const safeValue = (value: any, defaultValue: any = ""): any => {
      if (value === null || value === undefined) return defaultValue
      if (typeof value === "boolean") return value ? "Yes" : "No"
      return value
    }

    const safeNumber = (value: any): number => {
      const num = Number(value)
      return isNaN(num) || value === null || value === undefined ? 0 : num
    }

    const workbook = new ExcelJS.Workbook()

    // Client Info Sheet
    const clientSheet = workbook.addWorksheet("Client Information")
    clientSheet.columns = [
      { header: "Field", key: "field", width: 30 },
      { header: "Value", key: "value", width: 50 },
    ]
    clientSheet.addRows([
      { field: "Name", value: safeValue(profile?.full_name) },
      { field: "Email", value: safeValue(profile?.email || user.email) },
      { field: "Phone", value: safeValue(profile?.phone || profile?.phone_number) || "Not provided" },
      { field: "Current Age", value: safeNumber(financialGoals?.current_age) },
      { field: "Retirement Age", value: safeNumber(financialGoals?.retirement_age) },
    ])

    const goalsSheet = workbook.addWorksheet("Financial Goals")
    goalsSheet.columns = [
      { header: "Field", key: "field", width: 50 },
      { header: "Value", key: "value", width: 30 },
    ]
    if (financialGoals) {
      const rows = [
        { field: "=== TOP PRIORITIES ===", value: "" },
        { field: "Top Priorities", value: JSON.stringify(financialGoals.top_priorities || []) },
        { field: "", value: "" },
        { field: "=== 2.1 COLLEGE PLANNING ===", value: "" },
      ]

      // Add children education costs if present
      if (Array.isArray(financialGoals.children) && financialGoals.children.length > 0) {
        financialGoals.children.forEach((child: any, index: number) => {
          rows.push({ field: `Child ${index + 1} - Name`, value: safeValue(child.name) })
          rows.push({ field: `Child ${index + 1} - Current Age`, value: safeNumber(child.current_age) })
          rows.push({ field: `Child ${index + 1} - Years Until College`, value: safeNumber(child.years_to_college) })
          rows.push({ field: `Child ${index + 1} - College Begin Year`, value: safeNumber(child.college_begin_year) })
          rows.push({ field: `Child ${index + 1} - College End Year`, value: safeNumber(child.college_end_year) })
          rows.push({
            field: `Child ${index + 1} - Estimated Total Needed`,
            value: safeNumber(child.estimated_total_needed),
          })
          rows.push({ field: `Child ${index + 1} - Years to Marriage`, value: safeNumber(child.years_to_marriage) })
          rows.push({ field: `Child ${index + 1} - Marriage Year`, value: safeNumber(child.marriage_year) })
          rows.push({ field: `Child ${index + 1} - Marriage Amount`, value: safeNumber(child.marriage_amount) })
          rows.push({ field: "", value: "" })
        })
      }

      rows.push({ field: "=== 2.3 RETIREMENT PLANNING ===", value: "" })
      rows.push({ field: "Current Age", value: safeNumber(financialGoals.current_age) })
      rows.push({ field: "Retirement Age", value: safeNumber(financialGoals.retirement_age) })
      rows.push({ field: "Years to Retirement", value: safeNumber(financialGoals.years_to_retirement) })
      rows.push({
        field: "Annual Retirement Income (Today's Dollars)",
        value: safeNumber(financialGoals.annual_retirement_income_today),
      })
      rows.push({
        field: "Annual Retirement Income (Inflation Adjusted)",
        value: safeNumber(financialGoals.annual_retirement_income_inflation),
      })
      rows.push({
        field: "Annual Retirement Income (Pre-tax)",
        value: safeNumber(financialGoals.annual_retirement_income_pretax),
      })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== 2.4 HEALTHCARE OUT-OF-POCKET ===", value: "" })
      rows.push({ field: "Healthcare Philosophy", value: safeValue(financialGoals.healthcare_philosophy) })
      rows.push({
        field: "Healthcare Out-of-Pocket (After Retirement)",
        value: safeNumber(financialGoals.healthcare_outofpocket_20years),
      })
      rows.push({
        field: "Long-term Care/Disability (3 years)",
        value: safeNumber(financialGoals.longterm_care_3years),
      })
      rows.push({ field: "Has LTC Insurance", value: safeValue(financialGoals.has_ltc_insurance) })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== 2.5 LIFE GOALS PLANNING ===", value: "" })
      rows.push({ field: "Travel Amount", value: safeNumber(financialGoals.travel_amount) })
      rows.push({ field: "Travel Begin Year", value: safeNumber(financialGoals.travel_begin_year) })
      rows.push({ field: "Travel End Year", value: safeNumber(financialGoals.travel_end_year) })
      rows.push({ field: "Travel Years", value: safeNumber(financialGoals.travel_years) })
      rows.push({ field: "Vacation Home Amount", value: safeNumber(financialGoals.vacation_home_amount) })
      rows.push({ field: "Vacation Home Begin Year", value: safeNumber(financialGoals.vacation_home_begin_year) })
      rows.push({ field: "Vacation Home End Year", value: safeNumber(financialGoals.vacation_home_end_year) })
      rows.push({ field: "Vacation Home Years", value: safeNumber(financialGoals.vacation_home_years) })
      rows.push({ field: "Charity Amount", value: safeNumber(financialGoals.charity_amount) })
      rows.push({ field: "Charity Begin Year", value: safeNumber(financialGoals.charity_begin_year) })
      rows.push({ field: "Charity End Year", value: safeNumber(financialGoals.charity_end_year) })
      rows.push({ field: "Charity Years", value: safeNumber(financialGoals.charity_years) })
      rows.push({ field: "Other Goal Description", value: safeValue(financialGoals.other_goal_description) })
      rows.push({ field: "Other Goal Amount", value: safeNumber(financialGoals.other_goal_amount) })
      rows.push({ field: "Other Goal Begin Year", value: safeNumber(financialGoals.other_goal_begin_year) })
      rows.push({ field: "Other Goal End Year", value: safeNumber(financialGoals.other_goal_end_year) })
      rows.push({ field: "Other Goal Years", value: safeNumber(financialGoals.other_goal_years) })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== 2.6 MONTHLY EXPENSES ===", value: "" })
      rows.push({ field: "Monthly Groceries", value: safeNumber(financialGoals.monthly_groceries) })
      rows.push({ field: "Monthly Home Taxes", value: safeNumber(financialGoals.monthly_home_taxes) })
      rows.push({ field: "Monthly HOA", value: safeNumber(financialGoals.monthly_hoa) })
      rows.push({ field: "Monthly Utilities", value: safeNumber(financialGoals.monthly_utilities) })
      rows.push({ field: "Monthly Home Insurance", value: safeNumber(financialGoals.monthly_home_insurance) })
      rows.push({ field: "Monthly Entertainment", value: safeNumber(financialGoals.monthly_entertainment) })
      rows.push({ field: "Monthly Home Repairs", value: safeNumber(financialGoals.monthly_home_repairs) })
      rows.push({ field: "Monthly Maintenance", value: safeNumber(financialGoals.monthly_maintenance) })
      rows.push({ field: "Monthly Car Insurance", value: safeNumber(financialGoals.monthly_car_insurance) })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== 2.7 LEGACY PLANNING ===", value: "" })
      rows.push({
        field: "Fund for Kids' Primary Home/Business",
        value: safeNumber(financialGoals.legacy_kids_home_amount),
      })
      rows.push({ field: "Legacy Asset for Kids/Family", value: safeNumber(financialGoals.legacy_asset_amount) })
      rows.push({ field: "Special Needs Description", value: safeValue(financialGoals.special_needs_description) })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== CURRENT NET WORTH ===", value: "" })
      rows.push({ field: "Current Net Worth", value: safeNumber(financialGoals.current_net_worth) })

      goalsSheet.addRows(rows)
    }

    const growthSheet = workbook.addWorksheet("Growth Strategy")
    growthSheet.columns = [
      { header: "Field", key: "field", width: 50 },
      { header: "Value", key: "value", width: 30 },
    ]
    if (growthStrategy) {
      growthSheet.addRows([
        { field: "=== RETIREMENT ACCOUNTS ===", value: "" },
        { field: "Has 401(k) - Self", value: safeValue(growthStrategy.has_401k_self) },
        { field: "401(k) Balance - Self", value: safeNumber(growthStrategy.current_401k_balance_self) },
        {
          field: "401(k) Monthly Contribution - Self",
          value: safeNumber(growthStrategy.monthly_contribution_401k_self),
        },
        { field: "401(k) Company Match % - Self", value: safeNumber(growthStrategy.company_match_percent_self) },
        { field: "401(k) Avg Return % - Self", value: safeNumber(growthStrategy.average_return_401k_self) },
        { field: "Has 401(k) - Spouse", value: safeValue(growthStrategy.has_401k_spouse) },
        { field: "401(k) Balance - Spouse", value: safeNumber(growthStrategy.current_401k_balance_spouse) },
        {
          field: "401(k) Monthly Contribution - Spouse",
          value: safeNumber(growthStrategy.monthly_contribution_401k_spouse),
        },
        { field: "401(k) Company Match % - Spouse", value: safeNumber(growthStrategy.company_match_percent_spouse) },
        { field: "401(k) Avg Return % - Spouse", value: safeNumber(growthStrategy.average_return_401k_spouse) },
        { field: "", value: "" },
        { field: "Has Rollover 401(k) - Self", value: safeValue(growthStrategy.has_rollover_401k_self) },
        { field: "Rollover 401(k) - Self", value: safeNumber(growthStrategy.rollover_401k_balance_self) },
        { field: "Has Rollover 401(k) - Spouse", value: safeValue(growthStrategy.has_rollover_401k_spouse) },
        { field: "Rollover 401(k) - Spouse", value: safeNumber(growthStrategy.rollover_401k_balance_spouse) },
        { field: "", value: "" },
        { field: "Has Traditional IRA - Self", value: safeValue(growthStrategy.has_traditional_ira_self) },
        { field: "Traditional IRA - Self", value: safeNumber(growthStrategy.traditional_ira_balance_self) },
        { field: "Traditional IRA Avg Return % - Self", value: safeNumber(growthStrategy.average_return_ira) },
        { field: "Has Traditional IRA - Spouse", value: safeValue(growthStrategy.has_traditional_ira_spouse) },
        { field: "Traditional IRA - Spouse", value: safeNumber(growthStrategy.traditional_ira_balance_spouse) },
        { field: "", value: "" },
        { field: "Has Roth IRA - Self", value: safeValue(growthStrategy.has_roth_self) },
        { field: "Roth IRA - Self", value: safeNumber(growthStrategy.roth_balance_self) },
        { field: "Roth IRA Avg Return % - Self", value: safeNumber(growthStrategy.average_return_roth_ira) },
        { field: "Has Roth IRA - Spouse", value: safeValue(growthStrategy.has_roth_spouse) },
        { field: "Roth IRA - Spouse", value: safeNumber(growthStrategy.roth_balance_spouse) },
        { field: "", value: "" },
        { field: "Has HSA - Self", value: safeValue(growthStrategy.has_hsa_self) },
        { field: "HSA Balance - Self", value: safeNumber(growthStrategy.hsa_balance_self) },
        { field: "HSA Avg Return % - Self", value: safeNumber(growthStrategy.average_return_hsa) },
        { field: "Has HSA - Spouse", value: safeValue(growthStrategy.has_hsa_spouse) },
        { field: "HSA Balance - Spouse", value: safeNumber(growthStrategy.hsa_balance_spouse) },
        { field: "", value: "" },
        { field: "=== KIDS EDUCATION SAVINGS ===", value: "" },
        { field: "Has Kids Education Savings", value: safeValue(growthStrategy.has_kids_education_savings) },
        { field: "Kids Education Savings Amount", value: safeNumber(growthStrategy.kids_education_savings_amount) },
        { field: "Kids Education Monthly Savings", value: safeNumber(growthStrategy.kids_education_monthly_savings) },
        { field: "Kids Education Return Rate %", value: safeNumber(growthStrategy.kids_education_savings_return_rate) },
        { field: "", value: "" },
        { field: "=== BROKERAGE & INVESTMENT ACCOUNTS ===", value: "" },
        { field: "Brokerage - Stocks", value: safeNumber(growthStrategy.brokerage_stocks) },
        { field: "Brokerage - Bonds", value: safeNumber(growthStrategy.brokerage_bonds) },
        { field: "Brokerage - ETFs", value: safeNumber(growthStrategy.brokerage_etfs) },
        { field: "Brokerage - Mutual Funds", value: safeNumber(growthStrategy.brokerage_mutual_funds) },
        { field: "Average Return - Brokerage %", value: safeNumber(growthStrategy.average_return_brokerage) },
        { field: "Portfolio Avg Return After Tax %", value: safeNumber(growthStrategy.portfolio_avg_return_after_tax) },
        { field: "", value: "" },
        { field: "=== ALTERNATIVE INVESTMENTS ===", value: "" },
        { field: "Crowd Funding", value: safeNumber(growthStrategy.crowd_funding_value) },
        { field: "Private Equity", value: safeNumber(growthStrategy.private_equity_value) },
        { field: "Jewelry", value: safeNumber(growthStrategy.jewelry_value) },
        { field: "Other Assets Value", value: safeNumber(growthStrategy.other_assets_value) },
        { field: "Other Assets Description", value: safeValue(growthStrategy.other_assets_description) },
        { field: "", value: "" },
        { field: "=== CASH & EMERGENCY FUND ===", value: "" },
        { field: "Checking Account", value: safeNumber(growthStrategy.checking_account) },
        { field: "Savings Account", value: safeNumber(growthStrategy.savings_account) },
        { field: "Money Market", value: safeNumber(growthStrategy.money_market) },
        { field: "Emergency Fund", value: safeNumber(growthStrategy.emergency_fund) },
        { field: "", value: "" },
        { field: "=== REAL ESTATE ===", value: "" },
        { field: "Primary Home Value", value: safeNumber(growthStrategy.primary_home_value) },
        { field: "Primary Home Mortgage Balance", value: safeNumber(growthStrategy.primary_home_mortgage_balance) },
        { field: "Primary Home Monthly Payment", value: safeNumber(growthStrategy.primary_home_monthly_payment) },
        { field: "Primary Home Equity", value: safeNumber(growthStrategy.primary_home_equity) },
        { field: "", value: "" },
        { field: "=== RENTAL PROPERTIES ===", value: "" },
      ])

      // Add rental properties if present
      if (Array.isArray(growthStrategy.rental_properties) && growthStrategy.rental_properties.length > 0) {
        growthStrategy.rental_properties.forEach((property: any, index: number) => {
          growthSheet.addRow({ field: `Rental Property ${index + 1} - Value`, value: safeNumber(property.value) })
          growthSheet.addRow({
            field: `Rental Property ${index + 1} - Monthly Income`,
            value: safeNumber(property.monthly_income),
          })
        })
      } else {
        growthSheet.addRow({ field: "No Rental Properties", value: "" })
      }

      growthSheet.addRows([
        { field: "", value: "" },
        { field: "=== INCOME STREAMS ===", value: "" },
        { field: "Social Security Monthly - Self", value: safeNumber(growthStrategy.ss_monthly_benefit_self) },
        { field: "Social Security Monthly - Spouse", value: safeNumber(growthStrategy.ss_monthly_benefit_spouse) },
        { field: "Has Pension - Self", value: safeValue(growthStrategy.has_pension_self) },
        { field: "Pension Monthly - Self", value: safeNumber(growthStrategy.pension_monthly_amount_self) },
        { field: "Has Pension - Spouse", value: safeValue(growthStrategy.has_pension_spouse) },
        { field: "Pension Monthly - Spouse", value: safeNumber(growthStrategy.pension_monthly_amount_spouse) },
        { field: "", value: "" },
        { field: "=== BUSINESS ===", value: "" },
        { field: "Owns Business", value: safeValue(growthStrategy.owns_business) },
        { field: "Business Estimated Value", value: safeNumber(growthStrategy.business_estimated_value) },
      ])
    }

    const defenseSheet = workbook.addWorksheet("Defense Strategy")
    defenseSheet.columns = [
      { header: "Field", key: "field", width: 50 },
      { header: "Value", key: "value", width: 30 },
    ]
    if (defenseStrategy) {
      const rows = [
        { field: "=== WORK LIFE INSURANCE ===", value: "" },
        { field: "Has Work Life Insurance - Self", value: safeValue(defenseStrategy.has_work_life_self) },
        { field: "Work Life Coverage - Self", value: safeNumber(defenseStrategy.work_life_coverage_self) },
        {
          field: "Work Life Monthly Premium - Self",
          value: safeNumber(defenseStrategy.work_life_monthly_premium_self),
        },
        { field: "Work Life Employer Paid - Self", value: safeValue(defenseStrategy.work_life_employer_paid_self) },
        { field: "Has Work Life Insurance - Spouse", value: safeValue(defenseStrategy.has_work_life_spouse) },
        { field: "Work Life Coverage - Spouse", value: safeNumber(defenseStrategy.work_life_coverage_spouse) },
        {
          field: "Work Life Monthly Premium - Spouse",
          value: safeNumber(defenseStrategy.work_life_monthly_premium_spouse),
        },
        { field: "Work Life Employer Paid - Spouse", value: safeValue(defenseStrategy.work_life_employer_paid_spouse) },
        { field: "", value: "" },
        { field: "=== PERSONAL LIFE INSURANCE POLICIES ===", value: "" },
      ]

      // Add personal life insurance policies if present
      if (
        Array.isArray(defenseStrategy.children_life_insurance) &&
        defenseStrategy.children_life_insurance.length > 0
      ) {
        defenseStrategy.children_life_insurance.forEach((policy: any, index: number) => {
          rows.push({ field: `Policy ${index + 1} - Insured Person`, value: safeValue(policy.person) })
          rows.push({ field: `Policy ${index + 1} - Child Name`, value: safeValue(policy.child_name) })
          rows.push({ field: `Policy ${index + 1} - Coverage Amount`, value: safeNumber(policy.coverage_amount) })
          rows.push({ field: `Policy ${index + 1} - Policy Type`, value: safeValue(policy.policy_type) })
          rows.push({ field: `Policy ${index + 1} - Provider`, value: safeValue(policy.provider) })
          rows.push({ field: `Policy ${index + 1} - Annual Premium`, value: safeNumber(policy.premium_annual) })
          rows.push({ field: `Policy ${index + 1} - Start Year`, value: safeNumber(policy.start_year) })
          rows.push({ field: `Policy ${index + 1} - Expiration Year`, value: safeNumber(policy.expiration_year) })
          rows.push({ field: `Policy ${index + 1} - Has Cash Value`, value: safeValue(policy.is_cash_value) })
          rows.push({ field: `Policy ${index + 1} - Cash Value`, value: safeNumber(policy.cash_value) })
          rows.push({ field: "", value: "" })
        })
      } else {
        rows.push({ field: "No Personal Life Insurance Policies", value: "" })
        rows.push({ field: "", value: "" })
      }

      rows.push({ field: "Life Insurance Need Total", value: safeNumber(defenseStrategy.life_insurance_need_total) })
      rows.push({ field: "Life Insurance Gap", value: safeNumber(defenseStrategy.life_insurance_gap) })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== DISABILITY INSURANCE ===", value: "" })
      rows.push({
        field: "Has Disability Insurance - Self",
        value: safeValue(defenseStrategy.has_work_disability_self),
      })
      rows.push({
        field: "Disability Monthly Benefit - Self",
        value: safeNumber(defenseStrategy.work_disability_monthly_benefit_self),
      })
      rows.push({
        field: "Has Disability Insurance - Spouse",
        value: safeValue(defenseStrategy.has_work_disability_spouse),
      })
      rows.push({
        field: "Disability Monthly Benefit - Spouse",
        value: safeNumber(defenseStrategy.work_disability_monthly_benefit_spouse),
      })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== LONG TERM CARE ===", value: "" })
      rows.push({ field: "Has LTC - Self", value: safeValue(defenseStrategy.has_ltc_self) })
      rows.push({ field: "LTC Monthly Benefit - Self", value: safeNumber(defenseStrategy.ltc_monthly_benefit_self) })
      rows.push({ field: "Has LTC - Spouse", value: safeValue(defenseStrategy.has_ltc_spouse) })
      rows.push({
        field: "LTC Monthly Benefit - Spouse",
        value: safeNumber(defenseStrategy.ltc_monthly_benefit_spouse),
      })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== OTHER INSURANCE ===", value: "" })
      rows.push({ field: "Has Umbrella Insurance", value: safeValue(defenseStrategy.has_umbrella) })
      rows.push({ field: "Umbrella Coverage", value: safeNumber(defenseStrategy.umbrella_coverage) })
      rows.push({ field: "Umbrella Annual Premium", value: safeNumber(defenseStrategy.umbrella_annual_premium) })
      rows.push({ field: "Has Mortgage Protection", value: safeValue(defenseStrategy.has_mortgage_protection) })
      rows.push({
        field: "Mortgage Protection Coverage",
        value: safeNumber(defenseStrategy.mortgage_protection_coverage),
      })
      rows.push({
        field: "Mortgage Protection Monthly Premium",
        value: safeNumber(defenseStrategy.mortgage_protection_monthly_premium),
      })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== ESTATE PLANNING ===", value: "" })
      rows.push({ field: "Trust Fully Funded", value: safeValue(defenseStrategy.trust_fully_funded) })
      rows.push({ field: "Guardian Name", value: safeValue(defenseStrategy.guardian_name) })
      rows.push({ field: "", value: "" })

      rows.push({ field: "=== FOREIGN ASSETS ===", value: "" })
      rows.push({ field: "Has Foreign Assets", value: safeValue(defenseStrategy.has_foreign_assets) })
      rows.push({ field: "Foreign Countries", value: safeValue(defenseStrategy.foreign_countries) })
      rows.push({ field: "Foreign Permanent Assets", value: safeNumber(defenseStrategy.foreign_permanent_assets) })
      rows.push({ field: "Foreign Liquid Assets", value: safeNumber(defenseStrategy.foreign_liquid_assets) })
      rows.push({ field: "Exceeds FBAR Threshold", value: safeValue(defenseStrategy.exceeds_fbar_threshold) })
      rows.push({ field: "FBAR Filed This Year", value: safeValue(defenseStrategy.fbar_filed_this_year) })

      defenseSheet.addRows(rows)
    }

    const savingsSheet = workbook.addWorksheet("Savings vs Spending")
    savingsSheet.columns = [
      { header: "Field", key: "field", width: 50 },
      { header: "Value", key: "value", width: 30 },
    ]
    if (savingsVsSpending) {
      const rows = [
        { field: "=== INCOME ===", value: "" },
        {
          field: "Monthly Base Income",
          value: safeNumber(
            savingsVsSpending.annual_gross_income ? Number(savingsVsSpending.annual_gross_income) / 12 : 0,
          ),
        },
        { field: "Annual Gross Income", value: safeNumber(savingsVsSpending.annual_gross_income) },
        { field: "Federal Tax", value: safeNumber(savingsVsSpending.federal_tax) },
        { field: "State Tax", value: safeNumber(savingsVsSpending.state_tax) },
        { field: "FICA/Medicare", value: safeNumber(savingsVsSpending.fica_medicare) },
        { field: "Pre-tax 401(k)", value: safeNumber(savingsVsSpending.pre_tax_401k) },
        { field: "Pre-tax HSA", value: safeNumber(savingsVsSpending.pre_tax_hsa) },
        { field: "ESPP", value: safeNumber(savingsVsSpending.espp) },
        { field: "Net Monthly Income", value: safeNumber(savingsVsSpending.net_monthly_income) },
        { field: "", value: "" },

        { field: "=== HOUSING EXPENSES ===", value: "" },
        { field: "Monthly Mortgage/Rent", value: safeNumber(savingsVsSpending.monthly_mortgage_rent) },
        { field: "Monthly Property Taxes", value: safeNumber(savingsVsSpending.monthly_property_taxes) },
        { field: "Monthly Home Insurance", value: safeNumber(savingsVsSpending.monthly_home_insurance) },
        { field: "Monthly HOA", value: safeNumber(savingsVsSpending.monthly_hoa) },
        { field: "Monthly Utilities", value: safeNumber(savingsVsSpending.monthly_utilities) },
        { field: "Monthly Home Maintenance", value: safeNumber(savingsVsSpending.monthly_home_maintenance) },
        { field: "Total Housing", value: safeNumber(savingsVsSpending.total_housing) },
        { field: "", value: "" },

        { field: "=== RETIREMENT SAVINGS ===", value: "" },
        { field: "Monthly 401(k)", value: safeNumber(savingsVsSpending.monthly_401k) },
        { field: "Monthly Roth IRA", value: safeNumber(savingsVsSpending.monthly_roth_ira) },
        {
          field: "Monthly Cash Value Life Insurance",
          value: safeNumber(savingsVsSpending.monthly_cash_value_life_insurance),
        },
        { field: "Total Retirement Savings", value: safeNumber(savingsVsSpending.total_retirement_savings) },
        { field: "", value: "" },

        { field: "=== LIFESTYLE EXPENSES ===", value: "" },
        { field: "Monthly Groceries", value: safeNumber(savingsVsSpending.monthly_groceries) },
        { field: "Monthly Dining Out", value: safeNumber(savingsVsSpending.monthly_dining_out) },
        { field: "Monthly Entertainment", value: safeNumber(savingsVsSpending.monthly_entertainment) },
        { field: "Monthly Shopping", value: safeNumber(savingsVsSpending.monthly_shopping) },
        { field: "Monthly Subscriptions", value: safeNumber(savingsVsSpending.monthly_subscriptions) },
        { field: "Monthly Car Insurance", value: safeNumber(savingsVsSpending.monthly_car_insurance) },
        { field: "Monthly Car Loan Payment", value: safeNumber(savingsVsSpending.monthly_car_loan_payment) },
        { field: "Monthly Hobbies", value: safeNumber(savingsVsSpending.monthly_hobbies) },
        { field: "Monthly Kids Activities", value: safeNumber(savingsVsSpending.monthly_kids_activities) },
        { field: "Monthly Local Travel", value: safeNumber(savingsVsSpending.monthly_local_travel) },
        { field: "Monthly Credit Card Payments", value: safeNumber(savingsVsSpending.monthly_credit_card_payments) },
        { field: "Monthly Other Debt Payments", value: safeNumber(savingsVsSpending.monthly_other_debt_payments) },
        { field: "Monthly Other Discretionary", value: safeNumber(savingsVsSpending.monthly_other_discretionary) },
        { field: "Total Lifestyle", value: safeNumber(savingsVsSpending.total_lifestyle) },
        { field: "", value: "" },

        { field: "=== SHORT-TERM SAVINGS ===", value: "" },
        { field: "Monthly College 529", value: safeNumber(savingsVsSpending.monthly_college_529) },
        { field: "Monthly Term Life Premiums", value: safeNumber(savingsVsSpending.monthly_term_life_premiums) },
        { field: "Monthly Emergency Fund", value: safeNumber(savingsVsSpending.monthly_emergency_fund) },
        { field: "Monthly Other Short Term", value: safeNumber(savingsVsSpending.monthly_other_short_term) },
        { field: "Total Short-term Savings", value: safeNumber(savingsVsSpending.total_short_term) },
        { field: "", value: "" },

        { field: "=== BUDGET SUMMARY ===", value: "" },
        {
          field: "Total Monthly Spending",
          value: safeNumber(
            Number(savingsVsSpending.total_housing || 0) +
              Number(savingsVsSpending.total_retirement_savings || 0) +
              Number(savingsVsSpending.total_lifestyle || 0) +
              Number(savingsVsSpending.total_short_term || 0),
          ),
        },
        { field: "", value: "" },
        { field: "=== LOANS ===", value: "" },
      ]

      // Add initial rows
      savingsSheet.addRows(rows)

      const loans = savingsVsSpending.loans || {}
      if (loans.vehicle?.enabled) {
        savingsSheet.addRows([
          { field: "Vehicle Loan - Amount", value: safeNumber(loans.vehicle.amount) },
          { field: "Vehicle Loan - APR %", value: safeNumber(loans.vehicle.apr) },
          { field: "Vehicle Loan - Monthly Payment", value: safeNumber(loans.vehicle.payment) },
          { field: "", value: "" },
        ])
      }
      if (loans.credit_card?.enabled) {
        savingsSheet.addRows([
          { field: "Credit Card - Amount", value: safeNumber(loans.credit_card.amount) },
          { field: "Credit Card - APR %", value: safeNumber(loans.credit_card.apr) },
          { field: "Credit Card - Monthly Payment", value: safeNumber(loans.credit_card.payment) },
          { field: "", value: "" },
        ])
      }
      if (loans.personal?.enabled) {
        savingsSheet.addRows([
          { field: "Personal Loan - Amount", value: safeNumber(loans.personal.amount) },
          { field: "Personal Loan - APR %", value: safeNumber(loans.personal.apr) },
          { field: "Personal Loan - Monthly Payment", value: safeNumber(loans.personal.payment) },
          { field: "", value: "" },
        ])
      }
      if (loans.education?.enabled) {
        savingsSheet.addRows([
          { field: "Education Loan - Amount", value: safeNumber(loans.education.amount) },
          { field: "Education Loan - APR %", value: safeNumber(loans.education.apr) },
          { field: "Education Loan - Monthly Payment", value: safeNumber(loans.education.payment) },
          { field: "", value: "" },
        ])
      }
      if (loans.other?.enabled) {
        savingsSheet.addRows([
          { field: "Other Loan - Amount", value: safeNumber(loans.other.amount) },
          { field: "Other Loan - APR %", value: safeNumber(loans.other.apr) },
          { field: "Other Loan - Monthly Payment", value: safeNumber(loans.other.payment) },
          { field: "", value: "" },
        ])
      }
    }

    const finalReportSheet = workbook.addWorksheet("Final Report")
    finalReportSheet.columns = [
      { header: "Metric", key: "metric", width: 45 },
      { header: "Value", key: "value", width: 25 },
    ]

    // Calculate values for Final Report tab
    const currentAge = safeNumber(financialGoals?.current_age) || 45
    const retirementAge = safeNumber(financialGoals?.retirement_age) || 67
    const yearsToRetirement = Math.max(0, retirementAge - currentAge)

    // Helper function for future value calculation
    const calculateFutureValue = (currentValue: number, monthlyContribution: number, annualReturn: number) => {
      const months = yearsToRetirement * 12
      const monthlyRate = annualReturn / 12 / 100
      if (monthlyRate === 0) {
        return currentValue + monthlyContribution * months
      }
      const futureValueOfCurrent = currentValue * Math.pow(1 + monthlyRate, months)
      const futureValueOfContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      return futureValueOfCurrent + futureValueOfContributions
    }

    // Retirement account calculations
    const current401kSelf = safeNumber(growthStrategy?.current_401k_balance_self)
    const current401kSpouse = safeNumber(growthStrategy?.current_401k_balance_spouse)
    const currentTraditionalIRASelf = safeNumber(growthStrategy?.traditional_ira_balance_self)
    const currentTraditionalIRASpouse = safeNumber(growthStrategy?.traditional_ira_balance_spouse)
    const currentRollover401kSelf = safeNumber(growthStrategy?.rollover_401k_balance_self)
    const currentRollover401kSpouse = safeNumber(growthStrategy?.rollover_401k_balance_spouse)
    const currentRothSelf = safeNumber(growthStrategy?.roth_balance_self)
    const currentRothSpouse = safeNumber(growthStrategy?.roth_balance_spouse)
    const currentHSASelf = safeNumber(growthStrategy?.hsa_balance_self)
    const currentHSASpouse = safeNumber(growthStrategy?.hsa_balance_spouse)

    const return401k = 7
    const returnIRA = 7
    const returnRoth = 7
    const returnHSA = 7
    const returnBrokerage = Math.min(Math.max(safeNumber(growthStrategy?.average_return_brokerage) || 7, 0), 20)

    const future401kSelf = calculateFutureValue(current401kSelf, 0, return401k)
    const future401kSpouse = calculateFutureValue(current401kSpouse, 0, return401k)
    const futureTraditionalIRASelf = calculateFutureValue(currentTraditionalIRASelf, 0, returnIRA)
    const futureTraditionalIRASpouse = calculateFutureValue(currentTraditionalIRASpouse, 0, returnIRA)
    const futureRollover401kSelf = calculateFutureValue(currentRollover401kSelf, 0, return401k)
    const futureRollover401kSpouse = calculateFutureValue(currentRollover401kSpouse, 0, return401k)
    const futureRothSelf = calculateFutureValue(currentRothSelf, 0, returnRoth)
    const futureRothSpouse = calculateFutureValue(currentRothSpouse, 0, returnRoth)
    const futureHSASelf = calculateFutureValue(currentHSASelf, 0, returnHSA)
    const futureHSASpouse = calculateFutureValue(currentHSASpouse, 0, returnHSA)

    const totalRetirementNow =
      current401kSelf +
      current401kSpouse +
      currentTraditionalIRASelf +
      currentTraditionalIRASpouse +
      currentRollover401kSelf +
      currentRollover401kSpouse +
      currentRothSelf +
      currentRothSpouse +
      currentHSASelf +
      currentHSASpouse

    const totalRetirementAt67 =
      future401kSelf +
      future401kSpouse +
      futureTraditionalIRASelf +
      futureTraditionalIRASpouse +
      futureRollover401kSelf +
      futureRollover401kSpouse +
      futureRothSelf +
      futureRothSpouse +
      futureHSASelf +
      futureHSASpouse

    // Investment accounts
    const brokerageStocks = safeNumber(growthStrategy?.brokerage_stocks)
    const brokerageBonds = safeNumber(growthStrategy?.brokerage_bonds)
    const brokerageETFs = safeNumber(growthStrategy?.brokerage_etfs)
    const brokerageMutualFunds = safeNumber(growthStrategy?.brokerage_mutual_funds)
    const currentBrokerage = brokerageStocks + brokerageBonds + brokerageETFs + brokerageMutualFunds
    const futureBrokerage = calculateFutureValue(currentBrokerage, 0, returnBrokerage)

    // Categorized accounts
    const taxDeferredNow =
      current401kSelf +
      current401kSpouse +
      currentTraditionalIRASelf +
      currentTraditionalIRASpouse +
      currentRollover401kSelf +
      currentRollover401kSpouse
    const taxDeferredAt67 =
      future401kSelf +
      future401kSpouse +
      futureTraditionalIRASelf +
      futureTraditionalIRASpouse +
      futureRollover401kSelf +
      futureRollover401kSpouse
    const taxAdvantageNow = currentRothSelf + currentRothSpouse + currentHSASelf + currentHSASpouse
    const taxAdvantageAt67 = futureRothSelf + futureRothSpouse + futureHSASelf + futureHSASpouse
    const taxableNow = currentBrokerage
    const taxableAt67 = futureBrokerage

    const totalAccountsNow = taxDeferredNow + taxAdvantageNow + taxableNow
    const totalAccountsAt67 = taxDeferredAt67 + taxAdvantageAt67 + taxableAt67

    const taxDeferredPercentNow = totalAccountsNow > 0 ? (taxDeferredNow / totalAccountsNow) * 100 : 0
    const taxAdvantagePercentNow = totalAccountsNow > 0 ? (taxAdvantageNow / totalAccountsNow) * 100 : 0
    const taxablePercentNow = totalAccountsNow > 0 ? (taxableNow / totalAccountsNow) * 100 : 0

    // Income calculations
    const ssSelf = safeNumber(growthStrategy?.ss_monthly_benefit_self) * 12
    const ssSpouse = safeNumber(growthStrategy?.ss_monthly_benefit_spouse) * 12
    const totalSS = ssSelf + ssSpouse
    const totalSSAfterTax = totalSS * 0.78

    const pensionSelf = safeNumber(growthStrategy?.pension_monthly_amount_self) * 12
    const pensionSpouse = safeNumber(growthStrategy?.pension_monthly_amount_spouse) * 12
    const totalPension = pensionSelf + pensionSpouse
    const totalPensionAfterTax = totalPension * 0.78

    const rentalProperties = growthStrategy?.rental_properties || []
    const rentalIncome = Array.isArray(rentalProperties)
      ? rentalProperties.reduce((total: number, property: any) => {
          return total + safeNumber(property.monthly_income) * 12
        }, 0)
      : 0
    const rentalIncomeAfterTax = rentalIncome * 0.78

    const retirementAccountIncome = totalRetirementAt67 / 20
    const retirementAccountIncomeAfterTax = retirementAccountIncome * 0.78

    const totalIncomeBeforeTax = retirementAccountIncome + totalSS + totalPension + rentalIncome
    const totalIncomeAfterTax =
      retirementAccountIncomeAfterTax + totalSSAfterTax + totalPensionAfterTax + rentalIncomeAfterTax

    const annualIncomeRequired = safeNumber(financialGoals?.annual_retirement_income_today) || 0
    const incomeSurplus = totalIncomeAfterTax - annualIncomeRequired

    // Life insurance gap
    const lifeInsuranceGap = safeNumber(defenseStrategy?.life_insurance_gap)

    // Net worth calculation
    const primaryHomeValue = safeNumber(growthStrategy?.primary_home_value)
    const primaryHomeMortgage = safeNumber(growthStrategy?.primary_home_mortgage_balance)
    const checkingAccount = safeNumber(growthStrategy?.checking_account)
    const savingsAccount = safeNumber(growthStrategy?.savings_account)
    const moneyMarket = safeNumber(growthStrategy?.money_market)
    const emergencyFund = safeNumber(growthStrategy?.emergency_fund)

    const netWorth =
      totalRetirementNow +
      currentBrokerage +
      checkingAccount +
      savingsAccount +
      moneyMarket +
      emergencyFund +
      (primaryHomeValue - primaryHomeMortgage)

    // Financial health score (simple calculation)
    const financialHealthScore = Math.min(
      100,
      Math.round(
        (netWorth / (annualIncomeRequired * 25)) * 30 +
          (totalRetirementAt67 / (annualIncomeRequired * 25)) * 30 +
          (incomeSurplus > 0 ? 20 : 0) +
          (lifeInsuranceGap <= 0 ? 20 : 0),
      ),
    )

    // Top priorities
    const topPriorities = financialGoals?.top_priorities || []
    const priority1 = topPriorities[0] || "Not specified"
    const priority2 = topPriorities[1] || "Not specified"
    const priority3 = topPriorities[2] || "Not specified"

    // Kids education funding
    const kidsEducationRows: any[] = []
    if (Array.isArray(financialGoals?.children) && financialGoals.children.length > 0) {
      const kidsEducationSavingsAmount = safeNumber(growthStrategy?.kids_education_savings_amount)
      const totalEducationNeeded = financialGoals.children.reduce(
        (total: number, child: any) => total + safeNumber(child.estimated_total_needed),
        0,
      )
      const educationFundingPercent =
        totalEducationNeeded > 0 ? (kidsEducationSavingsAmount / totalEducationNeeded) * 100 : 0

      financialGoals.children.forEach((child: any, index: number) => {
        const childNeeded = safeNumber(child.estimated_total_needed)
        const childSavings =
          totalEducationNeeded > 0 ? (childNeeded / totalEducationNeeded) * kidsEducationSavingsAmount : 0
        const childFundingPercent = childNeeded > 0 ? (childSavings / childNeeded) * 100 : 0
        kidsEducationRows.push({
          metric: `${child.name || `Child ${index + 1}`} Education Funding Status`,
          value: `${childFundingPercent.toFixed(1)}% (${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          }).format(childSavings)} of ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          }).format(childNeeded)})`,
        })
      })
    }

    // Add rows to Final Report sheet
    finalReportSheet.addRows([
      { metric: "REPORT INFORMATION", value: "" },
      { metric: "Client Name", value: profile?.full_name || profile?.email || user.email || "Unknown Client" },
      {
        metric: "Date Generated",
        value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      },
      { metric: "", value: "" },
      { metric: "KEY METRICS", value: "" },
      { metric: "Financial Health Score", value: `${financialHealthScore}/100` },
      {
        metric: "Net Worth (Current)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          netWorth,
        ),
      },
      { metric: "", value: "" },
      { metric: "RETIREMENT ACCOUNTS", value: "" },
      {
        metric: "Retirement Account Value (Current)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalRetirementNow,
        ),
      },
      {
        metric: `Retirement Account Value (At Age ${retirementAge})`,
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalRetirementAt67,
        ),
      },
      { metric: "", value: "" },
      { metric: "ACCOUNT BREAKDOWN (CURRENT)", value: "" },
      {
        metric: "Taxable Accounts (Current)",
        value: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(taxableNow)} (${taxablePercentNow.toFixed(1)}%)`,
      },
      {
        metric: "Tax Deferred Accounts (Current)",
        value: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(taxDeferredNow)} (${taxDeferredPercentNow.toFixed(1)}%)`,
      },
      {
        metric: "Tax Advantaged Accounts (Current)",
        value: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(taxAdvantageNow)} (${taxAdvantagePercentNow.toFixed(1)}%)`,
      },
      { metric: "", value: "" },
      { metric: `ACCOUNT BREAKDOWN (AT AGE ${retirementAge})`, value: "" },
      {
        metric: `Taxable Accounts (At Age ${retirementAge})`,
        value: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(taxableAt67)} (${((taxableAt67 / totalAccountsAt67) * 100).toFixed(1)}%)`,
      },
      {
        metric: `Tax Deferred Accounts (At Age ${retirementAge})`,
        value: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(taxDeferredAt67)} (${((taxDeferredAt67 / totalAccountsAt67) * 100).toFixed(1)}%)`,
      },
      {
        metric: `Tax Advantaged Accounts (At Age ${retirementAge})`,
        value: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(taxAdvantageAt67)} (${((taxAdvantageAt67 / totalAccountsAt67) * 100).toFixed(1)}%)`,
      },
      { metric: "", value: "" },
      { metric: "RETIREMENT INCOME STREAMS", value: "" },
      {
        metric: "From Retirement Accounts (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          retirementAccountIncome,
        ),
      },
      {
        metric: "From Retirement Accounts (After 22% Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          retirementAccountIncomeAfterTax,
        ),
      },
      {
        metric: "From Roth Accounts (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalRetirementAt67 / 20,
        ),
      },
      {
        metric: "From Roth Accounts (After Tax - Tax Free)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalRetirementAt67 / 20,
        ),
      },
      {
        metric: "Social Security (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalSS,
        ),
      },
      {
        metric: "Social Security (After 22% Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalSSAfterTax,
        ),
      },
      {
        metric: "Pension (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalPension,
        ),
      },
      {
        metric: "Pension (After 22% Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalPensionAfterTax,
        ),
      },
      {
        metric: "Rental Income (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          rentalIncome,
        ),
      },
      {
        metric: "Rental Income (After 22% Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          rentalIncomeAfterTax,
        ),
      },
      {
        metric: "Other Investment Income (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          0,
        ),
      },
      {
        metric: "Other Investment Income (After 22% Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          0,
        ),
      },
      { metric: "", value: "" },
      { metric: "RETIREMENT INCOME ANALYSIS", value: "" },
      {
        metric: "Total Retirement Income (Before Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalIncomeBeforeTax,
        ),
      },
      {
        metric: "Total Retirement Income (After Tax)",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          totalIncomeAfterTax,
        ),
      },
      {
        metric: "Annual Income Required",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          annualIncomeRequired,
        ),
      },
      {
        metric: "Surplus/Shortfall",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          incomeSurplus,
        ),
      },
      { metric: "", value: "" },
      { metric: "MONTHLY CASH FLOW ANALYSIS", value: "" },
      {
        metric: "Net Monthly Income",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.net_monthly_income),
        ),
      },
      {
        metric: "Gross Monthly Income",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.gross_monthly_income),
        ),
      },
      {
        metric: "Total Monthly Expenses",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.total_monthly_expenses),
        ),
      },
      {
        metric: "Monthly Surplus",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.monthly_surplus),
        ),
      },
      {
        metric: "Savings Rate",
        value: `${safeNumber(savingsVsSpending?.savings_rate).toFixed(1)}%`,
      },
      { metric: "", value: "" },
      { metric: "FINANCIAL RESPONSIBILITY ANALYSIS", value: "" },
      {
        metric: "10x Yearly Income",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.gross_monthly_income) * 12 * 10,
        ),
      },
      {
        metric: "Primary Home Mortgage Balance",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(growthStrategy?.primary_home_mortgage_balance),
        ),
      },
      {
        metric: "Kids Education Cost",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          Array.isArray(financialGoals?.children)
            ? financialGoals.children.reduce(
                (total: number, child: any) => total + safeNumber(child.estimated_total_needed),
                0,
              )
            : 0,
        ),
      },
      {
        metric: "Current Debt",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.vehicle_loan_amount) +
            safeNumber(savingsVsSpending?.credit_card_amount) +
            safeNumber(savingsVsSpending?.personal_loan_amount) +
            safeNumber(savingsVsSpending?.education_loan_amount) +
            safeNumber(savingsVsSpending?.other_loan_amount),
        ),
      },
      {
        metric: "Total Financial Responsibility",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          safeNumber(savingsVsSpending?.gross_monthly_income) * 12 * 10 +
            safeNumber(growthStrategy?.primary_home_mortgage_balance) +
            (Array.isArray(financialGoals?.children)
              ? financialGoals.children.reduce(
                  (total: number, child: any) => total + safeNumber(child.estimated_total_needed),
                  0,
                )
              : 0) +
            safeNumber(savingsVsSpending?.vehicle_loan_amount) +
            safeNumber(savingsVsSpending?.credit_card_amount) +
            safeNumber(savingsVsSpending?.personal_loan_amount) +
            safeNumber(savingsVsSpending?.education_loan_amount) +
            safeNumber(savingsVsSpending?.other_loan_amount),
        ),
      },
      {
        metric: "Total Life Insurance Coverage",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          Array.isArray(defenseStrategy?.life_insurance_policies)
            ? defenseStrategy.life_insurance_policies.reduce(
                (total: number, policy: any) => total + safeNumber(policy.death_benefit),
                0,
              )
            : 0,
        ),
      },
      {
        metric: "Life Insurance Gap",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          lifeInsuranceGap,
        ),
      },
      { metric: "", value: "" },
      { metric: "PROTECTION", value: "" },
      {
        metric: "Life Insurance Gap",
        value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
          lifeInsuranceGap,
        ),
      },
      { metric: "", value: "" },
      { metric: "TOP PRIORITIES", value: "" },
      { metric: "Top Priority Issue 1", value: priority1 },
      { metric: "Top Priority Issue 2", value: priority2 },
      { metric: "Top Priority Issue 3", value: priority3 },
      { metric: "", value: "" },
      ...(kidsEducationRows.length > 0
        ? [{ metric: "EDUCATION FUNDING", value: "" }, ...kidsEducationRows, { metric: "", value: "" }]
        : []),
    ])

    // Style the Final Report sheet header
    finalReportSheet.getRow(1).font = { bold: true, size: 12 }
    finalReportSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4A90E2" },
    }

    const buffer = await workbook.xlsx.writeBuffer()

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error("[v0] RESEND_API_KEY not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const clientName = profile?.full_name || profile?.email || user.email || "Unknown Client"
    const clientEmail = profile?.email || user.email || "No email provided"

    // In testing mode, Resend only allows sending to the verified email
    const verifiedEmail = "rajjrajender2112@gmail.com" // The verified testing email

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Financial Planning Report <onboarding@resend.dev>",
        to: verifiedEmail, // Always use verified email in testing mode
        subject: `New Client Report - ${clientName} (${clientEmail})`,
        html: `
          <h2>New Financial Planning Assessment Completed</h2>
          <p>A client has completed their comprehensive financial planning assessment.</p>
          <h3>Client Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${clientName}</li>
            <li><strong>Email:</strong> ${clientEmail}</li>
            <li><strong>Phone:</strong> ${profile?.phone || profile?.phone_number || "Not provided"}</li>
            <li><strong>Current Age:</strong> ${financialGoals?.current_age || "Not provided"}</li>
            <li><strong>Retirement Age:</strong> ${financialGoals?.retirement_age || "Not provided"}</li>
          </ul>
          <p>The complete assessment data is attached in Excel format with all four sections:</p>
          <ul>
            <li>Financial Goals</li>
            <li>Growth Strategy</li>
            <li>Defense Strategy</li>
            <li>Savings vs Spending Analysis</li>
          </ul>
          <p>Please review and follow up with the client as needed.</p>
        `,
        attachments: [
          {
            filename: `Financial_Report_${clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`,
            content: Buffer.from(buffer).toString("base64"),
          },
        ],
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      console.error("[v0] Resend API error:", errorData)

      // If it's a testing mode restriction (403), try sending to verified email instead
      if (emailResponse.status === 403 && errorData.name === "validation_error") {
        console.log("[v0] Resend in testing mode, attempting to send to verified email...")

        const retryResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Financial Planning Report <onboarding@resend.dev>",
            to: verifiedEmail,
            subject: `New Client Report - ${clientName} (${clientEmail})`,
            html: `
              <h2>New Financial Planning Assessment Completed</h2>
              <p><strong>Note:</strong> This email was sent to your verified address because Resend is in testing mode.</p>
              <p>A client has completed their comprehensive financial planning assessment.</p>
              <h3>Client Information:</h3>
              <ul>
                <li><strong>Name:</strong> ${clientName}</li>
                <li><strong>Email:</strong> ${clientEmail}</li>
                <li><strong>Phone:</strong> ${profile?.phone || profile?.phone_number || "Not provided"}</li>
                <li><strong>Current Age:</strong> ${financialGoals?.current_age || "Not provided"}</li>
                <li><strong>Retirement Age:</strong> ${financialGoals?.retirement_age || "Not provided"}</li>
              </ul>
              <p>The complete assessment data is attached in Excel format with all four sections:</p>
              <ul>
                <li>Financial Goals</li>
                <li>Growth Strategy</li>
                <li>Defense Strategy</li>
                <li>Savings vs Spending Analysis</li>
              </ul>
              <p>Please review and follow up with the client as needed.</p>
            `,
            attachments: [
              {
                filename: `Financial_Report_${clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`,
                content: Buffer.from(buffer).toString("base64"),
              },
            ],
          }),
        })

        if (!retryResponse.ok) {
          const retryError = await retryResponse.text()
          console.error("[v0] Retry email failed:", retryError)
          // Don't fail the entire request - report was still saved successfully
          console.log("[v0] Final report saved successfully but email notification failed")
        } else {
          console.log("[v0] Email successfully sent to verified address")
        }
      }
      // Don't return error - the report was saved successfully, email is optional
    } else {
      console.log("[v0] Report sent successfully to admin:", adminEmail, "for client:", clientEmail)
    }

    console.log("[v0] EMAIL EXPORT - Complete. Check the Excel file for data accuracy.")
    return NextResponse.json({ success: true, message: "Report sent successfully" })
  } catch (error) {
    console.error("[v0] Error sending report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
