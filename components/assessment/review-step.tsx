import type { AssessmentData } from "@/app/assessment/page"
import { Card } from "@/components/ui/card"

type Props = {
  data: Partial<AssessmentData>
}

export function ReviewStep({ data }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return "$0"
    return `$${value.toLocaleString()}`
  }

  const totalAssets =
    (data.checking_balance || 0) +
    (data.cash_savings || 0) +
    (data.investment_accounts || 0) +
    (data.retirement_401k || 0) +
    (data.retirement_ira || 0) +
    (data.home_value || 0) +
    (data.other_assets || 0)

  const totalLiabilities =
    (data.mortgage_balance || 0) +
    (data.student_loans || 0) +
    (data.auto_loans || 0) +
    (data.credit_card_debt || 0) +
    (data.other_debts || 0)

  const netWorth = totalAssets - totalLiabilities

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Review Your Information</h3>
        <p className="text-muted-foreground mb-6">
          Please review your information before proceeding to your personalized dashboard.
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="p-4 bg-muted/30">
          <h4 className="font-semibold text-foreground mb-3">Personal Information</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">{calculateAge(data.date_of_birth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marital Status:</span>
              <span className="font-medium capitalize">{data.marital_status || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Children:</span>
              <span className="font-medium">{data.number_of_children || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retirement Age:</span>
              <span className="font-medium">{data.retirement_age || "N/A"}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <h4 className="font-semibold text-foreground mb-3">Income & Expenses</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Combined Annual Income:</span>
              <span className="font-medium">
                {formatCurrency((data.annual_income || 0) + (data.spouse_annual_income || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Expenses:</span>
              <span className="font-medium">{formatCurrency(data.monthly_expenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Housing:</span>
              <span className="font-medium">{formatCurrency(data.monthly_housing_cost)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <h4 className="font-semibold text-foreground mb-3">Financial Snapshot</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Assets:</span>
              <span className="font-medium text-foreground">{formatCurrency(totalAssets)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Liabilities:</span>
              <span className="font-medium text-foreground">{formatCurrency(totalLiabilities)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold text-foreground">Net Worth:</span>
              <span className={`font-bold text-lg ${netWorth >= 0 ? "text-foreground" : "text-destructive"}`}>
                {formatCurrency(netWorth)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/30">
          <h4 className="font-semibold text-foreground mb-3">Goals</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retirement Income Goal:</span>
              <span className="font-medium">{formatCurrency(data.desired_retirement_income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">College Funding Goal:</span>
              <span className="font-medium">{formatCurrency(data.college_funding_goal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Tolerance:</span>
              <span className="font-medium capitalize">{data.risk_tolerance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Life Insurance:</span>
              <span className="font-medium">{formatCurrency(data.current_life_insurance)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
