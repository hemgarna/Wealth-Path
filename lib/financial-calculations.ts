// Financial Calculations Engine
// Based on comprehensive calculation requirements

export interface NetWorthData {
  // USA Retirement Accounts
  your_401k: number
  spouse_401k: number
  your_rollover_401k: number
  spouse_rollover_401k: number
  your_trad_ira: number
  spouse_trad_ira: number
  your_roth_ira: number
  spouse_roth_ira: number
  your_hsa: number
  spouse_hsa: number

  // Real Estate
  home_value: number
  home_mortgage: number
  rental_value: number
  rental_mortgage: number

  // Other Assets
  brokerage: number
  business_value: number
  cash: number
  foreign_assets: number

  // Liabilities
  credit_cards: number
  car_loans: number
  student_loans: number
  other_debt: number
}

export function calculateNetWorth(data: NetWorthData) {
  // USA Retirement Accounts
  const usaRetirement =
    data.your_401k +
    data.spouse_401k +
    data.your_rollover_401k +
    data.spouse_rollover_401k +
    data.your_trad_ira +
    data.spouse_trad_ira +
    data.your_roth_ira +
    data.spouse_roth_ira +
    data.your_hsa +
    data.spouse_hsa

  // Home Equity
  const homeEquity = data.home_value - data.home_mortgage

  // Rental Property Equity
  const rentalEquity = data.rental_value - data.rental_mortgage

  // Total Assets
  const totalAssets =
    usaRetirement + homeEquity + rentalEquity + data.brokerage + data.business_value + data.cash + data.foreign_assets

  // Total Liabilities
  const totalLiabilities =
    data.home_mortgage +
    data.rental_mortgage +
    data.credit_cards +
    data.car_loans +
    data.student_loans +
    data.other_debt

  // Net Worth
  const netWorth = totalAssets - totalLiabilities

  return {
    usaRetirement,
    homeEquity,
    rentalEquity,
    totalAssets,
    totalLiabilities,
    netWorth,
    breakdown: {
      retirement: usaRetirement,
      home: homeEquity,
      rental: rentalEquity,
      brokerage: data.brokerage,
      business: data.business_value,
      cash: data.cash,
      foreign: data.foreign_assets,
    },
  }
}

export interface LifeInsuranceData {
  // Debt
  mortgage: number
  rental_mortgages: number
  credit_cards: number
  car_loans: number
  student_loans: number
  other_debt: number

  // Income
  your_income: number
  spouse_income: number

  // Education
  child1_college: number
  child2_college: number
  child3_college: number
  child1_marriage: number
  child2_marriage: number
  child3_marriage: number

  // Current Coverage
  your_employer: number
  spouse_employer: number
  your_term: number
  spouse_term: number
  your_cash_value: number
  spouse_cash_value: number
  foreign_policies: number
}

export function calculateLifeInsurance(data: LifeInsuranceData) {
  // D - Total Debt
  const totalDebt =
    data.mortgage + data.rental_mortgages + data.credit_cards + data.car_loans + data.student_loans + data.other_debt

  // I - Income Replacement (10 years)
  const yourIncomeReplacement = data.your_income * 10
  const spouseIncomeReplacement = data.spouse_income * 10
  const totalIncomeReplacement = yourIncomeReplacement + spouseIncomeReplacement

  // M - Mortgage (already in debt)
  const mortgage = data.mortgage

  // E - Education
  const totalEducation =
    data.child1_college +
    data.child2_college +
    data.child3_college +
    data.child1_marriage +
    data.child2_marriage +
    data.child3_marriage

  // Total Need
  const totalNeed = totalDebt + totalIncomeReplacement + totalEducation

  // Current Coverage
  const currentCoverage =
    data.your_employer +
    data.spouse_employer +
    data.your_term +
    data.spouse_term +
    data.your_cash_value +
    data.spouse_cash_value +
    data.foreign_policies

  // Gap
  const gap = totalNeed - currentCoverage
  const gapPercentage = (gap / totalNeed) * 100

  // Recommended Coverage
  const totalIncome = data.your_income + data.spouse_income
  const yourRecommended = totalIncome > 0 ? (data.your_income / totalIncome) * gap * 1.2 : gap * 0.6
  const spouseRecommended = totalIncome > 0 ? (data.spouse_income / totalIncome) * gap * 1.2 : gap * 0.4

  return {
    totalDebt,
    totalIncomeReplacement,
    totalEducation,
    totalNeed,
    currentCoverage,
    gap,
    gapPercentage,
    yourRecommended,
    spouseRecommended,
    status: gap > 0 ? "UNDERCOVERED" : "ADEQUATELY COVERED",
  }
}

export interface RetirementData {
  // Current Situation
  current_age: number
  retirement_age: number
  monthly_income_need: number

  // Current Balances
  total_current_balance: number

  // Annual Contributions
  annual_contributions: number

  // Social Security
  your_ss_monthly: number
  spouse_ss_monthly: number
}

export function calculateRetirement(data: RetirementData) {
  const INFLATION_RATE = 0.03
  const RATE_OF_RETURN = 0.07
  const WITHDRAWAL_RATE = 0.04 // 4% rule

  // Years to retirement
  const yearsToRetirement = data.retirement_age - data.current_age

  // Step 1: Future Income Need
  const currentAnnualNeed = data.monthly_income_need * 12
  const futureAnnualNeed = currentAnnualNeed * Math.pow(1 + INFLATION_RATE, yearsToRetirement)

  // Step 2: Retirement Savings Target
  const retirementTarget = futureAnnualNeed / WITHDRAWAL_RATE

  // Step 3: Current Balance Growth
  const futureValueCurrentBalance = data.total_current_balance * Math.pow(1 + RATE_OF_RETURN, yearsToRetirement)

  // Step 4: Future Value of Contributions
  const monthlyContribution = data.annual_contributions / 12
  const monthlyReturnRate = RATE_OF_RETURN / 12
  const totalMonths = yearsToRetirement * 12

  const futureValueContributions =
    monthlyContribution * ((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate)

  // Step 5: Projected Total
  const totalProjected = futureValueCurrentBalance + futureValueContributions

  // Step 6: Gap
  const gap = retirementTarget - totalProjected

  // Step 7: Additional Monthly Savings Needed
  let additionalMonthly = 0
  if (gap > 0) {
    additionalMonthly = gap / ((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate)
  }

  // Step 8: With Social Security
  const combinedAnnualSS = (data.your_ss_monthly + data.spouse_ss_monthly) * 12
  const gapToFillFromInvestments = Math.max(0, futureAnnualNeed - combinedAnnualSS)
  const revisedTarget = gapToFillFromInvestments / WITHDRAWAL_RATE
  const revisedGap = revisedTarget - totalProjected

  return {
    currentAnnualNeed,
    futureAnnualNeed,
    retirementTarget,
    futureValueCurrentBalance,
    futureValueContributions,
    totalProjected,
    gap,
    additionalMonthly,
    combinedAnnualSS,
    revisedTarget,
    revisedGap,
    status: gap > 0 ? "SHORTFALL" : "ON TRACK",
    yearsToRetirement,
  }
}

export interface CollegeData {
  child_age: number
  college_type: "public" | "private"
  current_529_balance: number
  monthly_529_contribution: number
}

export function calculateCollegeFunding(data: CollegeData) {
  const COLLEGE_START_AGE = 18
  const YEARS_IN_COLLEGE = 4
  const EDUCATION_INFLATION = 0.05
  const EXPECTED_RETURN = 0.07

  const yearsUntilCollege = COLLEGE_START_AGE - data.child_age

  // Current annual cost
  const currentAnnualCost = data.college_type === "private" ? 100000 : 25000

  // Future cost with education inflation
  const futureAnnualCost = currentAnnualCost * Math.pow(1 + EDUCATION_INFLATION, yearsUntilCollege)
  const totalCollegeCost = futureAnnualCost * YEARS_IN_COLLEGE

  // Current 529 balance growth
  const balanceGrowth = data.current_529_balance * Math.pow(1 + EXPECTED_RETURN, yearsUntilCollege)

  // Contribution growth
  const months = yearsUntilCollege * 12
  const monthlyRate = EXPECTED_RETURN / 12
  const contributionGrowth = data.monthly_529_contribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  const projectedBalance = balanceGrowth + contributionGrowth

  // Gap
  const gap = totalCollegeCost - projectedBalance

  // Monthly savings needed
  let monthlySavingsNeeded = 0
  if (gap > 0 && yearsUntilCollege > 0) {
    monthlySavingsNeeded = (gap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  return {
    yearsUntilCollege,
    futureAnnualCost,
    totalCollegeCost,
    projectedBalance,
    gap,
    monthlySavingsNeeded,
    status: gap > 0 ? "UNDERFUNDED" : "ON TRACK",
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
