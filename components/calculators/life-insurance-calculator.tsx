"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Shield } from "lucide-react"

export function LifeInsuranceCalculator() {
  const [debt, setDebt] = useState(0)
  const [annualIncome, setAnnualIncome] = useState(0)
  const [mortgage, setMortgage] = useState(0)
  const [educationCosts, setEducationCosts] = useState(0)
  const [currentCoverage, setCurrentCoverage] = useState(0)

  const totalNeeded = debt + annualIncome * 10 + mortgage + educationCosts
  const gap = totalNeeded - currentCoverage

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Life Insurance Calculator</h3>
          <p className="text-sm text-muted-foreground">Calculate your needs using the DIME method</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="debt">D - Debt & Final Expenses</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="debt"
                type="text"
                className="pl-7"
                value={formatCurrency(debt)}
                onChange={(e) => setDebt(parseCurrency(e.target.value))}
                placeholder="50,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Credit cards, car loans, student loans, etc.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income">I - Income Replacement</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="income"
                type="text"
                className="pl-7"
                value={formatCurrency(annualIncome)}
                onChange={(e) => setAnnualIncome(parseCurrency(e.target.value))}
                placeholder="150,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual income (will be multiplied by 10 years)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mortgage-calc">M - Mortgage</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="mortgage-calc"
                type="text"
                className="pl-7"
                value={formatCurrency(mortgage)}
                onChange={(e) => setMortgage(parseCurrency(e.target.value))}
                placeholder="350,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Outstanding mortgage balance</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">E - Education</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="education"
                type="text"
                className="pl-7"
                value={formatCurrency(educationCosts)}
                onChange={(e) => setEducationCosts(parseCurrency(e.target.value))}
                placeholder="300,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">College costs for all children</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current">Current Coverage</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="current"
                type="text"
                className="pl-7"
                value={formatCurrency(currentCoverage)}
                onChange={(e) => setCurrentCoverage(parseCurrency(e.target.value))}
                placeholder="500,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Existing life insurance policies</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-foreground mb-4">Results</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Debt & Final Expenses</p>
                <p className="text-lg font-medium text-foreground">${debt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Income Replacement (10 years)</p>
                <p className="text-lg font-medium text-foreground">${(annualIncome * 10).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mortgage</p>
                <p className="text-lg font-medium text-foreground">${mortgage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Education</p>
                <p className="text-lg font-medium text-foreground">${educationCosts.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Coverage Needed</p>
                <p className="text-2xl font-bold text-foreground">${totalNeeded.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Coverage</p>
                <p className="text-xl font-medium text-foreground">${currentCoverage.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Coverage Gap</p>
                <p className={`text-2xl font-bold ${gap > 0 ? "text-destructive" : "text-chart-1"}`}>
                  ${Math.abs(gap).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {gap > 0 ? "Additional coverage needed" : "You're well covered!"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-foreground mb-2">Recommendation</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {gap > 0
                ? `Consider purchasing a term life insurance policy with a death benefit of $${Math.abs(gap).toLocaleString()} to fully protect your family's financial future.`
                : "Your current life insurance coverage appears adequate. Review your coverage annually as your situation changes."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
