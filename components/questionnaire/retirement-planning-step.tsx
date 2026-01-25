"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function RetirementPlanningStep({ data, updateData }: Props) {
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
      {/* 401K / 403B */}
      <Card>
        <CardHeader>
          <CardTitle>401K / 403B Retirement Plans</CardTitle>
          <CardDescription>Current and projected retirement account values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_401k_him"
                checked={data.has_401k_him || false}
                onCheckedChange={(checked) => updateData({ has_401k_him: checked })}
              />
              <Label htmlFor="has_401k_him" className="font-normal cursor-pointer">
                Him - Has 401K
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_401k_her"
                checked={data.has_401k_her || false}
                onCheckedChange={(checked) => updateData({ has_401k_her: checked })}
              />
              <Label htmlFor="has_401k_her" className="font-normal cursor-pointer">
                Her - Has 401K
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="current_401k_value">Current 401K Value (Combined)</Label>
            <Input
              id="current_401k_value"
              type="number"
              value={formatCurrency(data.current_401k_value)}
              onChange={(e) => updateData({ current_401k_value: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_match_him">Company Match % (Him)</Label>
              <Input
                id="company_match_him"
                type="number"
                value={data.company_match_him || ""}
                onChange={(e) => updateData({ company_match_him: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="company_match_her">Company Match % (Her)</Label>
              <Input
                id="company_match_her"
                type="number"
                value={data.company_match_her || ""}
                onChange={(e) => updateData({ company_match_her: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="max_funding_401k_him"
                checked={data.max_funding_401k_him || false}
                onCheckedChange={(checked) => updateData({ max_funding_401k_him: checked })}
              />
              <Label htmlFor="max_funding_401k_him" className="font-normal cursor-pointer">
                Max Funding (~$23.5K) - Him
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="max_funding_401k_her"
                checked={data.max_funding_401k_her || false}
                onCheckedChange={(checked) => updateData({ max_funding_401k_her: checked })}
              />
              <Label htmlFor="max_funding_401k_her" className="font-normal cursor-pointer">
                Max Funding (~$23.5K) - Her
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="projected_401k_at_65">Projected 401K Value at Age 65</Label>
            <Input
              id="projected_401k_at_65"
              type="number"
              value={formatCurrency(data.projected_401k_at_65)}
              onChange={(e) => updateData({ projected_401k_at_65: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* IRA Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>IRA & Other Tax-Advantaged Accounts</CardTitle>
          <CardDescription>Traditional IRA, Roth IRA, HSA, and SEP-IRA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_traditional_ira"
                checked={data.has_traditional_ira || false}
                onCheckedChange={(checked) => updateData({ has_traditional_ira: checked })}
              />
              <Label htmlFor="has_traditional_ira" className="font-normal cursor-pointer">
                Traditional IRA / SEP-IRA (Tax-Deferred)
              </Label>
            </div>
            {data.has_traditional_ira && (
              <div>
                <Label htmlFor="traditional_ira_value">Traditional IRA Value</Label>
                <Input
                  id="traditional_ira_value"
                  type="number"
                  value={formatCurrency(data.traditional_ira_value)}
                  onChange={(e) => updateData({ traditional_ira_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_roth_ira"
                checked={data.has_roth_ira || false}
                onCheckedChange={(checked) => updateData({ has_roth_ira: checked })}
              />
              <Label htmlFor="has_roth_ira" className="font-normal cursor-pointer">
                Roth IRA / Roth 401K (Tax-Free)
              </Label>
            </div>
            {data.has_roth_ira && (
              <div>
                <Label htmlFor="roth_ira_value">Roth IRA Value</Label>
                <Input
                  id="roth_ira_value"
                  type="number"
                  value={formatCurrency(data.roth_ira_value)}
                  onChange={(e) => updateData({ roth_ira_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_hsa"
                checked={data.has_hsa || false}
                onCheckedChange={(checked) => updateData({ has_hsa: checked })}
              />
              <Label htmlFor="has_hsa" className="font-normal cursor-pointer">
                HSA / FSA
              </Label>
            </div>
            {data.has_hsa && (
              <div>
                <Label htmlFor="hsa_value">HSA Value</Label>
                <Input
                  id="hsa_value"
                  type="number"
                  value={formatCurrency(data.hsa_value)}
                  onChange={(e) => updateData({ hsa_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Security & Pension */}
      <Card>
        <CardHeader>
          <CardTitle>Social Security & Pension</CardTitle>
          <CardDescription>Government benefits and employer pensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="social_security_projected">Social Security Projected Annual Income</Label>
            <Input
              id="social_security_projected"
              type="number"
              value={formatCurrency(data.social_security_projected)}
              onChange={(e) => updateData({ social_security_projected: parseCurrency(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">Check ssa.gov for your estimate</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_pension"
                checked={data.has_pension || false}
                onCheckedChange={(checked) => updateData({ has_pension: checked })}
              />
              <Label htmlFor="has_pension" className="font-normal cursor-pointer">
                Pension / Annuities
              </Label>
            </div>
            {data.has_pension && (
              <div>
                <Label htmlFor="pension_value">Pension Present Value</Label>
                <Input
                  id="pension_value"
                  type="number"
                  value={formatCurrency(data.pension_value)}
                  onChange={(e) => updateData({ pension_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
