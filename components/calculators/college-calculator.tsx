"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GraduationCap } from "lucide-react"

export function CollegeCalculator() {
  const [childAge, setChildAge] = useState(5)
  const [collegeType, setCollegeType] = useState<"instate" | "private">("instate")
  const [currentSavings, setCurrentSavings] = useState(0)
  const [monthlySavings, setMonthlySavings] = useState(0)

  const currentCostPerYear = collegeType === "private" ? 75000 : 30000
  const inflationRate = 0.05
  const investmentReturn = 0.07

  const yearsUntilCollege = Math.max(0, 18 - childAge)
  const futureCostPerYear = currentCostPerYear * Math.pow(1 + inflationRate, yearsUntilCollege)
  const totalCollegeCost = futureCostPerYear * 4

  // Future value of current savings
  const futureValueCurrent = currentSavings * Math.pow(1 + investmentReturn, yearsUntilCollege)

  // Future value of monthly contributions
  const monthlyRate = investmentReturn / 12
  const months = yearsUntilCollege * 12
  const futureValueContributions =
    months > 0 ? monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) : 0

  const totalSavings = futureValueCurrent + futureValueContributions
  const gap = totalCollegeCost - totalSavings

  // Calculate required monthly savings to close gap
  const requiredMonthlySavings =
    months > 0 && gap > 0 ? (gap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1) : 0

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-chart-3/20 rounded-lg">
          <GraduationCap className="h-6 w-6 text-chart-3" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">College Savings Calculator</h3>
          <p className="text-sm text-muted-foreground">Plan for education expenses</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="child-age">Child's Current Age</Label>
            <Input
              id="child-age"
              type="number"
              value={childAge}
              onChange={(e) => setChildAge(Number.parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              max="18"
            />
            <p className="text-xs text-muted-foreground">{yearsUntilCollege} years until college</p>
          </div>

          <div className="space-y-2">
            <Label>Type of College</Label>
            <RadioGroup value={collegeType} onValueChange={(value) => setCollegeType(value as "instate" | "private")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instate" id="instate-college" />
                <label htmlFor="instate-college" className="text-sm font-medium">
                  In-State Public University (${currentCostPerYear.toLocaleString()}/year)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private-college" />
                <label htmlFor="private-college" className="text-sm font-medium">
                  Private University (${currentCostPerYear.toLocaleString()}/year)
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-college-savings">Current College Savings</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="current-college-savings"
                type="text"
                className="pl-7"
                value={formatCurrency(currentSavings)}
                onChange={(e) => setCurrentSavings(parseCurrency(e.target.value))}
                placeholder="20,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">529 plan and other savings</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-college-savings">Monthly Contribution</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="monthly-college-savings"
                type="text"
                className="pl-7"
                value={formatCurrency(monthlySavings)}
                onChange={(e) => setMonthlySavings(parseCurrency(e.target.value))}
                placeholder="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">Monthly college savings amount</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-chart-3/10 border border-chart-3/20 rounded-lg">
            <h4 className="font-semibold text-foreground mb-4">Projection</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Future Annual Cost</p>
                <p className="text-lg font-medium text-foreground">${Math.round(futureCostPerYear).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total 4-Year Cost</p>
                <p className="text-2xl font-bold text-chart-3">${Math.round(totalCollegeCost).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Projected Savings</p>
                <p className="text-xl font-bold text-foreground">${Math.round(totalSavings).toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Savings Gap</p>
                <p className={`text-xl font-bold ${gap > 0 ? "text-destructive" : "text-chart-1"}`}>
                  {gap > 0 ? "-" : "+"}${Math.abs(Math.round(gap)).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {gap > 0 ? "Additional savings needed" : "You're on track!"}
                </p>
              </div>
            </div>
          </div>

          {gap > 0 && yearsUntilCollege > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="font-medium text-foreground mb-2">To Fully Fund College</h5>
              <p className="text-sm text-muted-foreground mb-2">
                You need to save an additional ${Math.round(requiredMonthlySavings).toLocaleString()} per month.
              </p>
              <p className="text-sm text-muted-foreground">
                Total monthly savings needed: ${Math.round(monthlySavings + requiredMonthlySavings).toLocaleString()}
              </p>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-foreground mb-2">Assumptions</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 5% annual college cost inflation</li>
              <li>• 7% investment return</li>
              <li>• 4 years of college</li>
              <li>• Not including financial aid or scholarships</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
