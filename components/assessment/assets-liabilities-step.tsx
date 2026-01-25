"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
  updateData: (data: Partial<AssessmentData>) => void
}

export function AssetsLiabilitiesStep({ data, updateData }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return ""
    return value.toLocaleString()
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  const addGrowthAnnuity = () => {
    const current = data.growth_annuities || []
    updateData({
      growth_annuities: [...current, { amount: 0, rate_of_return: 0, provider: "" }],
    })
  }

  const removeGrowthAnnuity = (index: number) => {
    const current = data.growth_annuities || []
    updateData({
      growth_annuities: current.filter((_, i) => i !== index),
    })
  }

  const updateGrowthAnnuity = (index: number, field: string, value: any) => {
    const current = [...(data.growth_annuities || [])]
    current[index] = { ...current[index], [field]: value }
    updateData({ growth_annuities: current })
  }

  const addLifetimeAnnuity = () => {
    const current = data.lifetime_income_annuities || []
    updateData({
      lifetime_income_annuities: [...current, { amount: 0, guaranteed_income: 0 }],
    })
  }

  const removeLifetimeAnnuity = (index: number) => {
    const current = data.lifetime_income_annuities || []
    updateData({
      lifetime_income_annuities: current.filter((_, i) => i !== index),
    })
  }

  const updateLifetimeAnnuity = (index: number, field: string, value: any) => {
    const current = [...(data.lifetime_income_annuities || [])]
    current[index] = { ...current[index], [field]: value }
    updateData({ lifetime_income_annuities: current })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Assets & Liabilities</h3>
        <p className="text-muted-foreground mb-6">Tell us about what you own and what you owe.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Assets</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_fund_amount">Emergency Fund Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="emergency_fund_amount"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.emergency_fund_amount)}
                  onChange={(e) => updateData({ emergency_fund_amount: parseCurrency(e.target.value) })}
                  placeholder="30,000"
                />
              </div>
              <p className="text-xs text-muted-foreground">Liquid savings reserved for emergencies</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checking_balance">Checking Account</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="checking_balance"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.checking_balance)}
                  onChange={(e) => updateData({ checking_balance: parseCurrency(e.target.value) })}
                  placeholder="10,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash_savings">Savings Account</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="cash_savings"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.cash_savings)}
                  onChange={(e) => updateData({ cash_savings: parseCurrency(e.target.value) })}
                  placeholder="50,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment_accounts">Investment/Brokerage Accounts</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="investment_accounts"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.investment_accounts)}
                  onChange={(e) => updateData({ investment_accounts: parseCurrency(e.target.value) })}
                  placeholder="100,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirement_401k">401(k) / 403(b)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="retirement_401k"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.retirement_401k)}
                  onChange={(e) => updateData({ retirement_401k: parseCurrency(e.target.value) })}
                  placeholder="200,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirement_ira">IRA / Roth IRA</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="retirement_ira"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.retirement_ira)}
                  onChange={(e) => updateData({ retirement_ira: parseCurrency(e.target.value) })}
                  placeholder="50,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="home_value">Home Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="home_value"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.home_value)}
                  onChange={(e) => updateData({ home_value: parseCurrency(e.target.value) })}
                  placeholder="500,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_assets">Other Assets</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="other_assets"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.other_assets)}
                  onChange={(e) => updateData({ other_assets: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-border">
          <h4 className="font-medium text-foreground">Annuities</h4>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Checkbox
                checked={data.has_annuities || false}
                onCheckedChange={(checked) => updateData({ has_annuities: checked as boolean })}
              />
              <span>Do you own any annuities?</span>
            </Label>
          </div>

          {data.has_annuities && (
            <div className="space-y-6 pl-6 border-l-2 border-primary/20">
              {/* Growth Annuities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-foreground">Growth Annuities</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGrowthAnnuity}
                    className="gap-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    Add Growth Annuity
                  </Button>
                </div>

                {(data.growth_annuities || []).map((annuity, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Growth Annuity {index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeGrowthAnnuity(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="text"
                            className="pl-7"
                            value={formatCurrency(annuity.amount)}
                            onChange={(e) => updateGrowthAnnuity(index, "amount", parseCurrency(e.target.value))}
                            placeholder="100,000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Rate of Return (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={annuity.rate_of_return}
                          onChange={(e) =>
                            updateGrowthAnnuity(index, "rate_of_return", Number.parseFloat(e.target.value) || 0)
                          }
                          placeholder="5.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Input
                          type="text"
                          value={annuity.provider}
                          onChange={(e) => updateGrowthAnnuity(index, "provider", e.target.value)}
                          placeholder="Provider Name"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!data.growth_annuities || data.growth_annuities.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No growth annuities added</p>
                )}
              </div>

              {/* Lifetime Income Annuities */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-foreground">Lifetime Income Annuities</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLifetimeAnnuity}
                    className="gap-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lifetime Income Annuity
                  </Button>
                </div>

                {(data.lifetime_income_annuities || []).map((annuity, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Lifetime Income Annuity {index + 1}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLifetimeAnnuity(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="text"
                            className="pl-7"
                            value={formatCurrency(annuity.amount)}
                            onChange={(e) => updateLifetimeAnnuity(index, "amount", parseCurrency(e.target.value))}
                            placeholder="200,000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Guaranteed Income from Retirement Age</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="text"
                            className="pl-7"
                            value={formatCurrency(annuity.guaranteed_income)}
                            onChange={(e) =>
                              updateLifetimeAnnuity(index, "guaranteed_income", parseCurrency(e.target.value))
                            }
                            placeholder="12,000"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Annual guaranteed income</p>
                      </div>
                    </div>
                  </div>
                ))}

                {(!data.lifetime_income_annuities || data.lifetime_income_annuities.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">No lifetime income annuities added</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t border-border">
          <h4 className="font-medium text-foreground">Liabilities</h4>

          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <h5 className="text-sm font-medium text-foreground">Mortgage Details</h5>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mortgage_balance">Mortgage Balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="mortgage_balance"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(data.mortgage_balance)}
                    onChange={(e) => updateData({ mortgage_balance: parseCurrency(e.target.value) })}
                    placeholder="350,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mortgage_rate">Interest Rate (%)</Label>
                <Input
                  id="mortgage_rate"
                  type="number"
                  step="0.01"
                  value={data.mortgage_rate || ""}
                  onChange={(e) => updateData({ mortgage_rate: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="3.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mortgage_years_remaining">Years Remaining</Label>
                <Input
                  id="mortgage_years_remaining"
                  type="number"
                  value={data.mortgage_years_remaining || ""}
                  onChange={(e) => updateData({ mortgage_years_remaining: Number.parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student_loans">Student Loans</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="student_loans"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.student_loans)}
                  onChange={(e) => updateData({ student_loans: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto_loans">Auto Loans</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="auto_loans"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.auto_loans)}
                  onChange={(e) => updateData({ auto_loans: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_card_debt">Credit Card Debt</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="credit_card_debt"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.credit_card_debt)}
                  onChange={(e) => updateData({ credit_card_debt: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_debts">Other Debts</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="other_debts"
                  type="text"
                  className="pl-7"
                  value={formatCurrency(data.other_debts)}
                  onChange={(e) => updateData({ other_debts: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
