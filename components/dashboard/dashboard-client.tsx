"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Calculator, Shield, GraduationCap, PiggyBank, AlertCircle, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NetWorthChart } from "@/components/dashboard/net-worth-chart"
import { RetirementProjection } from "@/components/dashboard/retirement-projection"
import { LifeInsuranceAnalysis } from "@/components/dashboard/life-insurance-analysis"
import { CollegeSavingsAnalysis } from "@/components/dashboard/college-savings-analysis"
import { TaxOptimization } from "@/components/dashboard/tax-optimization"
import { NotificationPopup } from "@/components/notifications/notification-popup"

type Assessment = {
  id: string
  status: string
  progress_percentage: number
  annual_income?: number
  spouse_annual_income?: number
  monthly_expenses?: number
  cash_savings?: number
  checking_balance?: number
  investment_accounts?: number
  retirement_401k?: number
  retirement_ira?: number
  home_value?: number
  other_assets?: number
  mortgage_balance?: number
  student_loans?: number
  auto_loans?: number
  credit_card_debt?: number
  other_debts?: number
  retirement_age?: number
  date_of_birth?: string
  [key: string]: any
}

type UserProfile = {
  full_name?: string
  email: string
  id?: string
}

export function DashboardClient({
  assessment,
  userProfile,
}: {
  assessment: Assessment | null
  userProfile: UserProfile | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // If no assessment, show start assessment prompt
  if (!assessment) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold text-foreground">FNA App</span>
              </Link>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <Card className="max-w-md w-full p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Assessment Found</h2>
            <p className="text-muted-foreground mb-6">
              Start your financial planning journey by completing a comprehensive assessment.
            </p>
            <Button onClick={() => router.push("/assessment")} size="lg" className="w-full">
              Start Assessment
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // If assessment is draft, show continue prompt
  if (assessment.status === "draft") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold text-foreground">FNA App</span>
              </Link>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <Card className="max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Assessment In Progress</h2>
              <p className="text-muted-foreground mb-4">You're {assessment.progress_percentage}% complete</p>
              <Progress value={assessment.progress_percentage} className="h-2 mb-2" />
            </div>
            <Button onClick={() => router.push("/assessment")} size="lg" className="w-full">
              Continue Assessment
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalAssets =
    (assessment.checking_balance || 0) +
    (assessment.cash_savings || 0) +
    (assessment.investment_accounts || 0) +
    (assessment.retirement_401k || 0) +
    (assessment.retirement_ira || 0) +
    (assessment.home_value || 0) +
    (assessment.other_assets || 0)

  const totalLiabilities =
    (assessment.mortgage_balance || 0) +
    (assessment.student_loans || 0) +
    (assessment.auto_loans || 0) +
    (assessment.credit_card_debt || 0) +
    (assessment.other_debts || 0)

  const netWorth = totalAssets - totalLiabilities
  const annualIncome = (assessment.annual_income || 0) + (assessment.spouse_annual_income || 0)
  const annualExpenses = (assessment.monthly_expenses || 0) * 12
  const annualSavings = annualIncome - annualExpenses

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 35
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const currentAge = calculateAge(assessment.date_of_birth)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">FNA App</span>
            </Link>
            <div className="flex items-center gap-4">
              {userProfile?.id && <NotificationPopup userId={userProfile.id} />}
              <Link href="/calculators">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Calculator className="h-4 w-4" />
                  Calculators
                </Button>
              </Link>
              <Link href="/assessment">
                <Button variant="ghost" size="sm">
                  Edit Assessment
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userProfile?.full_name || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here's your comprehensive financial analysis and personalized recommendations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Net Worth</h3>
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-foreground" : "text-destructive"}`}>
              ${netWorth.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Assets - Liabilities</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Annual Savings</h3>
              <PiggyBank className="h-5 w-5 text-chart-2" />
            </div>
            <p className={`text-2xl font-bold ${annualSavings >= 0 ? "text-foreground" : "text-destructive"}`}>
              ${annualSavings.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Years to Retirement</h3>
              <GraduationCap className="h-5 w-5 text-chart-3" />
            </div>
            <p className="text-2xl font-bold text-foreground">{(assessment.retirement_age || 65) - currentAge}</p>
            <p className="text-xs text-muted-foreground mt-1">At age {assessment.retirement_age || 65}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Savings Rate</h3>
              <Shield className="h-5 w-5 text-chart-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {annualIncome > 0 ? ((annualSavings / annualIncome) * 100).toFixed(1) : "0.0"}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Of gross income</p>
          </Card>
        </div>

        {/* Tabs for Different Analysis */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="retirement">Retirement</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="college">College</TabsTrigger>
            <TabsTrigger value="tax">Tax Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <NetWorthChart data={assessment} />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Asset Allocation</h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Retirement Accounts",
                      value: (assessment.retirement_401k || 0) + (assessment.retirement_ira || 0),
                      color: "bg-chart-1",
                    },
                    { label: "Brokerage", value: assessment.investment_accounts || 0, color: "bg-chart-2" },
                    {
                      label: "Cash & Savings",
                      value: (assessment.checking_balance || 0) + (assessment.cash_savings || 0),
                      color: "bg-chart-3",
                    },
                    { label: "Real Estate", value: assessment.home_value || 0, color: "bg-chart-4" },
                    { label: "Other Assets", value: assessment.other_assets || 0, color: "bg-chart-5" },
                  ].map((item) => {
                    const percentage = totalAssets > 0 ? (item.value / totalAssets) * 100 : 0
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-medium text-foreground">
                            ${item.value.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Liability Breakdown</h3>
                <div className="space-y-4">
                  {totalLiabilities === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No liabilities reported</p>
                  ) : (
                    [
                      { label: "Mortgage", value: assessment.mortgage_balance || 0, color: "bg-destructive/80" },
                      { label: "Student Loans", value: assessment.student_loans || 0, color: "bg-destructive/60" },
                      { label: "Auto Loans", value: assessment.auto_loans || 0, color: "bg-destructive/40" },
                      {
                        label: "Credit Cards",
                        value: assessment.credit_card_debt || 0,
                        color: "bg-destructive/20",
                      },
                      { label: "Other Debt", value: assessment.other_debts || 0, color: "bg-destructive/10" },
                    ].map((item) => {
                      const percentage = totalLiabilities > 0 ? (item.value / totalLiabilities) * 100 : 0
                      if (item.value === 0) return null
                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-medium text-foreground">
                              ${item.value.toLocaleString()} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retirement" className="space-y-6">
            <RetirementProjection data={assessment} />
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <LifeInsuranceAnalysis data={assessment} />
          </TabsContent>

          <TabsContent value="college" className="space-y-6">
            <CollegeSavingsAnalysis data={assessment} />
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <TaxOptimization data={assessment} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
