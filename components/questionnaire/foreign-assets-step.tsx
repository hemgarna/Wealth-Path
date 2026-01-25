"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function ForeignAssetsStep({ data, updateData }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return ""
    return value.toString()
  }

  const parseCurrency = (value: string) => {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
    return isNaN(parsed) ? 0 : parsed
  }

  // Calculate total FBAR amount
  const calculateTotalFBAR = () => {
    const total =
      (data.offshore_retirement_funds || 0) +
      (data.offshore_pension || 0) +
      (data.offshore_real_estate_value || 0) +
      (data.offshore_business_value || 0) +
      (data.offshore_inheritance || 0) +
      (data.offshore_stocks || 0) +
      (data.offshore_mutual_funds || 0) +
      (data.offshore_fixed_deposits || 0) +
      (data.offshore_savings_accounts || 0) +
      (data.offshore_gold_silver || 0) +
      (data.offshore_life_insurance || 0) +
      (data.offshore_health_insurance || 0) +
      (data.offshore_emergency_fund || 0) +
      (data.offshore_other_investments || 0)

    return total
  }

  const totalFBAR = calculateTotalFBAR()
  const requiresFBAR = totalFBAR > 10000

  return (
    <div className="space-y-6">
      {/* FBAR/FATCA Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>FBAR/FATCA Reporting Requirements</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            <strong>FBAR:</strong> If you have over $10,000 in foreign accounts at any time during the year, you must
            file FBAR (Report of Foreign Bank and Financial Accounts) with the US Treasury.
          </p>
          <p>
            <strong>FATCA (Form 8938):</strong> If your foreign assets exceed $50,000, you must file Form 8938 with your
            tax return.
          </p>
        </AlertDescription>
      </Alert>

      {/* Retirement Plans Offshore */}
      <Card>
        <CardHeader>
          <CardTitle>Retirement Plans (Offshore)</CardTitle>
          <CardDescription>Foreign retirement funds and pensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="offshore_retirement_funds">Retirement Funds (Offshore)</Label>
            <Input
              id="offshore_retirement_funds"
              type="number"
              value={formatCurrency(data.offshore_retirement_funds)}
              onChange={(e) => updateData({ offshore_retirement_funds: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_pension">Pension (Offshore)</Label>
            <Input
              id="offshore_pension"
              type="number"
              value={formatCurrency(data.offshore_pension)}
              onChange={(e) => updateData({ offshore_pension: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Real Estate Offshore */}
      <Card>
        <CardHeader>
          <CardTitle>Real Estate (Offshore)</CardTitle>
          <CardDescription>Foreign properties and rental income</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="offshore_real_estate_value">Real Estate Value (Lands/Plots/Rental Properties)</Label>
            <Input
              id="offshore_real_estate_value"
              type="number"
              value={formatCurrency(data.offshore_real_estate_value)}
              onChange={(e) => updateData({ offshore_real_estate_value: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_rental_income">Annual Rental Income from Foreign Properties</Label>
            <Input
              id="offshore_rental_income"
              type="number"
              value={formatCurrency(data.offshore_rental_income)}
              onChange={(e) => updateData({ offshore_rental_income: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Business & Inheritance Offshore */}
      <Card>
        <CardHeader>
          <CardTitle>Business & Inheritance (Offshore)</CardTitle>
          <CardDescription>Foreign business interests and inherited assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="offshore_business_value">Business (Offshore)</Label>
            <Input
              id="offshore_business_value"
              type="number"
              value={formatCurrency(data.offshore_business_value)}
              onChange={(e) => updateData({ offshore_business_value: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_inheritance">Inheritance Properties (Offshore)</Label>
            <Input
              id="offshore_inheritance"
              type="number"
              value={formatCurrency(data.offshore_inheritance)}
              onChange={(e) => updateData({ offshore_inheritance: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Market Offshore */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Market (Offshore)</CardTitle>
          <CardDescription>Foreign investments and bank accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="offshore_stocks">Stocks/Bonds (Offshore)</Label>
            <Input
              id="offshore_stocks"
              type="number"
              value={formatCurrency(data.offshore_stocks)}
              onChange={(e) => updateData({ offshore_stocks: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_mutual_funds">Mutual Funds/ETFs (Offshore)</Label>
            <Input
              id="offshore_mutual_funds"
              type="number"
              value={formatCurrency(data.offshore_mutual_funds)}
              onChange={(e) => updateData({ offshore_mutual_funds: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_fixed_deposits">Fixed Deposits (FDs) (Offshore)</Label>
            <Input
              id="offshore_fixed_deposits"
              type="number"
              value={formatCurrency(data.offshore_fixed_deposits)}
              onChange={(e) => updateData({ offshore_fixed_deposits: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_savings_accounts">Savings/Checking Accounts (Offshore)</Label>
            <Input
              id="offshore_savings_accounts"
              type="number"
              value={formatCurrency(data.offshore_savings_accounts)}
              onChange={(e) => updateData({ offshore_savings_accounts: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_gold_silver">Gold/Silver/Locker (Offshore)</Label>
            <Input
              id="offshore_gold_silver"
              type="number"
              value={formatCurrency(data.offshore_gold_silver)}
              onChange={(e) => updateData({ offshore_gold_silver: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Insurance & Other Offshore */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance & Other Assets (Offshore)</CardTitle>
          <CardDescription>Foreign insurance policies and miscellaneous investments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="offshore_life_insurance">Life Insurance (Offshore)</Label>
            <Input
              id="offshore_life_insurance"
              type="number"
              value={formatCurrency(data.offshore_life_insurance)}
              onChange={(e) => updateData({ offshore_life_insurance: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_health_insurance">Health Insurance (Offshore)</Label>
            <Input
              id="offshore_health_insurance"
              type="number"
              value={formatCurrency(data.offshore_health_insurance)}
              onChange={(e) => updateData({ offshore_health_insurance: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_emergency_fund">Emergency Fund (Cash/Jewelry/Friends/Relatives) (Offshore)</Label>
            <Input
              id="offshore_emergency_fund"
              type="number"
              value={formatCurrency(data.offshore_emergency_fund)}
              onChange={(e) => updateData({ offshore_emergency_fund: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="offshore_other_investments">Any Other Investments or Money (Offshore)</Label>
            <Input
              id="offshore_other_investments"
              type="number"
              value={formatCurrency(data.offshore_other_investments)}
              onChange={(e) => updateData({ offshore_other_investments: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* FBAR Summary */}
      <Card className={requiresFBAR ? "border-orange-500 bg-orange-50" : ""}>
        <CardHeader>
          <CardTitle>Total Foreign Assets</CardTitle>
          <CardDescription>Summary of all offshore accounts and investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">${totalFBAR.toLocaleString()}</div>
          {requiresFBAR ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>FBAR Reporting Required</AlertTitle>
              <AlertDescription>
                Your total foreign assets exceed $10,000. You must file FBAR with the US Treasury and potentially Form
                8938 with your tax return.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your foreign assets are below the $10,000 FBAR reporting threshold.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
