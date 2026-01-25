"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
  updateData: (data: Partial<AssessmentData>) => void
}

export function GoalsStep({ data, updateData }: Props) {
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
        <h3 className="text-xl font-semibold text-foreground mb-4">Goals & Planning</h3>
        <p className="text-muted-foreground mb-6">Help us understand your financial objectives and protection needs.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="desired_retirement_income">Desired Annual Retirement Income</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="desired_retirement_income"
              type="text"
              className="pl-7"
              value={formatCurrency(data.desired_retirement_income)}
              onChange={(e) => updateData({ desired_retirement_income: parseCurrency(e.target.value) })}
              placeholder="100,000"
            />
          </div>
          <p className="text-xs text-muted-foreground">How much would you like to spend annually in retirement?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="college_funding_goal">College Funding Goal</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="college_funding_goal"
              type="text"
              className="pl-7"
              value={formatCurrency(data.college_funding_goal)}
              onChange={(e) => updateData({ college_funding_goal: parseCurrency(e.target.value) })}
              placeholder="200,000"
            />
          </div>
          <p className="text-xs text-muted-foreground">Total amount you want to save for children's education</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency_fund_months">Emergency Fund (Months of Expenses)</Label>
          <Input
            id="emergency_fund_months"
            type="number"
            value={data.emergency_fund_months || ""}
            onChange={(e) => updateData({ emergency_fund_months: Number.parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
            max="24"
          />
          <p className="text-xs text-muted-foreground">
            How many months of expenses do you want to keep as emergency fund?
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <Label>Risk Tolerance</Label>
          <p className="text-sm text-muted-foreground mb-3">How comfortable are you with investment risk?</p>
          <RadioGroup
            value={data.risk_tolerance || "moderate"}
            onValueChange={(value) => updateData({ risk_tolerance: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="conservative" id="conservative" />
              <label htmlFor="conservative" className="text-sm font-medium">
                Conservative - Prefer stability over growth
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <label htmlFor="moderate" className="text-sm font-medium">
                Moderate - Balanced approach to risk and return
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aggressive" id="aggressive" />
              <label htmlFor="aggressive" className="text-sm font-medium">
                Aggressive - Maximize growth potential
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-6 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground">Current Insurance Coverage</h4>

          <div className="space-y-2">
            <Label htmlFor="current_life_insurance">Current Life Insurance Coverage</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="current_life_insurance"
                type="text"
                className="pl-7"
                value={formatCurrency(data.current_life_insurance)}
                onChange={(e) => updateData({ current_life_insurance: parseCurrency(e.target.value) })}
                placeholder="500,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Total death benefit across all policies</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="life_insurance_cash_value">Life Insurance with Cash Value (Current Value)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="life_insurance_cash_value"
                type="text"
                className="pl-7"
                value={formatCurrency(data.life_insurance_cash_value)}
                onChange={(e) => updateData({ life_insurance_cash_value: parseCurrency(e.target.value) })}
                placeholder="50,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Cash value available in your life insurance policy</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="life_insurance_income_stream">Expected Income Stream from Retirement Age till 90</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="life_insurance_income_stream"
                type="text"
                className="pl-7"
                value={formatCurrency(data.life_insurance_income_stream)}
                onChange={(e) => updateData({ life_insurance_income_stream: parseCurrency(e.target.value) })}
                placeholder="5,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual income from life insurance cash value (tax-free)</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="current_disability_insurance"
              checked={data.current_disability_insurance || false}
              onCheckedChange={(checked) => updateData({ current_disability_insurance: checked as boolean })}
            />
            <label
              htmlFor="current_disability_insurance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have disability insurance
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
