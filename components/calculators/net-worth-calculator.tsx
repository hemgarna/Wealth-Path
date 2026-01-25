"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DollarSign } from "lucide-react"

export function NetWorthCalculator() {
  const [checking, setChecking] = useState(0)
  const [savings, setSavings] = useState(0)
  const [investments, setInvestments] = useState(0)
  const [retirement, setRetirement] = useState(0)
  const [realEstate, setRealEstate] = useState(0)
  const [otherAssets, setOtherAssets] = useState(0)

  const [mortgage, setMortgage] = useState(0)
  const [studentLoans, setStudentLoans] = useState(0)
  const [carLoans, setCarLoans] = useState(0)
  const [creditCards, setCreditCards] = useState(0)
  const [otherDebt, setOtherDebt] = useState(0)

  const totalAssets = checking + savings + investments + retirement + realEstate + otherAssets
  const totalLiabilities = mortgage + studentLoans + carLoans + creditCards + otherDebt
  const netWorth = totalAssets - totalLiabilities

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-chart-1/20 rounded-lg">
          <DollarSign className="h-6 w-6 text-chart-1" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Net Worth Calculator</h3>
          <p className="text-sm text-muted-foreground">Calculate your total net worth</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Assets</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checking-nw">Checking</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="checking-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(checking)}
                    onChange={(e) => setChecking(parseCurrency(e.target.value))}
                    placeholder="10,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="savings-nw">Savings</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="savings-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(savings)}
                    onChange={(e) => setSavings(parseCurrency(e.target.value))}
                    placeholder="50,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investments-nw">Investments</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="investments-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(investments)}
                    onChange={(e) => setInvestments(parseCurrency(e.target.value))}
                    placeholder="100,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirement-nw">Retirement</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="retirement-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(retirement)}
                    onChange={(e) => setRetirement(parseCurrency(e.target.value))}
                    placeholder="250,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="real-estate-nw">Real Estate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="real-estate-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(realEstate)}
                    onChange={(e) => setRealEstate(parseCurrency(e.target.value))}
                    placeholder="500,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-assets-nw">Other Assets</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="other-assets-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(otherAssets)}
                    onChange={(e) => setOtherAssets(parseCurrency(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Liabilities</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mortgage-nw">Mortgage</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="mortgage-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(mortgage)}
                    onChange={(e) => setMortgage(parseCurrency(e.target.value))}
                    placeholder="350,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-loans-nw">Student Loans</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="student-loans-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(studentLoans)}
                    onChange={(e) => setStudentLoans(parseCurrency(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car-loans-nw">Car Loans</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="car-loans-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(carLoans)}
                    onChange={(e) => setCarLoans(parseCurrency(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit-cards-nw">Credit Cards</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="credit-cards-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(creditCards)}
                    onChange={(e) => setCreditCards(parseCurrency(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-debt-nw">Other Debt</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="other-debt-nw"
                    type="text"
                    className="pl-7"
                    value={formatCurrency(otherDebt)}
                    onChange={(e) => setOtherDebt(parseCurrency(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-chart-1/10 border border-chart-1/20 rounded-lg">
            <h4 className="font-semibold text-foreground mb-4">Summary</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Assets</p>
                <p className="text-xl font-bold text-foreground">${totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Liabilities</p>
                <p className="text-xl font-bold text-foreground">${totalLiabilities.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Net Worth</p>
                <p className={`text-3xl font-bold ${netWorth >= 0 ? "text-chart-1" : "text-destructive"}`}>
                  ${netWorth.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-foreground mb-2">Net Worth Insights</h5>
            <div className="text-sm text-muted-foreground space-y-2">
              {netWorth > 0 ? (
                <>
                  <p>Your assets exceed your liabilities by ${netWorth.toLocaleString()}.</p>
                  {totalLiabilities > 0 && (
                    <p>
                      Your debt-to-asset ratio is {((totalLiabilities / totalAssets) * 100).toFixed(1)}%. A lower ratio
                      indicates better financial health.
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Your liabilities exceed your assets. Focus on reducing debt and building emergency savings to improve
                  your financial position.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
