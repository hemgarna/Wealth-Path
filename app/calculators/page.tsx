"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Calculator, Shield, GraduationCap, PiggyBank, Home, DollarSign, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LifeInsuranceCalculator } from "@/components/calculators/life-insurance-calculator"
import { RetirementCalculator } from "@/components/calculators/retirement-calculator"
import { CollegeCalculator } from "@/components/calculators/college-calculator"
import { MortgageCalculator } from "@/components/calculators/mortgage-calculator"
import { NetWorthCalculator } from "@/components/calculators/net-worth-calculator"

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">FNA App</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/assessment">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Full Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Calculators</h1>
          <p className="text-muted-foreground">
            Quick and easy calculators to help you make informed financial decisions
          </p>
        </div>

        {/* Calculator Cards Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Life Insurance</h3>
            <p className="text-sm text-muted-foreground">Calculate your life insurance needs using the DIME method</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4 inline-flex rounded-lg bg-chart-2/20 p-3">
              <PiggyBank className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Retirement</h3>
            <p className="text-sm text-muted-foreground">Project your retirement savings and income needs</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4 inline-flex rounded-lg bg-chart-3/20 p-3">
              <GraduationCap className="h-6 w-6 text-chart-3" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">College Savings</h3>
            <p className="text-sm text-muted-foreground">Plan for your children's education expenses</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4 inline-flex rounded-lg bg-chart-4/20 p-3">
              <Home className="h-6 w-6 text-chart-4" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Mortgage</h3>
            <p className="text-sm text-muted-foreground">Calculate mortgage payments and amortization</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4 inline-flex rounded-lg bg-chart-1/20 p-3">
              <DollarSign className="h-6 w-6 text-chart-1" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Net Worth</h3>
            <p className="text-sm text-muted-foreground">Track your assets and liabilities</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-primary/20 bg-primary/5">
            <div className="mb-4 inline-flex rounded-lg bg-primary/20 p-3">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Full Assessment</h3>
            <p className="text-sm text-muted-foreground mb-4">Get a comprehensive financial plan</p>
            <Link href="/assessment">
              <Button size="sm" className="w-full">
                Get Started
              </Button>
            </Link>
          </Card>
        </div>

        {/* Calculator Tabs */}
        <Tabs defaultValue="life-insurance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="life-insurance">Life Insurance</TabsTrigger>
            <TabsTrigger value="retirement">Retirement</TabsTrigger>
            <TabsTrigger value="college">College</TabsTrigger>
            <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
            <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
          </TabsList>

          <TabsContent value="life-insurance">
            <LifeInsuranceCalculator />
          </TabsContent>

          <TabsContent value="retirement">
            <RetirementCalculator />
          </TabsContent>

          <TabsContent value="college">
            <CollegeCalculator />
          </TabsContent>

          <TabsContent value="mortgage">
            <MortgageCalculator />
          </TabsContent>

          <TabsContent value="net-worth">
            <NetWorthCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
