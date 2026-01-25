"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function CurrentPositionStep({ data, updateData }: Props) {
  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, "")
    return number ? Number.parseInt(number).toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="annual-income">Annual Household Income</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="annual-income"
              type="text"
              placeholder="100,000"
              value={data.annual_income ? formatCurrency(data.annual_income.toString()) : ""}
              onChange={(e) => updateData({ annual_income: parseCurrency(e.target.value) })}
              className="pl-7"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="monthly-expenses"
              type="text"
              placeholder="5,000"
              value={data.monthly_expenses ? formatCurrency(data.monthly_expenses.toString()) : ""}
              onChange={(e) => updateData({ monthly_expenses: parseCurrency(e.target.value) })}
              className="pl-7"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="total-assets">Total Assets</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="total-assets"
              type="text"
              placeholder="500,000"
              value={data.total_assets ? formatCurrency(data.total_assets.toString()) : ""}
              onChange={(e) => updateData({ total_assets: parseCurrency(e.target.value) })}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Include savings, investments, home equity, etc.</p>
        </div>

        <div>
          <Label htmlFor="total-liabilities">Total Liabilities</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="total-liabilities"
              type="text"
              placeholder="200,000"
              value={data.total_liabilities ? formatCurrency(data.total_liabilities.toString()) : ""}
              onChange={(e) => updateData({ total_liabilities: parseCurrency(e.target.value) })}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Include mortgage, loans, credit cards, etc.</p>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Net Worth:</span>
          <span className="text-lg font-bold text-primary">
            ${((data.total_assets || 0) - (data.total_liabilities || 0)).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
