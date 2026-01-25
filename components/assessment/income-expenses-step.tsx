"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
  updateData: (data: Partial<AssessmentData>) => void
}

export function IncomeExpensesStep({ data, updateData }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return ""
    return value.toLocaleString()
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Income & Expenses</h3>
        <p className="text-muted-foreground mb-6">Help us understand your current cash flow.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Annual Income</h4>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="annual_income">Your Annual Income</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="annual_income"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.annual_income)}
                  onChange={(e) => updateData({ annual_income: parseCurrency(e.target.value) })}
                  placeholder="150,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spouse_annual_income">Spouse/Partner Income</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="spouse_annual_income"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.spouse_annual_income)}
                  onChange={(e) => updateData({ spouse_annual_income: parseCurrency(e.target.value) })}
                  placeholder="120,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter 0 if not applicable</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground">Federal Tax Information</h4>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="federal_taxes_last_year">Average Federal Taxes Paid Last Year</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="federal_taxes_last_year"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.federal_taxes_last_year)}
                  onChange={(e) => updateData({ federal_taxes_last_year: parseCurrency(e.target.value) })}
                  placeholder="30,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_federal_taxes_this_year">Expected Federal Taxes This Year</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="expected_federal_taxes_this_year"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.expected_federal_taxes_this_year)}
                  onChange={(e) => updateData({ expected_federal_taxes_this_year: parseCurrency(e.target.value) })}
                  placeholder="32,000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground">Monthly Expenses</h4>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthly_expenses">Total Monthly Expenses</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="monthly_expenses"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.monthly_expenses)}
                  onChange={(e) => updateData({ monthly_expenses: parseCurrency(e.target.value) })}
                  placeholder="8,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">All monthly household expenses</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_housing_cost">Monthly Housing Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="monthly_housing_cost"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.monthly_housing_cost)}
                  onChange={(e) => updateData({ monthly_housing_cost: parseCurrency(e.target.value) })}
                  placeholder="3,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">Mortgage/rent + property tax + insurance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
