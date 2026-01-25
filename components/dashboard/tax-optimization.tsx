"use client"

import { Card } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
}

export function TaxOptimization({ data }: Props) {
  const totalIncome = (data.annualIncome || 0) + (data.spouseIncome || 0)
  const taxRate = (data.taxRate || 25) / 100
  const currentTaxes = totalIncome * taxRate

  const traditional401k = data.retirement401k || 0
  const rothIRA = data.rothIRA || 0
  const hsa = data.hsa || 0

  // Calculate tax savings opportunities
  const max401k = 23000
  const maxIRA = 7000
  const maxHSA = 8300

  const currentAge = data.age || 35
  const retirementAge = data.retirementAge || 65

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tax Optimization Strategy</h3>
            <p className="text-sm text-muted-foreground">Strategies to reduce your tax burden</p>
          </div>
        </div>

        <div className="mb-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Annual Tax Bill</p>
              <p className="text-3xl font-bold text-foreground">${Math.round(currentTaxes).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">At {data.taxRate}% effective rate</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tax-Advantaged Savings</p>
              <p className="text-3xl font-bold text-foreground">
                ${(traditional401k + rothIRA + hsa).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Current contributions</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Tax-Advantaged Account Limits</h4>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-foreground">401(k) Contributions</h5>
              <span className="text-sm text-muted-foreground">
                Limit: ${max401k.toLocaleString()}
                {currentAge >= 50 && " + $7,500 catch-up"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Pre-tax contributions reduce your taxable income. Every dollar contributed saves you $
              {(taxRate * 100).toFixed(0)}¢ in taxes.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential Tax Savings:</span>
              <span className="font-medium text-chart-1">
                ${Math.round((max401k - traditional401k / 2) * taxRate).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-foreground">Health Savings Account (HSA)</h5>
              <span className="text-sm text-muted-foreground">
                Limit: ${maxHSA.toLocaleString()}
                {currentAge >= 55 && " + $1,000 catch-up"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Triple tax advantage: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical
              expenses.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential Tax Savings:</span>
              <span className="font-medium text-chart-1">${Math.round((maxHSA - hsa) * taxRate).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-foreground">Roth IRA</h5>
              <span className="text-sm text-muted-foreground">
                Limit: ${maxIRA.toLocaleString()}
                {currentAge >= 50 && " + $1,000 catch-up"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              While Roth contributions aren't tax-deductible, qualified withdrawals in retirement are completely
              tax-free, including all growth.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Advanced Tax Strategies</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Roth Conversion Strategy</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In years with lower income (early retirement, sabbatical), consider converting traditional IRA/401(k)
              funds to Roth. You'll pay taxes now at a lower rate to enjoy tax-free withdrawals later.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Tax-Loss Harvesting</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In taxable brokerage accounts, sell investments at a loss to offset capital gains and reduce your tax
              bill. You can deduct up to $3,000 in net losses against ordinary income annually.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Qualified Charitable Distributions (QCDs)</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentAge >= 70.5
                ? "You're eligible for QCDs! Transfer up to $105,000 directly from your IRA to charity tax-free, satisfying your Required Minimum Distribution."
                : `At age 70.5, you'll be eligible for QCDs, allowing tax-free charitable giving directly from your IRA.`}
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Asset Location Strategy</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Place tax-inefficient investments (bonds, REITs) in tax-advantaged accounts and tax-efficient investments
              (index funds, growth stocks) in taxable accounts to minimize your overall tax burden.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
