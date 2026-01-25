"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PiggyBank } from "lucide-react"

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(35)
  const [retirementAge, setRetirementAge] = useState(65)
  const [currentSavings, setCurrentSavings] = useState(0)
  const [monthlySavings, setMonthlySavings] = useState(0)
  const [desiredIncome, setDesiredIncome] = useState(0)

  const yearsToRetirement = Math.max(0, retirementAge - currentAge)
  const growthRate = 0.07
  const monthlyRate = growthRate / 12
  const months = yearsToRetirement * 12

  // Future value calculation
  const futureValueCurrent = currentSavings * Math.pow(1 + growthRate, yearsToRetirement)
  const futureValueContributions =
    months > 0 ? monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) : 0
  const totalAtRetirement = futureValueCurrent + futureValueContributions

  // 4% rule
  const annualIncome = totalAtRetirement * 0.04
  const gap = desiredIncome - annualIncome

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-chart-2/20 rounded-lg">
          <PiggyBank className="h-6 w-6 text-chart-2" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Retirement Calculator</h3>
          <p className="text-sm text-muted-foreground">Project your retirement savings</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-age">Current Age</Label>
              <Input
                id="current-age"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number.parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirement-age">Retirement Age</Label>
              <Input
                id="retirement-age"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number.parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-savings">Current Retirement Savings</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="current-savings"
                type="text"
                className="pl-7"
                value={formatCurrency(currentSavings)}
                onChange={(e) => setCurrentSavings(parseCurrency(e.target.value))}
                placeholder="200,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">401(k), IRA, and other retirement accounts</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-savings">Monthly Contribution</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="monthly-savings"
                type="text"
                className="pl-7"
                value={formatCurrency(monthlySavings)}
                onChange={(e) => setMonthlySavings(parseCurrency(e.target.value))}
                placeholder="1,500"
              />
            </div>
            <p className="text-xs text-muted-foreground">How much you save monthly for retirement</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired-income">Desired Annual Retirement Income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="desired-income"
                type="text"
                className="pl-7"
                value={formatCurrency(desiredIncome)}
                onChange={(e) => setDesiredIncome(parseCurrency(e.target.value))}
                placeholder="100,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual spending goal in retirement</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-chart-2/10 border border-chart-2/20 rounded-lg">
            <h4 className="font-semibold text-foreground mb-4">Projection</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Years Until Retirement</p>
                <p className="text-lg font-medium text-foreground">{yearsToRetirement}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total at Retirement</p>
                <p className="text-2xl font-bold text-chart-2">${Math.round(totalAtRetirement).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Income (4% Rule)</p>
                <p className="text-xl font-bold text-foreground">${Math.round(annualIncome).toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Desired Income</p>
                <p className="text-lg font-medium text-foreground">${desiredIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Income Gap</p>
                <p className={`text-xl font-bold ${gap > 0 ? "text-destructive" : "text-chart-1"}`}>
                  {gap > 0 ? "-" : "+"}${Math.abs(Math.round(gap)).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{gap > 0 ? "Shortfall" : "Surplus"} per year</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-foreground mb-2">Assumptions</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 7% average annual return</li>
              <li>• 4% safe withdrawal rate in retirement</li>
              <li>• Not accounting for inflation or taxes</li>
              <li>• Social Security not included</li>
            </ul>
          </div>

          {gap > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-foreground mb-2">To Close the Gap</h5>
              <p className="text-sm text-muted-foreground">
                You would need to save an additional $
                {Math.round((gap / 0.04 - totalAtRetirement) / months).toLocaleString()} per month to reach your income
                goal.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
