"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Target,
  Shield,
  DollarSign,
  GraduationCap,
  Heart,
  Home,
  Briefcase,
  Globe,
  XCircle,
  FileText,
} from "lucide-react"
import { useMemo } from "react"

interface Props {
  assessment: any
  profile: any
}

export default function ResultsClient({ assessment, profile }: Props) {
  console.log("[v0] Full assessment data:", {
    current_401k_value: assessment.current_401k_value,
    traditional_ira_value: assessment.traditional_ira_value,
    roth_ira_value: assessment.roth_ira_value,
    hsa_value: assessment.hsa_value,
    personal_home_equity: assessment.personal_home_equity,
    stocks_value: assessment.stocks_value,
    cash_in_bank: assessment.cash_in_bank,
  })

  const calculations = useMemo(() => {
    console.log("[v0] Retirement accounts:", {
      "401k": assessment.current_401k_value,
      traditional_ira: assessment.traditional_ira_value,
      roth_ira: assessment.roth_ira_value,
      hsa: assessment.hsa_value,
    })

    console.log("[v0] College planning:", {
      children_count: assessment.number_of_children,
      child1_age: assessment.college_child1_age,
      child1_amount: assessment.college_child1_amount,
    })

    console.log("[v0] Budget data:", {
      monthly_net_pay: assessment.monthly_net_pay,
      monthly_mortgage: assessment.monthly_mortgage_rent,
      monthly_savings: assessment.monthly_retirement_savings,
    })

    // Calculate total assets - using comprehensive field names
    const retirementAssets =
      Number(assessment.current_401k_value || 0) +
      Number(assessment.traditional_ira_value || 0) +
      Number(assessment.roth_ira_value || 0) +
      Number(assessment.hsa_value || 0) +
      Number(assessment.pension_value || 0)

    const realEstateAssets =
      Number(assessment.personal_home_equity || 0) +
      Number(assessment.rental_properties_value || 0) +
      Number(assessment.land_value || 0) +
      Number(assessment.usa_inheritance_value || 0)

    const investmentAssets =
      Number(assessment.stocks_value || 0) +
      Number(assessment.business_value || 0) +
      Number(assessment.alternative_investments_value || 0) +
      Number(assessment.cds_value || 0) +
      Number(assessment.cash_in_bank || 0) +
      Number(assessment.emergency_fund || 0)

    const totalAssets = retirementAssets + realEstateAssets + investmentAssets

    // Calculate total liabilities
    const totalLiabilities =
      Number(assessment.mortgage_balance || 0) +
      Number(assessment.credit_card_debt || 0) +
      Number(assessment.student_loans || 0) +
      Number(assessment.auto_loans || 0) +
      Number(assessment.other_debts || 0)

    const netWorth = totalAssets - totalLiabilities

    const currentAge =
      new Date().getFullYear() - (assessment.date_of_birth ? new Date(assessment.date_of_birth).getFullYear() : 1985)
    const retirementAge = assessment.retirement_age || 65
    const yearsToRetirement = retirementAge - currentAge
    const lifeExpectancy = 90
    const yearsInRetirement = lifeExpectancy - retirementAge
    const inflationRate = 0.03 // 3% inflation
    const investmentReturnRate = 0.07 // 7% average return

    // Calculate annual retirement needs from monthly budget
    const monthlyRetirementNeeds = (assessment.monthly_mortgage_rent || 0) + (assessment.monthly_lifestyle || 0)

    const annualRetirementNeeds = monthlyRetirementNeeds * 12

    // Adjust for inflation at retirement
    const futureAnnualRetirementNeeds = annualRetirementNeeds * Math.pow(1 + inflationRate, yearsToRetirement)

    // Calculate total retirement need using 4% rule
    const retirementTargetNeeded = futureAnnualRetirementNeeds / 0.04

    // Social Security and Pension
    const socialSecurityAnnual = assessment.social_security_projected || 0
    const pensionAnnual = (assessment.pension_value || 0) * 0.05 // Assume 5% annual payout
    const guaranteedIncomeAnnual = socialSecurityAnnual + pensionAnnual

    // Calculate what Social Security reduces the need by
    const retirementTargetAfterGuaranteed = retirementTargetNeeded - guaranteedIncomeAnnual / 0.04

    // Project current retirement assets growth
    const currentBalanceGrowth = retirementAssets * Math.pow(1 + investmentReturnRate, yearsToRetirement)

    // Project future value of current contributions
    const annual401kContributions = (assessment.monthly_retirement_savings || 0) * 12

    // Future value of annuity formula: FV = PMT × [(1+r)^n - 1] / r
    const contributionsGrowth =
      annual401kContributions * ((Math.pow(1 + investmentReturnRate, yearsToRetirement) - 1) / investmentReturnRate)

    const projectedRetirementAssets = currentBalanceGrowth + contributionsGrowth

    const retirementGap = Math.max(0, retirementTargetAfterGuaranteed - projectedRetirementAssets)

    const childrenCount = assessment.number_of_children || 0
    const educationInflationRate = 0.05 // 5% education inflation
    const yearsToFirstChild = assessment.college_child1_years_from_today || 10
    const collegeCostToday = 100000 // $100k per year baseline

    // Calculate future cost with 5% education inflation
    const futureCostPerYear = collegeCostToday * Math.pow(1 + educationInflationRate, yearsToFirstChild)
    const totalCollegeCostPerChild = futureCostPerYear * 4 // 4 years
    const totalCollegeCost = totalCollegeCostPerChild * childrenCount
    const collegeSavings = assessment.plan_529_value || 0

    // Project 529 growth
    const collegeSavingsGrowth = collegeSavings * Math.pow(1 + investmentReturnRate, yearsToFirstChild)

    const collegeGap = Math.max(0, totalCollegeCost - collegeSavingsGrowth)

    // Calculate monthly 529 contribution needed
    const monthsUntilCollege = yearsToFirstChild * 12
    const monthlyRate = investmentReturnRate / 12
    const monthlyCollegePaymentNeeded =
      collegeGap > 0 ? (collegeGap * monthlyRate) / (Math.pow(1 + monthlyRate, monthsUntilCollege) - 1) : 0

    // Life Insurance Gap (DIME Method)
    const annualIncome = (assessment.monthly_net_pay || 0) * 12

    const debt = totalLiabilities
    const incomeReplacement = annualIncome * 10 // 10 years of income
    const mortgage = assessment.mortgage_balance || 0
    const education = totalCollegeCost
    const dimeTotal = debt + incomeReplacement + mortgage + education
    const currentLifeInsurance =
      Number(assessment.life_insurance_work_him || 0) +
      Number(assessment.life_insurance_work_her || 0) +
      Number(assessment.life_insurance_outside_him || 0) +
      Number(assessment.life_insurance_outside_her || 0)
    const lifeInsuranceGap = dimeTotal - currentLifeInsurance

    // FBAR Calculation
    const fbarTotal =
      Number(assessment.offshore_retirement_funds || 0) +
      Number(assessment.offshore_pension || 0) +
      Number(assessment.offshore_real_estate_value || 0) +
      Number(assessment.offshore_stocks || 0) +
      Number(assessment.offshore_mutual_funds || 0) +
      Number(assessment.offshore_fixed_deposits || 0) +
      Number(assessment.offshore_savings_accounts || 0) +
      Number(assessment.offshore_business_value || 0) +
      Number(assessment.offshore_life_insurance || 0) +
      Number(assessment.offshore_other_investments || 0)

    const fbarRequired = fbarTotal > 10000

    // Tax Analysis
    const totalMonthlyIncome = assessment.monthly_net_pay || 0

    const estimatedTaxRate = totalMonthlyIncome > 20000 ? 0.35 : totalMonthlyIncome > 10000 ? 0.24 : 0.22
    const currentAnnualTax = totalMonthlyIncome * 12 * estimatedTaxRate
    const optimalAnnualTax = totalMonthlyIncome * 12 * (estimatedTaxRate - 0.05) // 5% optimization potential
    const taxSavingsOpportunity = currentAnnualTax - optimalAnnualTax

    // Financial Health Score
    let healthScore = 0
    if (netWorth > 100000) healthScore += 15
    else if (netWorth > 0) healthScore += 10

    if (retirementAssets > 250000) healthScore += 20
    else if (retirementAssets > 100000) healthScore += 15
    else if (retirementAssets > 0) healthScore += 10

    if (realEstateAssets > 0) healthScore += 10
    if (investmentAssets > 50000) healthScore += 10

    if (currentLifeInsurance > 0) healthScore += 10
    if (assessment.has_disability_insurance) healthScore += 10
    if (assessment.has_will_and_trust) healthScore += 5
    if (assessment.has_umbrella_insurance) healthScore += 5

    const monthlyRetirementGap =
      retirementGap > 0 ? (retirementGap * monthlyRate) / (Math.pow(1 + monthlyRate, yearsToRetirement * 12) - 1) : 0

    const futureNetWorth =
      projectedRetirementAssets +
      (retirementGap > 0 ? retirementGap : 0) +
      (assessment.personal_home_equity || 0) * Math.pow(1.03, yearsToRetirement)

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      retirementAssets,
      realEstateAssets,
      investmentAssets,
      retirementGap,
      collegeGap,
      lifeInsuranceGap,
      fbarTotal,
      fbarRequired,
      taxSavingsOpportunity,
      healthScore,
      yearsToRetirement,
      totalRetirementNeeds: retirementTargetNeeded,
      projectedRetirementAssets,
      annualRetirementNeeds: futureAnnualRetirementNeeds,
      monthlyCollegePaymentNeeded,
      monthlyRetirementGapPayment: monthlyRetirementGap,
      futureNetWorth,
      currentBalanceGrowth,
      contributionsGrowth,
      socialSecurityAnnual,
      pensionAnnual,
    }
  }, [assessment])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Attention"
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 via-background to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FNA App Financial Analysis</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">
            Your Personalized Financial Report, {profile?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            We&apos;ve analyzed your complete financial picture. Here's what we found.
          </p>
        </div>

        {/* Financial Health Score */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              Financial Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-6xl font-bold ${getScoreColor(calculations.healthScore)}`}>
                  {calculations.healthScore}
                  <span className="text-3xl text-muted-foreground">/100</span>
                </div>
                <Badge
                  variant={calculations.healthScore >= 60 ? "default" : "destructive"}
                  className="mt-3 text-base px-3 py-1"
                >
                  {getScoreLabel(calculations.healthScore)}
                </Badge>
              </div>
              <div className="text-right max-w-md">
                <Progress value={calculations.healthScore} className="h-3 w-64 mb-2" />
                <p className="text-sm text-muted-foreground text-pretty">
                  Your score is based on net worth, retirement savings, insurance coverage, estate planning, and overall
                  financial preparedness.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Offensive vs Defensive Strategy */}
        <Tabs defaultValue="offensive" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offensive" className="text-lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Offensive Strategy
            </TabsTrigger>
            <TabsTrigger value="defensive" className="text-lg">
              <Shield className="mr-2 h-5 w-5" />
              Defensive Strategy
            </TabsTrigger>
          </TabsList>

          {/* Offensive Strategy Tab */}
          <TabsContent value="offensive" className="space-y-6">
            <Card className="border-green-500 border-2 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-green-700">
                  <TrendingUp className="h-6 w-6" />
                  Offensive Strategy: Building Wealth
                </CardTitle>
                <p className="text-muted-foreground">
                  These are actionable steps you can implement yourself to grow your assets and build long-term wealth.
                </p>
              </CardHeader>
            </Card>

            {/* Net Worth Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Current Net Worth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${calculations.netWorth >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(calculations.netWorth)}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Assets</span>
                      <span className="font-medium">{formatCurrency(calculations.totalAssets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Liabilities</span>
                      <span className="font-medium">{formatCurrency(calculations.totalLiabilities)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Retirement Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(calculations.retirementAssets)}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Years to Retirement</span>
                      <span className="font-medium">{calculations.yearsToRetirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projected at Retirement</span>
                      <span className="font-medium">{formatCurrency(calculations.projectedRetirementAssets)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-purple-600" />
                    Real Estate & Investments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(calculations.realEstateAssets)}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other Investments</span>
                      <span className="font-medium">{formatCurrency(calculations.investmentAssets)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Retirement Accounts Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Retirement Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-muted-foreground">401(k) Balance</span>
                      <span className="font-bold">{formatCurrency(assessment.current_401k_value || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-muted-foreground">Traditional IRA</span>
                      <span className="font-bold">{formatCurrency(assessment.traditional_ira_value || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-muted-foreground">HSA Balance</span>
                      <span className="font-bold">{formatCurrency(assessment.hsa_value || 0)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-muted-foreground">Roth IRA Balance</span>
                      <span className="font-bold">{formatCurrency(assessment.roth_ira_value || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-muted-foreground">Pension Value</span>
                      <span className="font-bold">{formatCurrency(assessment.pension_value || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-muted-foreground">Taxable Investments</span>
                      <span className="font-bold">{formatCurrency(calculations.investmentAssets)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Stocks & Bonds</span>
                    <span className="font-bold">{formatCurrency(assessment.stocks_value || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Business Value</span>
                    <span className="font-bold">{formatCurrency(assessment.business_value || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">College Savings (529)</span>
                    <span className="font-bold">{formatCurrency(assessment.plan_529_value || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real Estate Holdings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Real Estate Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium">Primary Residence Equity</div>
                      <div className="text-sm text-muted-foreground">Current Equity</div>
                    </div>
                    <span className="font-bold">{formatCurrency(assessment.personal_home_equity || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium">Investment Properties</div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                    <span className="font-bold">{formatCurrency(assessment.rental_properties_value || 0)}</span>
                  </div>
                  {assessment.land_value > 0 && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium">Land Value</div>
                        <div className="text-sm text-muted-foreground">Owned Land</div>
                      </div>
                      <span className="font-bold">{formatCurrency(assessment.land_value || 0)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Retirement Gap & Action Items */}
            {calculations.retirementGap > 0 && (
              <Card className="border-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Retirement Shortfall Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-muted-foreground">Retirement Gap</span>
                      <span className="text-3xl font-bold text-yellow-600">
                        {formatCurrency(calculations.retirementGap)}
                      </span>
                    </div>
                    <div className="text-sm space-y-2 bg-yellow-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retirement Needs</span>
                        <span className="font-medium">{formatCurrency(calculations.totalRetirementNeeds)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projected Assets</span>
                        <span className="font-medium">{formatCurrency(calculations.projectedRetirementAssets)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">Monthly Savings Needed</span>
                        <span className="font-bold text-yellow-700">
                          {formatCurrency(calculations.monthlyRetirementGapPayment)}/month
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">Action Steps:</p>
                      <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                        <li>Max out 401(k) contributions</li>
                        <li>Contribute to Roth IRA</li>
                        <li>Consider HSA contributions</li>
                        <li>Increase monthly savings to {formatCurrency(calculations.monthlyRetirementGapPayment)}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* College Funding */}
            {calculations.collegeGap > 0 && (
              <Card className="border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-orange-600" />
                    College Funding Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-muted-foreground">Funding Gap</span>
                      <span className="text-3xl font-bold text-orange-600">
                        {formatCurrency(calculations.collegeGap)}
                      </span>
                    </div>
                    <div className="text-sm space-y-2 bg-orange-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number of Children</span>
                        <span className="font-medium">{assessment.number_of_children}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current 529 Savings</span>
                        <span className="font-medium">{formatCurrency(assessment.plan_529_value || 0)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">Monthly Contribution Needed</span>
                        <span className="font-bold text-orange-700">
                          {formatCurrency(calculations.monthlyCollegePaymentNeeded)}/month
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">Action Steps:</p>
                      <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                        <li>Open 529 college savings plans for each child</li>
                        <li>Contribute {formatCurrency(calculations.monthlyCollegePaymentNeeded)}/month</li>
                        <li>Take advantage of state tax deductions on contributions</li>
                        <li>Consider age-based investment portfolios</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tax Optimization */}
            {calculations.taxSavingsOpportunity > 0 && (
              <Card className="border-green-500 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Tax Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-muted-foreground">Annual Tax Savings Potential</span>
                      <span className="text-3xl font-bold text-green-600">
                        {formatCurrency(calculations.taxSavingsOpportunity)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">Actionable Strategies:</p>
                      <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                        <li>Max out pre-tax 401(k) contributions</li>
                        <li>Open and fund HSA (triple tax advantage)</li>
                        <li>Consider Roth conversions during low-income years</li>
                        <li>Implement tax-loss harvesting on investments</li>
                        <li>Optimize asset location (tax-efficient vs tax-inefficient accounts)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Defensive Strategy Tab */}
          <TabsContent value="defensive" className="space-y-6">
            <Card className="border-red-500 border-2 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-700">
                  <Shield className="h-6 w-6" />
                  Defensive Strategy: Protecting Your Wealth
                </CardTitle>
                <p className="text-muted-foreground">
                  These critical protection strategies require professional guidance. Schedule a consultation with our
                  advisors to implement them properly.
                </p>
              </CardHeader>
            </Card>

            {/* FBAR Alert */}
            {calculations.fbarRequired && (
              <Card className="border-red-600 border-2 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Globe className="h-5 w-5" />🚨 URGENT: FBAR Filing Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-lg">
                          Your foreign assets total {formatCurrency(calculations.fbarTotal)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          You are required to file FBAR (FinCEN Form 114) by April 15th. Non-compliance can result in
                          penalties ranging from $10,000 to $100,000 or 50% of account balances.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Foreign Assets Breakdown:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Offshore Bank Accounts</span>
                          <span>{formatCurrency(assessment.offshore_savings_accounts || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Offshore Securities</span>
                          <span>
                            {formatCurrency(
                              (assessment.offshore_stocks || 0) + (assessment.offshore_mutual_funds || 0),
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Offshore Real Estate</span>
                          <span>{formatCurrency(assessment.offshore_real_estate_value || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Offshore Life Insurance</span>
                          <span>{formatCurrency(assessment.offshore_life_insurance || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Life Insurance Gap */}
            {calculations.lifeInsuranceGap > 0 && (
              <Card className="border-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Life Insurance Coverage Gap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-muted-foreground">Additional Coverage Needed</span>
                      <span className="text-3xl font-bold text-red-600">
                        {formatCurrency(calculations.lifeInsuranceGap)}
                      </span>
                    </div>
                    <div className="text-sm space-y-2 bg-red-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommended Coverage (DIME Method)</span>
                        <span className="font-medium">
                          {formatCurrency(
                            calculations.lifeInsuranceGap +
                              (assessment.life_insurance_work_him || 0) +
                              (assessment.life_insurance_work_her || 0) +
                              (assessment.life_insurance_outside_him || 0) +
                              (assessment.life_insurance_outside_her || 0),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Coverage</span>
                        <span className="font-medium">
                          {formatCurrency(
                            (assessment.life_insurance_work_him || 0) +
                              (assessment.life_insurance_work_her || 0) +
                              (assessment.life_insurance_outside_him || 0) +
                              (assessment.life_insurance_outside_her || 0),
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">DIME Method Breakdown:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Debt: {formatCurrency(calculations.totalLiabilities)}</li>
                        <li>• Income (10 years): {formatCurrency(calculations.annualRetirementNeeds)}</li>
                        <li>• Mortgage: {formatCurrency(assessment.mortgage_balance || 0)}</li>
                        <li>• Education: {formatCurrency(calculations.collegeGap)}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Disability Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Disability Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Current Coverage</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(assessment.disability_insurance_coverage || 0)}
                      </span>
                      {assessment.has_disability_insurance ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  {!assessment.has_disability_insurance && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">⚠️ Recommendation:</p>
                      <p className="text-sm text-muted-foreground">
                        Consider disability insurance covering 60-70% of your income. This protects you if you become
                        unable to work due to illness or injury.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estate Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estate Planning Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Will & Trust</span>
                    <Badge variant={assessment.has_will_and_trust ? "default" : "destructive"}>
                      {assessment.has_will_and_trust ? "Completed" : "Not Started"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Umbrella Insurance</span>
                    <Badge variant={assessment.has_umbrella_insurance ? "default" : "destructive"}>
                      {assessment.has_umbrella_insurance ? "Active" : "Not Started"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Long-term Care Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Long-term Care Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Current Coverage</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(assessment.longterm_care_coverage || 0)}</span>
                      {assessment.longterm_care_coverage > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  {assessment.needs_longterm_care && assessment.longterm_care_coverage === 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">⚠️ Recommendation:</p>
                      <p className="text-sm text-muted-foreground">
                        Long-term care insurance can cost $200K+ per year. Consider policies that cover nursing home,
                        assisted living, or in-home care expenses.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Fund */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Emergency Fund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Current Cash Reserves</span>
                    <span className="font-bold">{formatCurrency(assessment.emergency_fund || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-muted-foreground">Monthly Expenses</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (assessment.monthly_mortgage_rent || 0) +
                          (assessment.monthly_utilities || 0) +
                          (assessment.monthly_groceries || 0) +
                          (assessment.monthly_insurance || 0) +
                          (assessment.monthly_other_expenses || 0),
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-muted-foreground font-semibold">Recommended Emergency Fund (6 months)</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(
                        ((assessment.monthly_mortgage_rent || 0) +
                          (assessment.monthly_utilities || 0) +
                          (assessment.monthly_groceries || 0) +
                          (assessment.monthly_insurance || 0) +
                          (assessment.monthly_other_expenses || 0)) *
                          6,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary border-2 bg-gradient-to-br from-blue-600 to-primary text-white">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <Shield className="h-16 w-16" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-3 text-balance">
                      Protect What You've Built - Schedule Your Consultation
                    </h2>
                    <p className="text-lg text-blue-100 text-pretty">
                      Defensive strategies require expert guidance. Our certified financial advisors will help you
                      implement proper protection for your family and assets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                      <div className="text-2xl font-bold mb-2">{formatCurrency(calculations.lifeInsuranceGap)}</div>
                      <div className="text-sm text-blue-100">Family Protection Gaps</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                      <div className="text-2xl font-bold mb-2">{assessment.has_will_and_trust ? "✓" : "4"}</div>
                      <div className="text-sm text-blue-100">Estate Documents Needed</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                      <div className="text-2xl font-bold mb-2">60 min</div>
                      <div className="text-sm text-blue-100">Free Consultation</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button size="lg" className="w-full text-lg h-14 bg-white text-primary hover:bg-blue-50" asChild>
                      <a href="https://calendly.com/yourcompany/consultation" target="_blank" rel="noopener noreferrer">
                        <Calendar className="mr-2 h-5 w-5" />
                        Schedule Free Protection Strategy Session
                      </a>
                    </Button>
                    <p className="text-sm text-blue-100">
                      ✓ No obligation • ✓ 100% confidential • ✓ Personalized protection plan • ✓ FBAR compliance
                      guidance
                    </p>
                  </div>

                  <div className="pt-4 border-t border-blue-400">
                    <p className="text-sm text-blue-100">
                      <strong>What We'll Cover:</strong> Life insurance optimization, estate planning, FBAR compliance,
                      disability insurance, long-term care strategies, and asset protection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-primary border-2 bg-gradient-to-br from-primary/5 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Ready to Take Control of Your Financial Future?</h2>
                <p className="text-lg text-muted-foreground">
                  Let's implement both your offensive and defensive strategies together
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatCurrency(calculations.futureNetWorth - calculations.netWorth)}
                  </div>
                  <div className="text-sm text-muted-foreground">Potential Wealth Increase</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(((calculations.futureNetWorth - calculations.netWorth) / 5000) * 100).toLocaleString()}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI on $5K Planning Fee</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{calculations.yearsToRetirement}</div>
                  <div className="text-sm text-muted-foreground">Years to Transform Your Wealth</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button size="lg" className="w-full text-lg h-14" asChild>
                  <a href="https://calendly.com/yourcompany/consultation" target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Free 60-Minute Consultation
                  </a>
                </Button>
                <p className="text-sm text-muted-foreground">
                  No obligation • 100% confidential • Personalized action plan
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Investment:</strong> $5,000 comprehensive planning fee • <strong>Value:</strong>{" "}
                  {formatCurrency(calculations.futureNetWorth - calculations.netWorth)}+ in increased wealth •{" "}
                  <strong>ROI:</strong>{" "}
                  {Math.round(((calculations.futureNetWorth - calculations.netWorth) / 5000) * 100).toLocaleString()}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
