"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Info } from "lucide-react"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function FinancialGoalsStep({ data, updateData }: Props) {
  const [numChildren, setNumChildren] = useState(data.number_of_children || 0)

  const formatCurrency = (value: number | undefined) => {
    if (!value) return ""
    return value.toString()
  }

  const parseCurrency = (value: string) => {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
    return isNaN(parsed) ? 0 : parsed
  }

  const calculateYearsToCollege = (age: number) => {
    return Math.max(0, 18 - age)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>College Planning - Child Information</CardTitle>
              <CardDescription>Plan college funding for each child</CardDescription>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" size="sm">
                  <Info className="h-4 w-4 mr-1" />
                  Click here to know more
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>College Cost Information</SheetTitle>
                  <SheetDescription>Understanding college expenses and planning</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Average College Costs (4-Year Total)</h4>
                    <div className="space-y-2 text-sm">
                      <p>• Public In-State: $80,000 - $120,000</p>
                      <p>• Public Out-of-State: $150,000 - $200,000</p>
                      <p>• Private University: $200,000 - $400,000</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Education Inflation</h4>
                    <p className="text-sm">
                      College costs typically rise at 5% annually, higher than general inflation (3%).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Example Calculation</h4>
                    <p className="text-sm">
                      For a 10-year-old child going to a private college:
                      <br />• Cost today: $400,000
                      <br />• Years until college: 8 years
                      <br />• Future cost: $400,000 × (1.05)^8 = $591,000
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="number_of_children">Number of Children</Label>
            <Select
              value={numChildren.toString()}
              onValueChange={(value) => {
                const num = Number.parseInt(value)
                setNumChildren(num)
                updateData({ number_of_children: num })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {numChildren > 0 && (
            <div className="space-y-6">
              {Array.from({ length: numChildren }, (_, i) => i + 1).map((childNum) => (
                <div key={childNum} className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Child {childNum}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`child${childNum}_name`}>Child Name</Label>
                      <Input
                        id={`child${childNum}_name`}
                        type="text"
                        value={data[`college_child${childNum}_name`] || ""}
                        onChange={(e) => updateData({ [`college_child${childNum}_name`]: e.target.value })}
                        placeholder="Child's name"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`child${childNum}_age`}>Current Age (0-18)</Label>
                      <Input
                        id={`child${childNum}_age`}
                        type="number"
                        min="0"
                        max="18"
                        value={data[`college_child${childNum}_age`] || ""}
                        onChange={(e) => {
                          const age = Number.parseInt(e.target.value) || 0
                          const yearsToCollege = calculateYearsToCollege(age)
                          updateData({
                            [`college_child${childNum}_age`]: age,
                            [`college_child${childNum}_years_to_college`]: yearsToCollege,
                          })
                        }}
                        placeholder="Age"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`child${childNum}_years_to_college`}>Years to College (Auto-calc)</Label>
                      <Input
                        id={`child${childNum}_years_to_college`}
                        type="number"
                        value={
                          data[`college_child${childNum}_years_to_college`] ||
                          calculateYearsToCollege(data[`college_child${childNum}_age`] || 0)
                        }
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`child${childNum}_college_cost`}>Estimated College Cost ($)</Label>
                      <Select
                        value={data[`college_child${childNum}_college_cost`]?.toString() || "400000"}
                        onValueChange={(value) =>
                          updateData({ [`college_child${childNum}_college_cost`]: Number.parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="80000">$80,000 (Public In-State)</SelectItem>
                          <SelectItem value="120000">$120,000 (Public Out-of-State)</SelectItem>
                          <SelectItem value="200000">$200,000 (Private)</SelectItem>
                          <SelectItem value="400000">$400,000 (Top Private)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm font-medium">Total College Funding Needed (Today's Dollars)</p>
                <p className="text-2xl font-bold text-primary">
                  $
                  {Array.from({ length: numChildren }, (_, i) => i + 1)
                    .reduce((sum, childNum) => sum + (data[`college_child${childNum}_college_cost`] || 400000), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retirement Planning with Tax Calculations</CardTitle>
              <CardDescription>Calculate your retirement needs with tax adjustments</CardDescription>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" size="sm">
                  <Info className="h-4 w-4 mr-1" />
                  Click here to know more
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Retirement Planning Information</SheetTitle>
                  <SheetDescription>Understanding retirement income needs</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Tax Bracket Explanation</h4>
                    <p className="text-sm">
                      In retirement, you'll pay taxes on withdrawals from 401k and Traditional IRA. The default 22% tax
                      rate is a common retirement bracket, but yours may vary.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Inflation Impact</h4>
                    <p className="text-sm">
                      We use 3% annual inflation. What costs $80,000 today will cost much more in 27 years.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Example Calculation</h4>
                    <p className="text-sm">
                      • Annual expenses: $80,000
                      <br />• Tax rate: 22%
                      <br />• Pre-tax needed: $80,000 ÷ (1 - 0.22) = $102,564
                      <br />• Years to retirement: 27
                      <br />• Future value: $102,564 × (1.03)^27 = $228,000
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_age">Current Age (Auto-filled from profile)</Label>
              <Input
                id="current_age"
                type="number"
                value={data.current_age || ""}
                onChange={(e) => updateData({ current_age: Number.parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="retirement_age">Retirement Age (55-75)</Label>
              <Input
                id="retirement_age"
                type="number"
                min="55"
                max="75"
                value={data.retirement_age || ""}
                onChange={(e) => {
                  const retirementAge = Number.parseInt(e.target.value) || 65
                  const currentAge = data.current_age || 38
                  const yearsToRetirement = retirementAge - currentAge
                  updateData({
                    retirement_age: retirementAge,
                    years_to_retirement: yearsToRetirement,
                  })
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="years_to_retirement">Years to Retirement (Auto-calc)</Label>
              <Input
                id="years_to_retirement"
                type="number"
                value={data.years_to_retirement || (data.retirement_age || 65) - (data.current_age || 38)}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="monthly_retirement_expenses">Monthly Retirement Expenses (Today's $)</Label>
              <Input
                id="monthly_retirement_expenses"
                type="number"
                value={formatCurrency(data.monthly_retirement_expenses)}
                onChange={(e) => {
                  const monthly = parseCurrency(e.target.value)
                  updateData({
                    monthly_retirement_expenses: monthly,
                    annual_retirement_expenses: monthly * 12,
                  })
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="annual_retirement_expenses">Annual Expenses (Auto-calc)</Label>
              <Input
                id="annual_retirement_expenses"
                type="number"
                value={formatCurrency(data.annual_retirement_expenses || (data.monthly_retirement_expenses || 0) * 12)}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="tax_rate_assumption">Tax Rate Assumption (%)</Label>
              <Input
                id="tax_rate_assumption"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.tax_rate_assumption || 22}
                onChange={(e) => {
                  const taxRate = Number.parseFloat(e.target.value) || 22
                  const annualExpenses = data.annual_retirement_expenses || 0
                  const preTaxNeeded = annualExpenses / (1 - taxRate / 100)
                  updateData({
                    tax_rate_assumption: taxRate,
                    pre_tax_income_needed: preTaxNeeded,
                  })
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="pre_tax_income_needed">Pre-Tax Income Needed (Auto-calc)</Label>
              <Input
                id="pre_tax_income_needed"
                type="number"
                value={formatCurrency(
                  data.pre_tax_income_needed ||
                    (data.annual_retirement_expenses || 0) / (1 - (data.tax_rate_assumption || 22) / 100),
                )}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Formula: Annual Expenses ÷ (1 - Tax Rate)</p>
            </div>

            <div>
              <Label htmlFor="inflation_adjusted_amount">Inflation-Adjusted Amount (Future $)</Label>
              <Input
                id="inflation_adjusted_amount"
                type="number"
                value={formatCurrency(
                  data.inflation_adjusted_amount ||
                    Math.round((data.pre_tax_income_needed || 0) * Math.pow(1.03, data.years_to_retirement || 27)),
                )}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Formula: Pre-tax × (1.03)^years</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Today's Dollars</p>
              <p className="text-2xl font-bold">${Math.round(data.pre_tax_income_needed || 0).toLocaleString()}/year</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Future Dollars (at retirement)</p>
              <p className="text-2xl font-bold">
                $
                {Math.round(
                  (data.pre_tax_income_needed || 0) * Math.pow(1.03, data.years_to_retirement || 27),
                ).toLocaleString()}
                /year
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Long-Term Care & Medical Planning</CardTitle>
              <CardDescription>Plan for medical and long-term care expenses</CardDescription>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" size="sm">
                  <Info className="h-4 w-4 mr-1" />
                  Click here to know more
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Healthcare Cost Information</SheetTitle>
                  <SheetDescription>Understanding medical expenses in retirement</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Average Healthcare Costs in Retirement</h4>
                    <p className="text-sm">
                      A couple retiring at 65 can expect to spend ~$315,000 on healthcare over 20+ years (today's
                      dollars).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Medicare Coverage Gaps</h4>
                    <p className="text-sm">
                      Medicare doesn't cover everything. Plan for premiums, deductibles, co-pays, and services not
                      covered.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Long-Term Care Costs</h4>
                    <p className="text-sm">
                      • Nursing home: ~$10,000/month
                      <br />• In-home care: ~$5,000/month
                      <br />• Average stay: 2-3 years
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medical_budget_self">Medical Out-of-Pocket Budget - Self ($)</Label>
              <Input
                id="medical_budget_self"
                type="number"
                value={formatCurrency(data.medical_budget_self)}
                onChange={(e) => {
                  const value = parseCurrency(e.target.value)
                  updateData({
                    medical_budget_self: value,
                    total_healthcare_budget:
                      value +
                      (data.medical_budget_spouse || 0) +
                      (data.ltc_budget_self || 0) +
                      (data.ltc_budget_spouse || 0),
                  })
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="medical_budget_spouse">Medical Out-of-Pocket Budget - Spouse ($)</Label>
              <Input
                id="medical_budget_spouse"
                type="number"
                value={formatCurrency(data.medical_budget_spouse)}
                onChange={(e) => {
                  const value = parseCurrency(e.target.value)
                  updateData({
                    medical_budget_spouse: value,
                    total_healthcare_budget:
                      (data.medical_budget_self || 0) +
                      value +
                      (data.ltc_budget_self || 0) +
                      (data.ltc_budget_spouse || 0),
                  })
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="ltc_budget_self">Long-Term Care Budget - Self ($)</Label>
              <Input
                id="ltc_budget_self"
                type="number"
                value={formatCurrency(data.ltc_budget_self)}
                onChange={(e) => {
                  const value = parseCurrency(e.target.value)
                  updateData({
                    ltc_budget_self: value,
                    total_healthcare_budget:
                      (data.medical_budget_self || 0) +
                      (data.medical_budget_spouse || 0) +
                      value +
                      (data.ltc_budget_spouse || 0),
                  })
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="ltc_budget_spouse">Long-Term Care Budget - Spouse ($)</Label>
              <Input
                id="ltc_budget_spouse"
                type="number"
                value={formatCurrency(data.ltc_budget_spouse)}
                onChange={(e) => {
                  const value = parseCurrency(e.target.value)
                  updateData({
                    ltc_budget_spouse: value,
                    total_healthcare_budget:
                      (data.medical_budget_self || 0) +
                      (data.medical_budget_spouse || 0) +
                      (data.ltc_budget_self || 0) +
                      value,
                  })
                }}
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm font-medium">Total Healthcare Budget</p>
            <p className="text-2xl font-bold text-primary">
              $
              {(
                (data.medical_budget_self || 0) +
                (data.medical_budget_spouse || 0) +
                (data.ltc_budget_self || 0) +
                (data.ltc_budget_spouse || 0)
              ).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legacy Planning</CardTitle>
          <CardDescription>Travel, charity, and other legacy goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="travel_budget">Travel/Pilgrimage Budget ($)</Label>
              <Input
                id="travel_budget"
                type="number"
                value={formatCurrency(data.travel_budget)}
                onChange={(e) => updateData({ travel_budget: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="travel_frequency">Frequency</Label>
              <Select
                value={data.travel_frequency || "annual"}
                onValueChange={(value) => updateData({ travel_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="every_2_years">Every 2 years</SelectItem>
                  <SelectItem value="every_5_years">Every 5 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="charity_annual">Charity/Giving Annual Amount ($)</Label>
              <Input
                id="charity_annual"
                type="number"
                value={formatCurrency(data.charity_annual)}
                onChange={(e) => updateData({ charity_annual: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="legacy_for_children">Legacy for Children ($)</Label>
              <Input
                id="legacy_for_children"
                type="number"
                value={formatCurrency(data.legacy_for_children)}
                onChange={(e) => updateData({ legacy_for_children: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specific_charities">Specific Charities</Label>
            <Textarea
              id="specific_charities"
              value={data.specific_charities || ""}
              onChange={(e) => updateData({ specific_charities: e.target.value })}
              placeholder="List any specific charitable organizations..."
              className="min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="other_life_goals">Other Life Goals</Label>
            <Textarea
              id="other_life_goals"
              value={data.other_life_goals || ""}
              onChange={(e) => updateData({ other_life_goals: e.target.value })}
              placeholder="Describe any other life goals or aspirations..."
              className="min-h-20"
            />
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm font-medium">Total Legacy Budget</p>
            <p className="text-2xl font-bold text-primary">
              $
              {(
                (data.travel_budget || 0) +
                (data.charity_annual || 0) * 20 +
                (data.legacy_for_children || 0)
              ).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Includes travel, 20 years of charitable giving, and legacy amount
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
