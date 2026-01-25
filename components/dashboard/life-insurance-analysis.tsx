"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Shield } from "lucide-react"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
}

export function LifeInsuranceAnalysis({ data }: Props) {
  // DIME Method Calculation
  const debt =
    (data.mortgageBalance || 0) +
    (data.studentLoans || 0) +
    (data.carLoans || 0) +
    (data.creditCardDebt || 0) +
    (data.otherDebt || 0)

  const income = ((data.annualIncome || 0) + (data.spouseIncome || 0)) * 10 // 10 years of income

  const mortgage = data.mortgageBalance || 0

  // College education costs
  const numChildren = data.numChildren || 0
  const hasCollegeGoals = (data.collegeGoals || []).length > 0 && !data.collegeGoals?.includes("none")
  const avgCollegeCost = data.collegeGoals?.includes("private") ? 300000 : 150000
  const education = hasCollegeGoals ? numChildren * avgCollegeCost : 0

  const totalNeeded = debt + income + mortgage + education
  const currentCoverage = data.currentLifeInsurance || 0
  const insuranceGap = totalNeeded - currentCoverage

  const isAdequate = insuranceGap <= 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Life Insurance Needs Analysis</h3>
            <p className="text-sm text-muted-foreground">Using the DIME Method</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">D - Debt & Final Expenses</p>
              <p className="text-2xl font-bold text-foreground">${debt.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">I - Income Replacement (10 years)</p>
              <p className="text-2xl font-bold text-foreground">${income.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">M - Mortgage</p>
              <p className="text-2xl font-bold text-foreground">${mortgage.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">E - Education</p>
              <p className="text-2xl font-bold text-foreground">${education.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Coverage Needed</p>
                <p className="text-3xl font-bold text-foreground">${totalNeeded.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Coverage</p>
                <p className="text-3xl font-bold text-foreground">${currentCoverage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coverage Gap</p>
                <p className={`text-3xl font-bold ${insuranceGap > 0 ? "text-destructive" : "text-chart-1"}`}>
                  ${Math.abs(insuranceGap).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isAdequate ? (
          <Alert className="bg-chart-1/10 border-chart-1/20">
            <CheckCircle className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-foreground">
              <strong>Well protected!</strong> Your current life insurance coverage appears adequate based on the DIME
              method. Consider reviewing your coverage annually as your situation changes.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground">
              <strong>Coverage gap identified:</strong> You need an additional ${insuranceGap.toLocaleString()} in life
              insurance coverage to fully protect your family. Consider purchasing term life insurance to close this
              gap.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Life Insurance Recommendations</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Term Life Insurance</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              For most families, term life insurance provides the most affordable coverage. Consider a 20-30 year term
              policy to cover you until retirement.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Monthly Premium:</span>
              <span className="font-medium text-foreground">
                ${Math.round((insuranceGap > 0 ? insuranceGap : 1000000) / 1000000) * 50} - $
                {Math.round((insuranceGap > 0 ? insuranceGap : 1000000) / 1000000) * 80}
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Disability Insurance</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.currentDisabilityInsurance
                ? "Great! You have disability insurance. Review your coverage to ensure it replaces 60-70% of your income."
                : "Consider adding disability insurance to protect your income if you're unable to work due to illness or injury. Aim for coverage that replaces 60-70% of your income."}
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Review Regularly</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Life insurance needs change with major life events. Review your coverage when you have children, buy a
              home, or experience significant income changes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
