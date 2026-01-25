"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function InsuranceProtectionStep({ data, updateData }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return ""
    return value.toString()
  }

  const parseCurrency = (value: string) => {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
    return isNaN(parsed) ? 0 : parsed
  }

  return (
    <div className="space-y-6">
      {/* Life Insurance */}
      <Card>
        <CardHeader>
          <CardTitle>Family Protection & Life Insurance</CardTitle>
          <CardDescription>Current life insurance coverage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="life_insurance_work_him">Life Insurance at Work (Him)</Label>
              <Input
                id="life_insurance_work_him"
                type="number"
                value={formatCurrency(data.life_insurance_work_him)}
                onChange={(e) => updateData({ life_insurance_work_him: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="life_insurance_work_her">Life Insurance at Work (Her)</Label>
              <Input
                id="life_insurance_work_her"
                type="number"
                value={formatCurrency(data.life_insurance_work_her)}
                onChange={(e) => updateData({ life_insurance_work_her: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="life_insurance_outside_him">Life Insurance Outside Work (Him)</Label>
              <Input
                id="life_insurance_outside_him"
                type="number"
                value={formatCurrency(data.life_insurance_outside_him)}
                onChange={(e) => updateData({ life_insurance_outside_him: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="life_insurance_outside_her">Life Insurance Outside Work (Her)</Label>
              <Input
                id="life_insurance_outside_her"
                type="number"
                value={formatCurrency(data.life_insurance_outside_her)}
                onChange={(e) => updateData({ life_insurance_outside_her: parseCurrency(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_cash_value_life_insurance"
              checked={data.is_cash_value_life_insurance || false}
              onCheckedChange={(checked) => updateData({ is_cash_value_life_insurance: checked })}
            />
            <Label htmlFor="is_cash_value_life_insurance" className="font-normal cursor-pointer">
              Is it Cash Value Life Insurance?
            </Label>
          </div>

          {data.is_cash_value_life_insurance && (
            <div>
              <Label htmlFor="life_insurance_company">Insurance Company & Policy Duration</Label>
              <Input
                id="life_insurance_company"
                type="text"
                value={data.life_insurance_company || ""}
                onChange={(e) => updateData({ life_insurance_company: e.target.value })}
                placeholder="e.g., MetLife - 20 years"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Insurance */}
      <Card>
        <CardHeader>
          <CardTitle>Other Insurance Coverage</CardTitle>
          <CardDescription>Disability, long-term care, and liability protection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_disability_insurance"
              checked={data.has_disability_insurance || false}
              onCheckedChange={(checked) => updateData({ has_disability_insurance: checked })}
            />
            <Label htmlFor="has_disability_insurance" className="font-normal cursor-pointer">
              Short Term / Long Term Disability at Work
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_long_term_care_insurance"
              checked={data.has_long_term_care_insurance || false}
              onCheckedChange={(checked) => updateData({ has_long_term_care_insurance: checked })}
            />
            <Label htmlFor="has_long_term_care_insurance" className="font-normal cursor-pointer">
              Long Term Care Insurance Outside of Work
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_mortgage_protection"
              checked={data.has_mortgage_protection || false}
              onCheckedChange={(checked) => updateData({ has_mortgage_protection: checked })}
            />
            <Label htmlFor="has_mortgage_protection" className="font-normal cursor-pointer">
              Mortgage Protection Insurance
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_umbrella_insurance"
              checked={data.has_umbrella_insurance || false}
              onCheckedChange={(checked) => updateData({ has_umbrella_insurance: checked })}
            />
            <Label htmlFor="has_umbrella_insurance" className="font-normal cursor-pointer">
              Umbrella Insurance
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* College & Estate Planning */}
      <Card>
        <CardHeader>
          <CardTitle>College Planning & Estate Planning</CardTitle>
          <CardDescription>529 plans and estate documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_529_plans"
                checked={data.has_529_plans || false}
                onCheckedChange={(checked) => updateData({ has_529_plans: checked })}
              />
              <Label htmlFor="has_529_plans" className="font-normal cursor-pointer">
                529 Plans / State Pre-Paid Plans
              </Label>
            </div>
            {data.has_529_plans && (
              <div>
                <Label htmlFor="plan_529_value">529 Plan Value</Label>
                <Input
                  id="plan_529_value"
                  type="number"
                  value={formatCurrency(data.plan_529_value)}
                  onChange={(e) => updateData({ plan_529_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_will_and_trust"
                checked={data.has_will_and_trust || false}
                onCheckedChange={(checked) => updateData({ has_will_and_trust: checked })}
              />
              <Label htmlFor="has_will_and_trust" className="font-normal cursor-pointer">
                Will & Trust (Estate Planning)
              </Label>
            </div>
            {data.has_will_and_trust && (
              <div>
                <Label htmlFor="estate_planning_updated_year">Year Last Updated</Label>
                <Input
                  id="estate_planning_updated_year"
                  type="number"
                  value={data.estate_planning_updated_year || ""}
                  onChange={(e) => updateData({ estate_planning_updated_year: Number.parseInt(e.target.value) || 0 })}
                  placeholder="2024"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget & Cash Flow</CardTitle>
          <CardDescription>Understanding your income and expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="monthly_net_pay">Monthly Net Pay (After Tax + 401K)</Label>
            <Input
              id="monthly_net_pay"
              type="number"
              value={formatCurrency(data.monthly_net_pay)}
              onChange={(e) => updateData({ monthly_net_pay: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="monthly_mortgage_rent">Real Estate (Mortgage/Rent) - Recommended 30%</Label>
            <Input
              id="monthly_mortgage_rent"
              type="number"
              value={formatCurrency(data.monthly_mortgage_rent)}
              onChange={(e) => updateData({ monthly_mortgage_rent: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="monthly_retirement_savings">Retirement Savings - Recommended 20%</Label>
            <Input
              id="monthly_retirement_savings"
              type="number"
              value={formatCurrency(data.monthly_retirement_savings)}
              onChange={(e) => updateData({ monthly_retirement_savings: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="monthly_lifestyle">Lifestyle (Food, Entertainment, etc.) - Recommended 30%</Label>
            <Input
              id="monthly_lifestyle"
              type="number"
              value={formatCurrency(data.monthly_lifestyle)}
              onChange={(e) => updateData({ monthly_lifestyle: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="monthly_short_term_savings">Short Term Savings - Recommended 20%</Label>
            <Input
              id="monthly_short_term_savings"
              type="number"
              value={formatCurrency(data.monthly_short_term_savings)}
              onChange={(e) => updateData({ monthly_short_term_savings: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
