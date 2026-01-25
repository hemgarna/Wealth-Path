"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
}

export function RetirementProjection({ data }: Props) {
  const currentAge = data.age || 35
  const retirementAge = data.retirementAge || 65
  const yearsToRetirement = retirementAge - currentAge
  const yearsInRetirement = (data.lifeExpectancy || 90) - retirementAge

  // Calculate current retirement savings
  const currentRetirementSavings = (data.retirement401k || 0) + (data.rothIRA || 0) + (data.hsa || 0)

  // Annual savings available for retirement
  const annualSavings = (data.annualIncome || 0) + (data.spouseIncome || 0) - (data.annualExpenses || 0)
  const retirementSavingsRate = Math.min(
    annualSavings * 0.5,
    ((data.annualIncome || 0) + (data.spouseIncome || 0)) * 0.2,
  ) // Assume 50% of savings or 20% of income goes to retirement

  const growthRate = 0.07

  // Future value of current savings
  const futureValueCurrent = currentRetirementSavings * Math.pow(1 + growthRate, yearsToRetirement)

  // Future value of annual contributions
  const futureValueContributions =
    retirementSavingsRate * ((Math.pow(1 + growthRate, yearsToRetirement) - 1) / growthRate)

  const projectedRetirementSavings = futureValueCurrent + futureValueContributions

  // Calculate retirement needs
  const annualRetirementNeeds = data.retirementExpenses || data.annualExpenses || 0
  const totalRetirementNeeds = annualRetirementNeeds * yearsInRetirement
  const safeWithdrawalAmount = projectedRetirementSavings * 0.04 // 4% rule

  const retirementGap = annualRetirementNeeds - safeWithdrawalAmount
  const isOnTrack = retirementGap <= 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Retirement Readiness Analysis</h3>

        <div className="grid gap-6 sm:grid-cols-2 mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Years Until Retirement</p>
              <p className="text-2xl font-bold text-foreground">{yearsToRetirement}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Retirement Savings</p>
              <p className="text-2xl font-bold text-foreground">${currentRetirementSavings.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Annual Retirement Contributions</p>
              <p className="text-2xl font-bold text-foreground">
                ${Math.round(retirementSavingsRate).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Projected at Retirement</p>
              <p className="text-2xl font-bold text-chart-1">
                ${Math.round(projectedRetirementSavings).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Safe Annual Withdrawal (4% Rule)</p>
              <p className="text-2xl font-bold text-foreground">${Math.round(safeWithdrawalAmount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Annual Retirement Needs</p>
              <p className="text-2xl font-bold text-foreground">${annualRetirementNeeds.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {isOnTrack ? (
          <Alert className="bg-chart-1/10 border-chart-1/20">
            <CheckCircle className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-foreground">
              <strong>Great news!</strong> Based on your current savings rate and investment returns, you are on track
              to meet your retirement goals. Your projected retirement income exceeds your expected expenses by $
              {Math.abs(Math.round(retirementGap)).toLocaleString()} per year.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground">
              <strong>Action needed:</strong> There is a projected gap of $
              {Math.abs(Math.round(retirementGap)).toLocaleString()} per year between your retirement income and
              expenses. Consider increasing your savings rate or adjusting your retirement expectations.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Maximize Tax-Advantaged Accounts</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Consider maxing out your 401(k) contributions (${(23000).toLocaleString()} for 2024) and Roth IRA ($
              {(7000).toLocaleString()}). These accounts provide significant tax benefits and can accelerate your
              retirement savings.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Catch-Up Contributions</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentAge >= 50
                ? "You're eligible for catch-up contributions! You can contribute an additional $7,500 to your 401(k) and $1,000 to your IRA annually."
                : `Once you turn 50, you'll be eligible for catch-up contributions, allowing additional retirement savings.`}
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Investment Allocation</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              With {yearsToRetirement} years until retirement, consider a balanced portfolio. A general rule of thumb is
              to hold {Math.max(20, 110 - currentAge)}% in stocks and {Math.min(80, currentAge - 10)}% in bonds based on
              your age.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
