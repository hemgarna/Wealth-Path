"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, AlertCircle } from "lucide-react"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
}

export function CollegeSavingsAnalysis({ data }: Props) {
  const numChildren = data.numChildren || 0
  const childrenAges = data.childrenAges || []
  const hasCollegeGoals = (data.collegeGoals || []).length > 0 && !data.collegeGoals?.includes("none")

  if (!hasCollegeGoals || numChildren === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">College Savings Planning</h3>
          </div>
        </div>
        <p className="text-muted-foreground">
          {numChildren === 0
            ? "You haven't indicated any children in your assessment. This section will be available when you add children to your financial plan."
            : "You've indicated that you're not planning for college costs. This analysis is not applicable to your situation."}
        </p>
      </Card>
    )
  }

  const isPrivate = data.collegeGoals?.includes("private")
  const currentCostPerYear = isPrivate ? 75000 : 30000
  const inflationRate = 0.05 // 5% college cost inflation
  const investmentReturn = 0.07

  const childAnalysis = childrenAges.map((age, index) => {
    const yearsUntilCollege = Math.max(0, 18 - age)
    const futureCostPerYear = currentCostPerYear * Math.pow(1 + inflationRate, yearsUntilCollege)
    const totalCollegeCost = futureCostPerYear * 4

    // Calculate required monthly savings
    const monthsUntilCollege = yearsUntilCollege * 12
    const monthlyRate = investmentReturn / 12
    const requiredMonthlySavings =
      monthsUntilCollege > 0
        ? (totalCollegeCost * monthlyRate) / (Math.pow(1 + monthlyRate, monthsUntilCollege) - 1)
        : 0

    return {
      childNumber: index + 1,
      age,
      yearsUntilCollege,
      futureCostPerYear: Math.round(futureCostPerYear),
      totalCollegeCost: Math.round(totalCollegeCost),
      requiredMonthlySavings: Math.round(requiredMonthlySavings),
    }
  })

  const totalRequired = childAnalysis.reduce((sum, child) => sum + child.totalCollegeCost, 0)
  const totalMonthlySavings = childAnalysis.reduce((sum, child) => sum + child.requiredMonthlySavings, 0)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">College Savings Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Planning for {isPrivate ? "private" : "in-state public"} university
            </p>
          </div>
        </div>

        <div className="mb-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Projected College Costs</p>
              <p className="text-3xl font-bold text-foreground">${totalRequired.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">For all {numChildren} children</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Required Monthly Savings</p>
              <p className="text-3xl font-bold text-foreground">${totalMonthlySavings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">To fully fund college expenses</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {childAnalysis.map((child) => (
            <div key={child.childNumber} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">
                  Child {child.childNumber} (Age {child.age})
                </h4>
                <span className="text-sm text-muted-foreground">{child.yearsUntilCollege} years until college</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Projected Annual Cost</p>
                  <p className="font-medium text-foreground">${child.futureCostPerYear.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Total 4-Year Cost</p>
                  <p className="font-medium text-foreground">${child.totalCollegeCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Monthly Savings Needed</p>
                  <p className="font-medium text-foreground">
                    ${child.requiredMonthlySavings > 0 ? child.requiredMonthlySavings.toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Alert className="mt-6 bg-muted/50 border-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-foreground">
            These projections assume {inflationRate * 100}% annual college cost inflation and {investmentReturn * 100}%
            investment returns. Consider using 529 plans for tax-advantaged college savings.
          </AlertDescription>
        </Alert>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">College Savings Strategies</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">529 College Savings Plan</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tax-advantaged savings plan designed for education expenses. Contributions grow tax-free and withdrawals
              for qualified education expenses are tax-free. Many states offer tax deductions for contributions.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Start Early</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The earlier you start saving, the less you'll need to contribute monthly thanks to compound interest. Even
              small contributions can grow significantly over 18 years.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Consider Financial Aid</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Remember that financial aid, scholarships, and grants can significantly reduce the actual cost. Don't
              over-save at the expense of your retirement goals.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
