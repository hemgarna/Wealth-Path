"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingUp, Calendar, ArrowRight, Target, Shield, Sparkles } from "lucide-react"
import { calculateCollegeFunding, formatCurrency } from "@/lib/financial-calculations"

export default function FinancialGoalsResults({ data }: { data: any }) {
  const router = useRouter()

  const children = data.children || []
  const collegeCalculations = children.map((child: any) =>
    calculateCollegeFunding({
      child_age: child.age,
      college_type: child.college_cost >= 400000 ? "private" : "public",
      current_529_balance: 0,
      monthly_529_contribution: 0,
    }),
  )

  const totalCollegeGap = collegeCalculations.reduce((sum: number, calc: any) => sum + calc.gap, 0)
  const totalMonthlySavingsNeeded = collegeCalculations.reduce(
    (sum: number, calc: any) => sum + calc.monthlySavingsNeeded,
    0,
  )

  const currentAge = data.current_age || 40
  const retirementAge = data.retirement_age || 65
  const yearsToRetirement = retirementAge - currentAge
  const currentAnnualNeed = data.desired_annual_retirement_income || 96000
  const INFLATION_RATE = 0.03
  const futureAnnualNeed = currentAnnualNeed * Math.pow(1 + INFLATION_RATE, yearsToRetirement)
  const retirementTarget = futureAnnualNeed / 0.04

  const ltcGap = (data.total_ltc_budget || 0) * Math.pow(1 + INFLATION_RATE, yearsToRetirement)
  const legacyGap = data.total_legacy_budget || 0

  const totalGoals = totalCollegeGap + retirementTarget + ltcGap + legacyGap
  const completionScore = totalGoals > 0 ? Math.min(Math.round((100000 / totalGoals) * 100), 100) : 0

  const currentMonthlySavings = data.current_monthly_savings || 0
  const optimalMonthlySavings = totalMonthlySavingsNeeded + retirementTarget / (yearsToRetirement * 12)
  const additionalSavingsNeeded = Math.max(0, optimalMonthlySavings - currentMonthlySavings)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full mb-4">
            <Target className="w-5 h-5" />
            <span className="font-semibold">Financial Goals Analysis Complete</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Your Financial Roadmap</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Here's where you stand today and what we can help you achieve
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-orange-900">Your Current Path</CardTitle>
              <CardDescription className="text-orange-700 text-lg">Without professional guidance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/60 backdrop-blur rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-slate-700 font-medium">Monthly Savings</span>
                  <span className="text-2xl font-bold text-slate-900">{formatCurrency(currentMonthlySavings)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-slate-700 font-medium">College Funding Gap</span>
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(totalCollegeGap)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-slate-700 font-medium">Retirement Shortfall</span>
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(retirementTarget)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Goal Achievement</span>
                  <span className="text-2xl font-bold text-orange-600">{completionScore}%</span>
                </div>
              </div>

              <div className="bg-orange-100 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-orange-900">⚠️ Current Challenges:</p>
                <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                  <li>Significant funding gaps across all goals</li>
                  <li>No tax optimization strategy in place</li>
                  <li>Missing professional financial planning</li>
                  <li>Potential to fall short of retirement goals</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500 opacity-10 rounded-full -ml-12 -mb-12"></div>
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-emerald-900">With Our Guidance</CardTitle>
              <CardDescription className="text-emerald-700 text-lg">Optimized financial strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="bg-white/60 backdrop-blur rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-emerald-200">
                  <span className="text-slate-700 font-medium">Recommended Savings</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatCurrency(optimalMonthlySavings)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-emerald-200">
                  <span className="text-slate-700 font-medium">College Funding</span>
                  <span className="text-xl font-bold text-emerald-600">100% Covered</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-emerald-200">
                  <span className="text-slate-700 font-medium">Retirement Readiness</span>
                  <span className="text-xl font-bold text-emerald-600">On Track</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Goal Achievement</span>
                  <span className="text-2xl font-bold text-emerald-600">95%+</span>
                </div>
              </div>

              <div className="bg-emerald-100 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-900">✨ What You'll Gain:</p>
                <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                  <li>Structured 529 plans for all children</li>
                  <li>Tax-optimized retirement contributions</li>
                  <li>Comprehensive protection strategies</li>
                  <li>Clear path to financial independence</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">Investment in Your Future</h3>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Additional Monthly Investment</p>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(additionalSavingsNeeded)}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Goals Achieved</p>
                  <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalGoals)}</p>
                </div>
              </div>
              <p className="text-slate-600 max-w-2xl mx-auto">
                By investing just {formatCurrency(additionalSavingsNeeded)} more per month with our strategic guidance,
                you'll be on track to achieve all your financial goals worth {formatCurrency(totalGoals)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Detailed Gap Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Target className="w-5 h-5" />
                  College Funding Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Total College Cost Needed (Future Value)</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCollegeGap)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Number of Children</p>
                    <p className="text-lg font-semibold">{children.length}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">Monthly 529 Contribution Needed</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlySavingsNeeded)}</p>
                    <p className="text-xs text-blue-700 mt-1">Assuming 7% return in 529 plans</p>
                  </div>
                  {collegeCalculations.length > 0 && (
                    <div className="space-y-3 pt-3 border-t">
                      {children.map((child: any, index: number) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg">
                          <p className="font-semibold text-slate-900">{child.name}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <p className="text-slate-600">Age</p>
                              <p className="font-semibold">{child.age} years</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Years to College</p>
                              <p className="font-semibold">{collegeCalculations[index].yearsUntilCollege}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Total Cost</p>
                              <p className="font-semibold text-blue-600">
                                {formatCurrency(collegeCalculations[index].totalCollegeCost)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Monthly</p>
                              <p className="font-semibold text-orange-600">
                                {formatCurrency(collegeCalculations[index].monthlySavingsNeeded)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <TrendingUp className="w-5 h-5" />
                  Retirement Income Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Current Annual Need</p>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(currentAnnualNeed)}</p>
                      <p className="text-xs text-slate-500">Today's dollars</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Future Annual Need</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(futureAnnualNeed)}</p>
                      <p className="text-xs text-slate-500">At retirement</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-900">Retirement Target (4% Rule)</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(retirementTarget)}</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Adjusted for 3% inflation over {yearsToRetirement} years
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-600">Safe Annual Withdrawal</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(futureAnnualNeed)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Shield className="w-5 h-5" />
                  Long-term Care Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Current LTC Budget (Today's Dollars)</p>
                    <p className="text-xl font-semibold text-slate-700">{formatCurrency(data.total_ltc_budget || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Future LTC Budget Needed</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(ltcGap)}</p>
                    <p className="text-xs text-slate-500">Adjusted for inflation at retirement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Sparkles className="w-5 h-5" />
                  Legacy & Lifestyle Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Total Legacy Budget</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(legacyGap)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-amber-50 p-2 rounded">
                      <p className="text-slate-600">Travel</p>
                      <p className="font-semibold">{formatCurrency(data.travel_budget || 0)}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded">
                      <p className="text-slate-600">Charity</p>
                      <p className="font-semibold">{formatCurrency(data.charity_amount || 0)}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded">
                      <p className="text-slate-600">Legacy</p>
                      <p className="font-semibold">{formatCurrency(data.legacy_amount || 0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-2 border-blue-400 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold">Ready to Transform Your Financial Future?</h3>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Don't leave your family's future to chance. Schedule a complimentary consultation with our expert
                advisors and get a personalized action plan to achieve all your financial goals.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                  onClick={() => window.open("https://scheduler.zoom.us/anand-pq9c9z/1-1-with-anand", "_blank")}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Free Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10"
                  onClick={() => router.push("/financial-goals/form")}
                >
                  Edit My Goals
                </Button>
              </div>
              <p className="text-sm text-blue-200">
                ⭐ Join 500+ families who've achieved their financial dreams with our guidance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
