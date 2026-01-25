"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUp, ArrowDown, TrendingUp, Calendar } from "lucide-react"

export default function GrowthStrategyResults({ data }: { data: any }) {
  const router = useRouter()

  // Calculate totals
  const totalRetirementAccounts =
    (data.current_401k_value_self || 0) +
    (data.current_401k_value_spouse || 0) +
    (data.traditional_ira_value || 0) +
    (data.roth_ira_value || 0) +
    (data.hsa_value || 0)

  const totalInvestments = (data.brokerage_account_value || 0) + (data.stocks_value || 0) + (data.bonds_value || 0)

  const totalRealEstateValue = (data.primary_home_value || 0) + (data.rental_properties_value || 0)
  const totalRealEstateEquity = totalRealEstateValue - (data.primary_home_mortgage || 0)

  const monthlyIncome =
    (data.expected_ss_self || 0) +
    (data.expected_ss_spouse || 0) +
    (data.pension_monthly_self || 0) +
    (data.pension_monthly_spouse || 0) +
    (data.rental_income_monthly || 0)

  const totalAssets = totalRetirementAccounts + totalInvestments + totalRealEstateEquity

  // Growth score based on diversification
  const growthScore = Math.min(
    100,
    (totalRetirementAccounts > 0 ? 25 : 0) +
      (totalInvestments > 0 ? 25 : 0) +
      (totalRealEstateEquity > 0 ? 25 : 0) +
      (monthlyIncome > 0 ? 25 : 0),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Growth Strategy Gap Analysis</h1>
          <p className="text-slate-600">Your offensive wealth-building assessment</p>
        </div>

        {/* Growth Score */}
        <Card className="mb-8 border-emerald-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <CardTitle className="text-2xl">Your Growth Strategy Score</CardTitle>
            <CardDescription className="text-emerald-100">Diversification and asset strength</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl font-bold text-emerald-600">{growthScore}%</span>
              <TrendingUp className="w-16 h-16 text-emerald-500" />
            </div>
            <Progress value={growthScore} className="h-3 mb-2" />
            <p className="text-slate-600">
              {growthScore >= 75
                ? "Excellent diversification across asset classes"
                : growthScore >= 50
                  ? "Good start, but opportunities to diversify further"
                  : "Significant opportunities to strengthen your growth strategy"}
            </p>
          </CardContent>
        </Card>

        {/* Asset Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Retirement Accounts</p>
                  <p className="text-2xl font-bold text-emerald-600">${totalRetirementAccounts.toLocaleString()}</p>
                </div>
                <ArrowUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Investments</p>
                  <p className="text-2xl font-bold text-purple-600">${totalInvestments.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Real Estate Equity</p>
                  <p className="text-2xl font-bold text-orange-600">${totalRealEstateEquity.toLocaleString()}</p>
                </div>
                <ArrowUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-blue-600">${monthlyIncome.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gap Analysis Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {totalRetirementAccounts > 200000 ? (
                  <ArrowUp className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-red-500" />
                )}
                Retirement Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-900">${totalRetirementAccounts.toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-slate-700">Breakdown:</p>
                  <ul className="text-sm space-y-1 mt-2">
                    {data.current_401k_value_self > 0 && (
                      <li>401k (Self): ${data.current_401k_value_self.toLocaleString()}</li>
                    )}
                    {data.current_401k_value_spouse > 0 && (
                      <li>401k (Spouse): ${data.current_401k_value_spouse.toLocaleString()}</li>
                    )}
                    {data.traditional_ira_value > 0 && (
                      <li>Traditional IRA: ${data.traditional_ira_value.toLocaleString()}</li>
                    )}
                    {data.roth_ira_value > 0 && <li>Roth IRA: ${data.roth_ira_value.toLocaleString()}</li>}
                    {data.hsa_value > 0 && <li>HSA: ${data.hsa_value.toLocaleString()}</li>}
                  </ul>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-orange-600">
                    {totalRetirementAccounts < 200000 ? "Action Required" : "On Track"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {totalRetirementAccounts < 200000
                      ? "Increase retirement contributions to reach recommended levels"
                      : "Maintain current contribution levels"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {totalInvestments > 100000 ? (
                  <ArrowUp className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-orange-500" />
                )}
                Investment Portfolio Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Current Portfolio Value</p>
                  <p className="text-2xl font-bold text-slate-900">${totalInvestments.toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-slate-700">Allocation:</p>
                  <ul className="text-sm space-y-1 mt-2">
                    {data.brokerage_account_value > 0 && (
                      <li>Brokerage: ${data.brokerage_account_value.toLocaleString()}</li>
                    )}
                    {data.stocks_value > 0 && <li>Stocks: ${data.stocks_value.toLocaleString()}</li>}
                    {data.bonds_value > 0 && <li>Bonds: ${data.bonds_value.toLocaleString()}</li>}
                  </ul>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-orange-600">Recommendation</p>
                  <p className="text-sm text-slate-600">
                    {totalInvestments < 100000
                      ? "Build taxable investment portfolio for additional growth"
                      : "Maintain diversified portfolio allocation"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {totalRealEstateEquity > 0 ? (
                  <ArrowUp className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-orange-500" />
                )}
                Real Estate Holdings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Total Equity</p>
                  <p className="text-2xl font-bold text-slate-900">${totalRealEstateEquity.toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-slate-700">Details:</p>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>Total Value: ${totalRealEstateValue.toLocaleString()}</li>
                    <li>Mortgage: ${(data.primary_home_mortgage || 0).toLocaleString()}</li>
                    {data.rental_income_monthly > 0 && (
                      <li>Monthly Rental Income: ${data.rental_income_monthly.toLocaleString()}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {monthlyIncome > 3000 ? (
                  <ArrowUp className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-orange-500" />
                )}
                Guaranteed Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Monthly Guaranteed Income</p>
                  <p className="text-2xl font-bold text-slate-900">${monthlyIncome.toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-slate-700">Sources:</p>
                  <ul className="text-sm space-y-1 mt-2">
                    {data.expected_ss_self > 0 && (
                      <li>Social Security (Self): ${data.expected_ss_self.toLocaleString()}</li>
                    )}
                    {data.expected_ss_spouse > 0 && (
                      <li>Social Security (Spouse): ${data.expected_ss_spouse.toLocaleString()}</li>
                    )}
                    {data.pension_monthly_self > 0 && (
                      <li>Pension (Self): ${data.pension_monthly_self.toLocaleString()}</li>
                    )}
                    {data.pension_monthly_spouse > 0 && (
                      <li>Pension (Spouse): ${data.pension_monthly_spouse.toLocaleString()}</li>
                    )}
                    {data.rental_income_monthly > 0 && (
                      <li>Rental Income: ${data.rental_income_monthly.toLocaleString()}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card className="mb-8 border-amber-200">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalRetirementAccounts < 200000 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-semibold text-orange-900">Increase Retirement Contributions</p>
                  <p className="text-sm text-slate-600">
                    Target: Build retirement accounts to at least $200,000 by maximizing contributions
                  </p>
                </div>
              )}
              {totalInvestments < 100000 && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="font-semibold text-purple-900">Diversify Beyond Retirement Accounts</p>
                  <p className="text-sm text-slate-600">
                    Build taxable investment portfolio for flexibility and growth
                  </p>
                </div>
              )}
              {totalRealEstateEquity === 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900">Consider Real Estate Investment</p>
                  <p className="text-sm text-slate-600">
                    Real estate can provide diversification and passive income opportunities
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-emerald-300 shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Optimize Your Growth Strategy</h3>
              <p className="text-slate-600 mb-6">Work with our advisors to maximize your wealth-building potential</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/growth-strategy/form")}>
                  Edit Strategy
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
                  onClick={() => window.open("https://scheduler.zoom.us/anand-pq9c9z/1-1-with-anand", "_blank")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
