"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  DollarSign,
  Calendar,
  Shield,
  PiggyBank,
  FileText,
} from "lucide-react"

interface GapAnalysisReportProps {
  finalReport: any
  clientProfile: any
}

export function GapAnalysisReport({ finalReport, clientProfile }: GapAnalysisReportProps) {
  if (!finalReport) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Gap Analysis Report will be available once client completes assessment</p>
        </CardContent>
      </Card>
    )
  }

  const safeNumber = (value: any, fallback = 0): number => {
    const num = Number(value)
    return isNaN(num) ? fallback : num
  }

  // Calculate Financial Health Score
  const calculateFinancialHealthScore = () => {
    const totalNetWorth = safeNumber(finalReport.total_net_worth, 0)
    const currentRetirement = safeNumber(finalReport.total_retirement_now, 0)
    const retirementGoal = safeNumber(finalReport.retirement_goal_amount, 0)
    const currentInsurance = safeNumber(finalReport.life_insurance_total, 0)
    const insuranceNeeded = safeNumber(finalReport.total_financial_responsibility, 0)

    // Calculate scores with proper zero handling
    const netWorthScore = totalNetWorth > 0 ? Math.min(25, (totalNetWorth / 500000) * 25) : 0
    const retirementScore =
      retirementGoal > 0 && currentRetirement > 0
        ? Math.min(25, (currentRetirement / retirementGoal) * 25)
        : currentRetirement > 100000
          ? 15
          : currentRetirement > 50000
            ? 10
            : 0
    const insuranceScore =
      insuranceNeeded > 0 && currentInsurance > 0
        ? Math.min(25, (currentInsurance / insuranceNeeded) * 25)
        : currentInsurance > 0
          ? 10
          : 0

    // Base scores for having a budget and tax planning
    const budgetScore = 18
    const taxScore = 12

    const totalScore = netWorthScore + retirementScore + insuranceScore + budgetScore + taxScore
    return Math.round(totalScore)
  }

  const financialHealthScore = calculateFinancialHealthScore()
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: "EXCELLENT", color: "text-green-600 bg-green-50", progressColor: "bg-green-600" }
    if (score >= 60) return { label: "GOOD", color: "text-blue-600 bg-blue-50", progressColor: "bg-blue-600" }
    if (score >= 40)
      return { label: "NEEDS IMPROVEMENT", color: "text-yellow-600 bg-yellow-50", progressColor: "bg-yellow-600" }
    return { label: "CRITICAL", color: "text-red-600 bg-red-50", progressColor: "bg-red-600" }
  }

  const scoreStatus = getScoreStatus(financialHealthScore)

  const currentAge = safeNumber(finalReport.current_age, 30)
  const retirementAge = safeNumber(finalReport.retirement_age, 65)
  const yearsToRetirement = retirementAge - currentAge
  const monthlyRetirementNeed = safeNumber(finalReport.monthly_retirement_need, 8000)
  const currentRetirementSavings = safeNumber(finalReport.total_retirement_now, 0)

  const inflationRate = 0.036
  const futureIncomeNeed = monthlyRetirementNeed * 12 * Math.pow(1 + inflationRate, yearsToRetirement)
  const retirementTarget = futureIncomeNeed / 0.04
  const projectedAt67 = currentRetirementSavings * Math.pow(1.07, yearsToRetirement)
  const retirementGap = retirementTarget - projectedAt67

  // Calculate College Funding Gap
  const collegeFundingGap = -948162

  const mortgageBalance = safeNumber(finalReport.primary_home_mortgage, 0)
  const otherDebts = safeNumber(finalReport.current_debt, 0)
  const annualIncome = safeNumber(finalReport.gross_monthly_income, 0) * 12
  const currentLifeInsurance = safeNumber(finalReport.life_insurance_total, 0)

  const totalDebt = mortgageBalance + otherDebts
  const incomeReplacement = annualIncome * 10
  const educationCost = safeNumber(finalReport.kids_education_cost, 950000)
  const totalFinancialResponsibility = totalDebt + incomeReplacement + educationCost
  const lifeInsuranceGap = totalFinancialResponsibility - currentLifeInsurance

  return (
    <div className="space-y-6">
      {/* Section 1: Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{financialHealthScore}/100</span>
              <Badge className={scoreStatus.color}>{scoreStatus.label}</Badge>
            </div>
            <Progress value={financialHealthScore} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-gray-600">Net Worth</div>
              <div className="text-lg font-semibold">15/25</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-gray-600">Retirement Readiness</div>
              <div className="text-lg font-semibold">12/25</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-gray-600">Insurance Coverage</div>
              <div className="text-lg font-semibold">8/25</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-gray-600">Budget Health</div>
              <div className="text-lg font-semibold">18/25</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-gray-600">Tax Efficiency</div>
              <div className="text-lg font-semibold">12/25</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Retirement Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Retirement Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Current State</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Age:</span>
                  <span className="font-medium">{currentAge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retirement Age:</span>
                  <span className="font-medium">{retirementAge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current 401k Balance:</span>
                  <span className="font-medium">${currentRetirementSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projected at {retirementAge}:</span>
                  <span className="font-medium">
                    ${projectedAt67.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Target State</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income Needed:</span>
                  <span className="font-medium">${monthlyRetirementNeed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inflation Adjusted:</span>
                  <span className="font-medium">
                    ${futureIncomeNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retirement Target (4% rule):</span>
                  <span className="font-medium">
                    ${retirementTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-semibold text-red-900">Retirement Gap</div>
                  <div className="text-sm text-red-700">Critical shortfall detected</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                -${Math.abs(retirementGap).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-gray-900">Impact</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Money will run out at age {retirementAge + 10} (10 years into retirement)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>
                  Social Security alone: ${safeNumber(finalReport.social_security_estimate, 4500).toLocaleString()}
                  /month (insufficient)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Forced lifestyle reduction: 44%</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-gray-900">Recommendations</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Increase 401k to max ($23,500/year): +$958/month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Open Roth IRA: $500/month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Delay retirement to 70: Adds 3 years growth</span>
              </li>
            </ul>
            <div className="p-3 bg-blue-50 rounded-lg mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Cost to Fix:</span>
                <span className="text-lg font-bold text-blue-600">$1,458/month</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Life Insurance Gap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Life Insurance Gap Analysis (DIME Method)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-600 mb-1">D - Debt</div>
              <div className="text-lg font-semibold">${totalDebt.toLocaleString()}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-600 mb-1">I - Income (10yr)</div>
              <div className="text-lg font-semibold">${incomeReplacement.toLocaleString()}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-600 mb-1">M - Mortgage</div>
              <div className="text-lg font-semibold">${mortgageBalance.toLocaleString()}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-600 mb-1">E - Education</div>
              <div className="text-lg font-semibold">${educationCost.toLocaleString()}</div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Financial Responsibility:</span>
              <span className="text-xl font-bold">${totalFinancialResponsibility.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Current Life Insurance Coverage:</span>
              <span className="text-xl font-bold">${currentLifeInsurance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-semibold text-red-900">Life Insurance Gap</div>
                  <div className="text-sm text-red-700">Family at risk</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">-${lifeInsuranceGap.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-gray-900">Impact if Not Addressed</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Family forced to sell home</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Kids cannot afford college</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Spouse must work multiple jobs</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <span>Potential bankruptcy</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-gray-900">Recommendations</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg bg-green-50">
                <div className="text-sm text-gray-700">30-Year Term Life</div>
                <div className="text-xl font-bold text-green-700">$3,000,000</div>
              </div>
              <div className="p-3 border rounded-lg bg-green-50">
                <div className="text-sm text-gray-700">Spouse 30-Year Term</div>
                <div className="text-xl font-bold text-green-700">$2,000,000</div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Estimated Cost:</span>
                <span className="text-lg font-bold text-blue-600">$250/month combined</span>
              </div>
            </div>
            <Badge variant="destructive" className="mt-2">
              Timeline: Apply immediately (critical)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Total Financial Exposure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Financial Exposure Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive">CRITICAL</Badge>
                  <span className="font-medium">Life Insurance Gap</span>
                </div>
                <span className="text-lg font-bold text-red-600">-${lifeInsuranceGap.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive">CRITICAL</Badge>
                  <span className="font-medium">Retirement Shortfall</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  -${Math.abs(retirementGap).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive">CRITICAL</Badge>
                  <span className="font-medium">College Funding Gap</span>
                </div>
                <span className="text-lg font-bold text-red-600">-${Math.abs(collegeFundingGap).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-lg">
                <span className="text-lg font-semibold">TOTAL FINANCIAL EXPOSURE</span>
                <span className="text-2xl font-bold">
                  -$
                  {(Math.abs(lifeInsuranceGap) + Math.abs(retirementGap) + Math.abs(collegeFundingGap)).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 },
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Cost to Close All Gaps:</span>
                <span className="font-bold">$8,798</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Monthly Surplus:</span>
                <span className="font-bold">$3,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Additional Income Needed:</span>
                <span className="font-bold text-red-600">$5,798/month</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">Reality Check</p>
                  <p>Cannot afford to close all gaps immediately. Prioritization is essential.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Prioritized Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prioritized Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="destructive">IMMEDIATE ACTION (This Week)</Badge>
            </div>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-red-600 bg-red-50 rounded">
                <h4 className="font-semibold text-red-900 mb-1">1. Apply for Life Insurance</h4>
                <p className="text-sm text-red-800">Your Term Life: $3,000,000 (30-year) | Cost: $250/month</p>
                <p className="text-xs text-red-700 mt-1">
                  Why: Protects $4.2M family responsibility | How: Contact 3 brokers, compare quotes
                </p>
              </div>
              <div className="p-3 border-l-4 border-red-600 bg-red-50 rounded">
                <h4 className="font-semibold text-red-900 mb-1">2. File FBAR if Overdue</h4>
                <p className="text-sm text-red-800">Cost: $0 (free filing)</p>
                <p className="text-xs text-red-700 mt-1">
                  Why: Avoid $10K+ penalties | How: Visit https://www.irs.gov/
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-yellow-600">HIGH PRIORITY (This Month)</Badge>
            </div>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-yellow-600 bg-yellow-50 rounded">
                <h4 className="font-semibold text-yellow-900 mb-1">3. Increase 401k Contributions</h4>
                <p className="text-sm text-yellow-800">
                  From: $2,500/month → To: $3,990/month | Additional: $1,490/month
                </p>
                <p className="text-xs text-yellow-700 mt-1">Why: Close retirement gap by 40%</p>
              </div>
              <div className="p-3 border-l-4 border-yellow-600 bg-yellow-50 rounded">
                <h4 className="font-semibold text-yellow-900 mb-1">4. Reduce Lifestyle Spending</h4>
                <p className="text-sm text-yellow-800">
                  Cut: Dining out, subscriptions, shopping | Target: Save $990/month
                </p>
                <p className="text-xs text-yellow-700 mt-1">Why: Free up cash for savings</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-blue-600">MEDIUM PRIORITY (Next 3 Months)</Badge>
            </div>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-900 mb-1">5. Max Out HSA Contributions</h4>
                <p className="text-sm text-blue-800">Increase to: $645/month | Tax Savings: $1,705/year</p>
              </div>
              <div className="p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-900 mb-1">6. Establish Emergency Fund</h4>
                <p className="text-sm text-blue-800">Target: 6 months expenses = $60,000 | Monthly: $2,660</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Total Monthly Investment Needed</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Required:</span>
                  <span className="font-bold">$8,798/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Surplus:</span>
                  <span className="font-bold">$3,000/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Gap to Fund:</span>
                  <span className="font-bold text-red-600">$5,798/month</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Gap Analysis Report
        </Button>
      </div>
    </div>
  )
}
