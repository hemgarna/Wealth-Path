"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Home } from "lucide-react"

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(0)
  const [downPayment, setDownPayment] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [loanTerm, setLoanTerm] = useState(30)

  const loanAmount = homePrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTerm * 12

  // Monthly payment calculation
  const monthlyPayment =
    loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : 0

  const totalPayments = monthlyPayment * numberOfPayments
  const totalInterest = totalPayments - loanAmount

  const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-chart-4/20 rounded-lg">
          <Home className="h-6 w-6 text-chart-4" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Mortgage Calculator</h3>
          <p className="text-sm text-muted-foreground">Calculate your monthly mortgage payment</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="home-price">Home Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="home-price"
                type="text"
                className="pl-7"
                value={formatCurrency(homePrice)}
                onChange={(e) => setHomePrice(parseCurrency(e.target.value))}
                placeholder="500,000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="down-payment">Down Payment</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="down-payment"
                type="text"
                className="pl-7"
                value={formatCurrency(downPayment)}
                onChange={(e) => setDownPayment(parseCurrency(e.target.value))}
                placeholder="100,000"
              />
            </div>
            <p className="text-xs text-muted-foreground">{downPaymentPercent.toFixed(1)}% of home price</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.1"
              value={interestRate || ""}
              onChange={(e) => setInterestRate(Number.parseFloat(e.target.value) || 0)}
              placeholder="6.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan-term">Loan Term (Years)</Label>
            <Input
              id="loan-term"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number.parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-chart-4/10 border border-chart-4/20 rounded-lg">
            <h4 className="font-semibold text-foreground mb-4">Payment Details</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                <p className="text-lg font-medium text-foreground">${loanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                <p className="text-3xl font-bold text-chart-4">${Math.round(monthlyPayment).toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
                <p className="text-lg font-medium text-foreground">${Math.round(totalPayments).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                <p className="text-lg font-medium text-foreground">${Math.round(totalInterest).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-foreground mb-2">Additional Costs to Consider</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Property taxes (typically 1-2% of home value annually)</li>
              <li>• Homeowners insurance</li>
              <li>• HOA fees (if applicable)</li>
              <li>• PMI if down payment is less than 20%</li>
              <li>• Maintenance and repairs (1-2% annually)</li>
            </ul>
          </div>

          {downPaymentPercent < 20 && downPayment > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">PMI Required</p>
              <p className="text-xs text-muted-foreground">
                With less than 20% down, you'll likely need to pay Private Mortgage Insurance (PMI), typically 0.5-1% of
                the loan amount annually.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
