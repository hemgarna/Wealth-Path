"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { AssessmentData } from "@/app/assessment/page"

type Props = {
  data: Partial<AssessmentData>
}

export function NetWorthChart({ data }: Props) {
  // Calculate net worth projection over time
  const currentAge = data.age || 35
  const retirementAge = data.retirementAge || 65
  const lifeExpectancy = data.lifeExpectancy || 90

  const currentNetWorth =
    (data.checking || 0) +
    (data.savings || 0) +
    (data.brokerage || 0) +
    (data.retirement401k || 0) +
    (data.rothIRA || 0) +
    (data.hsa || 0) +
    (data.realEstate || 0) +
    (data.otherAssets || 0) -
    (data.mortgageBalance || 0) -
    (data.studentLoans || 0) -
    (data.carLoans || 0) -
    (data.creditCardDebt || 0) -
    (data.otherDebt || 0)

  const annualSavings = (data.annualIncome || 0) + (data.spouseIncome || 0) - (data.annualExpenses || 0)
  const growthRate = 0.07 // 7% average annual return

  const chartData = []
  let netWorth = currentNetWorth

  for (let age = currentAge; age <= lifeExpectancy; age += 5) {
    if (age < retirementAge) {
      // Accumulation phase
      netWorth = netWorth * Math.pow(1 + growthRate, 5) + annualSavings * 5 * (1 + growthRate / 2)
    } else {
      // Retirement phase - withdrawing
      const withdrawals = (data.retirementExpenses || data.annualExpenses || 0) * 5
      netWorth = netWorth * Math.pow(1 + growthRate, 5) - withdrawals
    }

    chartData.push({
      age,
      netWorth: Math.round(netWorth),
    })
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Net Worth Projection</h3>
        <p className="text-sm text-muted-foreground">
          Projected net worth over your lifetime assuming 7% annual returns
        </p>
      </div>

      <ChartContainer
        config={{
          netWorth: {
            label: "Net Worth",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="age"
              label={{ value: "Age", position: "insideBottom", offset: -5 }}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              label={{ value: "Net Worth", angle: -90, position: "insideLeft" }}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Net Worth"]}
                  labelFormatter={(label) => `Age ${label}`}
                />
              }
            />
            <Line type="monotone" dataKey="netWorth" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Key Insights</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • Projected net worth at retirement (age {retirementAge}): $
            {chartData.find((d) => d.age >= retirementAge)?.netWorth.toLocaleString() || "N/A"}
          </li>
          <li>• Current annual savings: ${annualSavings.toLocaleString()}</li>
          <li>• Assumes consistent savings and 7% average annual investment returns</li>
        </ul>
      </div>
    </Card>
  )
}
