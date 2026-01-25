"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  GraduationCap,
  PiggyBank,
  DollarSign,
  CheckCircle2,
  Calendar,
  ArrowRight,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface GapAnalysisClientProps {
  user: User
  profile: any
  assessment: any
}

export default function GapAnalysisClient({ user, profile, assessment }: GapAnalysisClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">FNA App</span>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              {/* CHANGE: Updated from "financial assessment" to "financial goals" */}
              <CardTitle>Welcome, {profile?.full_name || user.email}</CardTitle>
              <CardDescription>Complete your financial goals to get your personalized gap analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {/* CHANGE: Updated from "financial assessment questionnaire" to "financial goals questionnaire" */}
                To unlock your comprehensive financial gap analysis with personalized recommendations, you need to
                complete the financial goals questionnaire.
              </p>
              <div className="flex gap-4">
                <Link href="/assessment">
                  <Button className="gap-2">
                    Start Goals
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate financial health score
  const calculateHealthScore = () => {
    let score = 0

    // Retirement score (40 points)
    const retirementBalance = (assessment.current_401k_balance || 0) + (assessment.traditional_ira_balance || 0)
    if (retirementBalance > 500000) score += 40
    else if (retirementBalance > 250000) score += 30
    else if (retirementBalance > 100000) score += 20
    else score += 10

    // College savings (20 points)
    const hasCollegePlan = assessment.num_children > 0 && assessment.college_funding_needed > 0
    if (hasCollegePlan) score += 20

    // Insurance (15 points)
    if ((assessment.life_insurance_coverage || 0) > 500000) score += 15
    else if ((assessment.life_insurance_coverage || 0) > 0) score += 8

    // Emergency fund (10 points)
    if ((assessment.savings_balance || 0) > 50000) score += 10
    else if ((assessment.savings_balance || 0) > 20000) score += 5

    // FBAR compliance (10 points)
    if ((assessment.foreign_assets_total || 0) < 10000 || assessment.fbar_filed) score += 10

    // Debt management (5 points)
    if ((assessment.credit_card_debt || 0) === 0) score += 5

    return score
  }

  const healthScore = calculateHealthScore()

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Needs Attention"
    return "Critical"
  }

  // Calculate retirement gap
  const currentAge = assessment.current_age || 35
  const retirementAge = assessment.retirement_age || 65
  const yearsToRetirement = retirementAge - currentAge
  const currentRetirementBalance = (assessment.current_401k_balance || 0) + (assessment.traditional_ira_balance || 0)
  const monthlyContribution = assessment.monthly_401k_contribution || 0
  const annualIncome = assessment.annual_income || 100000

  const projectedRetirementBalance =
    currentRetirementBalance * Math.pow(1.07, yearsToRetirement) +
    (monthlyContribution * 12 * (Math.pow(1.07, yearsToRetirement) - 1)) / 0.07

  const retirementIncomeNeeded = (assessment.monthly_income_needed_retirement || (annualIncome * 0.8) / 12) * 12
  const retirementNeeded = retirementIncomeNeeded * 25 // 4% rule
  const retirementGap = retirementNeeded - projectedRetirementBalance

  // Calculate college funding gap
  const collegeFundingNeeded = assessment.college_funding_needed || 0
  const collegeSavings = 0 // Assuming no 529 data yet
  const collegeFundingGap = collegeFundingNeeded - collegeSavings

  // Calculate life insurance gap (DIME method)
  const debt = (assessment.mortgage_balance || 0) + (assessment.credit_card_debt || 0)
  const income = annualIncome * 10 // 10 years of income
  const mortgage = assessment.mortgage_balance || 0
  const education = collegeFundingNeeded
  const lifeInsuranceNeeded = debt + income + mortgage + education
  const currentCoverage = assessment.life_insurance_coverage || 0
  const lifeInsuranceGap = lifeInsuranceNeeded - currentCoverage

  // FBAR check
  const foreignAssets = assessment.foreign_assets_total || 0
  const needsFBAR = foreignAssets > 10000 && !assessment.fbar_filed

  // Total loss calculation
  const taxWaste = 15000 // Example annual tax overpayment
  const totalLoss = Math.max(0, retirementGap) + collegeFundingGap + lifeInsuranceGap + taxWaste * 30

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">FNA App</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {profile?.full_name || user.email}
              </span>
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Financial Health Score */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Financial Health Score</CardTitle>
                <CardDescription>Overall assessment of your financial wellness</CardDescription>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(healthScore)}`}>{healthScore}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={healthScore} className="h-3 mb-4" />
            <div className="flex items-center gap-2 mb-6">
              <Badge variant={healthScore >= 60 ? "default" : "destructive"} className="text-sm">
                {getScoreStatus(healthScore)}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <div className="text-sm text-muted-foreground">Retirement</div>
                  <div className="text-lg font-semibold">40/40</div>
                </div>
                <PiggyBank className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <div className="text-sm text-muted-foreground">College</div>
                  <div className="text-lg font-semibold">20/20</div>
                </div>
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <div className="text-sm text-muted-foreground">Insurance</div>
                  <div className="text-lg font-semibold">15/15</div>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="gaps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gaps">Financial Gaps</TabsTrigger>
            <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
            <TabsTrigger value="comparison">Before vs After</TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="space-y-6">
            {/* FBAR Alert */}
            {needsFBAR && (
              <Card className="border-red-500 border-2 bg-red-50 dark:bg-red-950/10">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-red-600">URGENT: FBAR Compliance Required</CardTitle>
                      <CardDescription className="text-red-600/80 mt-2">
                        You have foreign assets exceeding $10,000 and have not filed FBAR
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Your Foreign Assets</div>
                      <div className="text-2xl font-bold text-red-600">${foreignAssets.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Potential Penalty</div>
                      <div className="text-2xl font-bold text-red-600">$10,000 - $145,000</div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-background rounded-lg">
                    <div className="font-semibold mb-2">Immediate Action Required:</div>
                    <ul className="space-y-1 text-sm">
                      <li>• File FBAR within 30 days to avoid penalties</li>
                      <li>• Estimated cost to fix: $2,000</li>
                      <li>• We can connect you with a qualified accountant</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Retirement Gap */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <PiggyBank className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Retirement Funding Gap</CardTitle>
                    <CardDescription>Analysis of your retirement preparedness</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Amount Needed</div>
                    <div className="text-2xl font-bold">${(retirementNeeded / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">On Track For</div>
                    <div className="text-2xl font-bold">${(projectedRetirementBalance / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Shortfall</div>
                    <div className={`text-2xl font-bold ${retirementGap > 0 ? "text-red-600" : "text-green-600"}`}>
                      {retirementGap > 0 ? `-$${(retirementGap / 1000000).toFixed(1)}M` : "On Track"}
                    </div>
                  </div>
                </div>

                {retirementGap > 0 && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-orange-600">
                      <TrendingDown className="h-5 w-5" />
                      <span className="font-semibold">Impact:</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Money may run out by age{" "}
                        {retirementAge + Math.floor(projectedRetirementBalance / retirementIncomeNeeded)}
                      </li>
                      <li>
                        • May need to work {Math.ceil(retirementGap / (monthlyContribution * 12))} additional years
                      </li>
                      <li>• Risk of reduced lifestyle in retirement</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* College Funding Gap */}
            {assessment.num_children > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>College Funding Gap</CardTitle>
                      <CardDescription>Education savings analysis for your children</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Needed</div>
                      <div className="text-2xl font-bold">${(collegeFundingNeeded / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Current Savings</div>
                      <div className="text-2xl font-bold">${(collegeSavings / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Funding Gap</div>
                      <div className="text-2xl font-bold text-red-600">${(collegeFundingGap / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  {collegeFundingGap > 0 && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="font-semibold">Student Loan Scenario:</div>
                      <ul className="space-y-1 text-sm">
                        <li>• Total student debt: ${collegeFundingGap.toLocaleString()}</li>
                        <li>• Monthly payment: ${Math.round((collegeFundingGap * 0.06) / 12).toLocaleString()}</li>
                        <li>• Total interest paid: ${Math.round(collegeFundingGap * 0.5).toLocaleString()}</li>
                        <li>• Impact: Delayed home purchase, retirement savings</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Life Insurance Gap */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Life Insurance Gap</CardTitle>
                    <CardDescription>Protection analysis using DIME method</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Need</div>
                    <div className="text-2xl font-bold">${(lifeInsuranceNeeded / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Coverage</div>
                    <div className="text-2xl font-bold">${(currentCoverage / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Coverage Gap</div>
                    <div className={`text-2xl font-bold ${lifeInsuranceGap > 0 ? "text-red-600" : "text-green-600"}`}>
                      {lifeInsuranceGap > 0 ? `$${(lifeInsuranceGap / 1000000).toFixed(1)}M` : "Covered"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold">DIME Breakdown:</div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Debt (Credit Cards, Loans)</span>
                      <span className="font-semibold">${debt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Income (10 years)</span>
                      <span className="font-semibold">${income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Mortgage</span>
                      <span className="font-semibold">${mortgage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Education (College Costs)</span>
                      <span className="font-semibold">${education.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {lifeInsuranceGap > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-semibold mb-2">Recommended Action:</div>
                    <ul className="space-y-1 text-sm">
                      <li>• Additional term life insurance: ${(lifeInsuranceGap / 1000000).toFixed(1)}M</li>
                      <li>• Estimated monthly premium: ${Math.round((lifeInsuranceGap / 1000000) * 15)}</li>
                      <li>• Protects family's financial future</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Optimization */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Tax Overpayment Analysis</CardTitle>
                    <CardDescription>Potential tax savings opportunities</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Annual Overpayment</div>
                    <div className="text-2xl font-bold text-red-600">${taxWaste.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lifetime Waste (30 years)</div>
                    <div className="text-2xl font-bold text-red-600">${((taxWaste * 30) / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold mb-2">Missing Opportunities:</div>
                  <ul className="space-y-1 text-sm">
                    <li>• Not maximizing 401(k) contributions</li>
                    <li>• Missing HSA tax advantages</li>
                    <li>• No Roth conversion strategy</li>
                    <li>• Inefficient capital gains management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Total Loss Summary */}
            <Card className="border-2 border-destructive">
              <CardHeader>
                <CardTitle className="text-2xl">Total Financial Exposure</CardTitle>
                <CardDescription>Combined impact of all gaps and inefficiencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-red-600">${(totalLoss / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-muted-foreground mt-2">at risk over your lifetime</div>
                </div>

                <div className="space-y-2">
                  {retirementGap > 0 && (
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Retirement Shortfall</span>
                      <span className="font-semibold text-red-600">${(retirementGap / 1000000).toFixed(2)}M</span>
                    </div>
                  )}
                  {collegeFundingGap > 0 && (
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>College Funding + Interest</span>
                      <span className="font-semibold text-red-600">
                        ${((collegeFundingGap * 1.5) / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  )}
                  {lifeInsuranceGap > 0 && (
                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                      <span>Insurance Gap Risk</span>
                      <span className="font-semibold text-red-600">${(lifeInsuranceGap / 1000000).toFixed(2)}M</span>
                    </div>
                  )}
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Tax Waste (30 years)</span>
                    <span className="font-semibold text-red-600">${((taxWaste * 30) / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="action-plan" className="space-y-6">
            {/* Immediate Actions */}
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <CardTitle className="text-red-600">Immediate Actions (This Month)</CardTitle>
                </div>
                <CardDescription>Critical items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {needsFBAR && (
                  <div className="p-4 border-2 border-red-200 dark:border-red-900 rounded-lg">
                    <div className="flex items-start gap-4">
                      <Calendar className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">File FBAR Compliance</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Why:</span> Avoid $10K-$145K penalties
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Cost:</span> $2,000
                          </div>
                          <div>
                            <span className="font-medium">Saves:</span> Up to $145,000 in penalties
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> Complete within 30 days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lifeInsuranceGap > 0 && (
                  <div className="p-4 border-2 border-red-200 dark:border-red-900 rounded-lg">
                    <div className="flex items-start gap-4">
                      <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Secure Life Insurance Coverage</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Why:</span> Protect family from financial devastation
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Cost:</span> ${Math.round((lifeInsuranceGap / 1000000) * 15)}
                            /month
                          </div>
                          <div>
                            <span className="font-medium">Coverage:</span> ${(lifeInsuranceGap / 1000000).toFixed(1)}M
                            term life
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> Apply this week
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(assessment.credit_card_debt || 0) > 0 && (
                  <div className="p-4 border-2 border-red-200 dark:border-red-900 rounded-lg">
                    <div className="flex items-start gap-4">
                      <DollarSign className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Tackle High-Interest Debt</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Why:</span> Eliminate 18-24% interest charges
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Amount:</span> $
                            {assessment.credit_card_debt?.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Saves:</span> $
                            {Math.round(assessment.credit_card_debt * 0.2).toLocaleString()}/year in interest
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> Pay off in 12-18 months
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High Priority Actions */}
            <Card className="border-orange-200 dark:border-orange-900">
              <CardHeader>
                <CardTitle className="text-orange-600">High Priority (Next 3 Months)</CardTitle>
                <CardDescription>Important actions to implement soon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {collegeFundingGap > 0 && (
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Open 529 College Savings Plans</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Why:</span> Tax-free growth for education
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Target:</span> ${(collegeFundingGap / 1000).toFixed(0)}K total
                          </div>
                          <div>
                            <span className="font-medium">Saves:</span> Avoid student loan debt and interest
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> Set up within 60 days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!assessment.is_maxing_401k && (
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-start gap-4">
                      <PiggyBank className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Maximize 401(k) Contributions</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Why:</span> Get full employer match + tax savings
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Increase to:</span> $23,500/year (2024 limit)
                          </div>
                          <div>
                            <span className="font-medium">Saves:</span> ~$7,000/year in taxes
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> Update by next pay period
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Open Health Savings Account (HSA)</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Why:</span> Triple tax advantage for medical expenses
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Contribute:</span> $8,300/year (family) or $4,150 (individual)
                        </div>
                        <div>
                          <span className="font-medium">Saves:</span> ~$2,000/year in taxes
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> Set up within 90 days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medium Priority Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Medium Priority (6-12 Months)</CardTitle>
                <CardDescription>Strategic improvements for long-term success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Establish Estate Plan</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Why:</span> Protect assets and ensure proper distribution
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Includes:</span> Will, Trust, Powers of Attorney
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> $2,000-$5,000
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> Complete within 6 months
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Build Emergency Fund</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Why:</span> Financial cushion for unexpected events
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Target:</span> 6 months of expenses ($
                          {Math.round(assessment.monthly_expenses * 6).toLocaleString()})
                        </div>
                        <div>
                          <span className="font-medium">Current:</span> $
                          {assessment.savings_balance?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> Build over 12 months
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Rebalance Investment Portfolio</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Why:</span> Optimize returns for your age and risk tolerance
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Review:</span> Asset allocation and fees
                        </div>
                        <div>
                          <span className="font-medium">Optimize:</span> Stock/bond mix for your timeline
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> Review quarterly
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Financial Future: Two Paths</CardTitle>
                <CardDescription>
                  Comparison of continuing current path vs implementing recommended changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Do Nothing Path */}
                  <div className="p-6 border-2 border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-950/10">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                      <h3 className="text-xl font-bold text-red-600">Current Path</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Retirement Net Worth</div>
                        <div className="text-2xl font-bold">${(projectedRetirementBalance / 1000000).toFixed(1)}M</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Money Runs Out</div>
                        <div className="text-2xl font-bold">
                          Age {retirementAge + Math.floor(projectedRetirementBalance / retirementIncomeNeeded)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">College Debt Burden</div>
                        <div className="text-2xl font-bold">${((collegeFundingGap * 1.5) / 1000).toFixed(0)}K</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Family Risk</div>
                        <div className="text-2xl font-bold">${(lifeInsuranceGap / 1000000).toFixed(1)}M exposed</div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground">Quality of Life</div>
                        <div className="text-lg font-semibold text-red-600">Stressed, Uncertain Future</div>
                      </div>
                    </div>
                  </div>

                  {/* Take Action Path */}
                  <div className="p-6 border-2 border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-bold text-green-600">Optimized Path</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Retirement Net Worth</div>
                        <div className="text-2xl font-bold">${(retirementNeeded / 1000000).toFixed(1)}M+</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Money Lasts</div>
                        <div className="text-2xl font-bold">Full Retirement</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">College Debt</div>
                        <div className="text-2xl font-bold">$0 (Fully Funded)</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Family Protection</div>
                        <div className="text-2xl font-bold">Fully Covered</div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground">Quality of Life</div>
                        <div className="text-lg font-semibold text-green-600">Peace of Mind, Secure Future</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Difference Summary */}
                <div className="mt-6 p-6 bg-primary/10 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Total Financial Improvement</div>
                    <div className="text-4xl font-bold text-primary">${(totalLoss / 1000000).toFixed(1)}M+</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      by implementing the recommended action plan
                    </div>
                  </div>
                </div>

                {/* ROI Calculator */}
                <div className="mt-6 p-6 border-2 border-primary rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Return on Investment</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Investment</div>
                      <div className="text-2xl font-bold">~$7,000</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        (Planning fees, insurance premiums, adjustments)
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Value Generated</div>
                      <div className="text-2xl font-bold text-green-600">${(totalLoss / 1000000).toFixed(1)}M+</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        (Gaps closed, risks mitigated, savings optimized)
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">128,000% ROI</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      For every $1 invested, you gain $1,285 in financial benefit
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 border-2 border-primary">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-balance">Ready to Secure Your Financial Future?</h2>
                <p className="text-lg text-muted-foreground text-balance">
                  Schedule a free 60-minute consultation to create your personalized action plan
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Schedule Free Consultation
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  Download Full Report
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="pt-6 border-t space-y-2">
                <div className="font-semibold">What You'll Get:</div>
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Comprehensive Financial Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Customized Action Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Expert Guidance & Support</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-primary">Value: $9M+ in Financial Optimization</p>
                <p className="mt-1">This consultation could be the most valuable hour you spend this year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
