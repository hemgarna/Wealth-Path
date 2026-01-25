"use client"

import { useState } from "react"
import { ArrowLeft, Save, FileText, CheckCircle2, FileEdit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdvisorAnalysisClientProps {
  caseId: string
  advisorId: string
  clientName: string
  originalForms: {
    financialGoals: any
    growthStrategy: any
    defenseStrategy: any
    savingsVsSpending: any
    finalReport: any
  }
  analyzedForms: {
    financialGoals: any
    growthStrategy: any
    defenseStrategy: any
    savingsVsSpending: any
    finalReport: any
  }
}

export function AdvisorAnalysisClient({
  caseId,
  advisorId,
  clientName,
  originalForms,
  analyzedForms,
}: AdvisorAnalysisClientProps) {
  const router = useRouter()
  const [hasCopy, setHasCopy] = useState(
    !!analyzedForms.financialGoals ||
      !!analyzedForms.growthStrategy ||
      !!analyzedForms.defenseStrategy ||
      !!analyzedForms.savingsVsSpending,
  )
  const [creatingCopy, setCreatingCopy] = useState(false)
  const [saving, setSaving] = useState({
    financialGoals: false,
    growthStrategy: false,
    defenseStrategy: false,
    savingsVsSpending: false,
  })
  const [activeTab, setActiveTab] = useState("financial-goals")

  const allFormsExist = !!(
    analyzedForms.financialGoals &&
    analyzedForms.growthStrategy &&
    analyzedForms.defenseStrategy &&
    analyzedForms.savingsVsSpending
  )

  const [generatingReport, setGeneratingReport] = useState(false)

  const [financialGoalsData, setFinancialGoalsData] = useState(analyzedForms.financialGoals || {})
  const [growthStrategyData, setGrowthStrategyData] = useState(analyzedForms.growthStrategy || {})
  const [defenseStrategyData, setDefenseStrategyData] = useState(analyzedForms.defenseStrategy || {})
  const [savingsVsSpendingData, setSavingsVsSpendingData] = useState(analyzedForms.savingsVsSpending || {})
  const [finalReportData, setFinalReportData] = useState(analyzedForms.finalReport || {})

  const handleCreateCopy = async () => {
    setCreatingCopy(true)
    try {
      const response = await fetch("/api/admin/create-analysis-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          originalForms,
        }),
      })

      if (response.ok) {
        // Load the copied data into state
        setFinancialGoalsData(originalForms.financialGoals || {})
        setGrowthStrategyData(originalForms.growthStrategy || {})
        setDefenseStrategyData(originalForms.defenseStrategy || {})
        setSavingsVsSpendingData(originalForms.savingsVsSpending || {})
        setHasCopy(true)
        alert("Copy created successfully! You can now edit and analyze the forms.")
      } else {
        alert("Failed to create copy")
      }
    } catch (error) {
      console.error("Error creating copy:", error)
      alert("Failed to create copy")
    } finally {
      setCreatingCopy(false)
    }
  }

  const handleGenerateFinalReport = async () => {
    if (!allFormsExist) {
      alert("Please save all four forms before generating the final report.")
      return
    }

    setGeneratingReport(true)
    console.log("[v0] Generating final report for case:", caseId)

    try {
      const response = await fetch("/api/admin/generate-final-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          financialGoals: financialGoalsData,
          growthStrategy: growthStrategyData,
          defenseStrategy: defenseStrategyData,
          savingsVsSpending: savingsVsSpendingData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFinalReportData(data.report)
        alert("Final Report generated successfully! You can now view it in the Final Report tab.")
        setActiveTab("final-report")
        router.refresh()
      } else {
        alert("Failed to generate final report")
      }
    } catch (error) {
      console.error("Error generating final report:", error)
      alert("Failed to generate final report")
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleSaveFinancialGoals = async () => {
    setSaving((prev) => ({ ...prev, financialGoals: true }))
    console.log("[v0] Saving financial goals")
    try {
      const response = await fetch("/api/admin/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          formType: "financialGoals",
          data: financialGoalsData,
        }),
      })

      if (response.ok) {
        alert("Financial Goals saved successfully!")
        router.refresh()
      } else {
        alert("Failed to save Financial Goals")
      }
    } catch (error) {
      console.error("Error saving financial goals:", error)
      alert("Failed to save Financial Goals")
    } finally {
      setSaving((prev) => ({ ...prev, financialGoals: false }))
    }
  }

  const handleSaveGrowthStrategy = async () => {
    setSaving((prev) => ({ ...prev, growthStrategy: true }))
    console.log("[v0] Saving growth strategy")
    try {
      const response = await fetch("/api/admin/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          formType: "growthStrategy",
          data: growthStrategyData,
        }),
      })

      if (response.ok) {
        alert("Growth Strategy saved successfully!")
        router.refresh()
      } else {
        alert("Failed to save Growth Strategy")
      }
    } catch (error) {
      console.error("Error saving growth strategy:", error)
      alert("Failed to save Growth Strategy")
    } finally {
      setSaving((prev) => ({ ...prev, growthStrategy: false }))
    }
  }

  const handleSaveDefenseStrategy = async () => {
    setSaving((prev) => ({ ...prev, defenseStrategy: true }))
    console.log("[v0] Saving defense strategy")
    try {
      const response = await fetch("/api/admin/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          formType: "defenseStrategy",
          data: JSON.stringify(defenseStrategyData),
        }),
      })

      if (response.ok) {
        alert("Defense Strategy saved successfully!")
        router.refresh()
      } else {
        alert("Failed to save Defense Strategy")
      }
    } catch (error) {
      console.error("Error saving defense strategy:", error)
      alert("Failed to save Defense Strategy")
    } finally {
      setSaving((prev) => ({ ...prev, defenseStrategy: false }))
    }
  }

  const handleSaveSavingsVsSpending = async () => {
    setSaving((prev) => ({ ...prev, savingsVsSpending: true }))
    console.log("[v0] Saving savings vs spending")
    try {
      const response = await fetch("/api/admin/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          formType: "savingsVsSpending",
          data: savingsVsSpendingData,
        }),
      })

      if (response.ok) {
        alert("Savings vs Spending saved successfully!")
        router.refresh()
      } else {
        alert("Failed to save Savings vs Spending")
      }
    } catch (error) {
      console.error("Error saving savings vs spending:", error)
      alert("Failed to save Savings vs Spending")
    } finally {
      setSaving((prev) => ({ ...prev, savingsVsSpending: false }))
    }
  }

  const allFormsSaved = !!financialGoalsData && !!growthStrategyData && !!defenseStrategyData && !!savingsVsSpendingData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-white hover:text-teal-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Analyze & Edit Forms</h1>
          </div>
          {!hasCopy ? (
            <Button onClick={handleCreateCopy} disabled={creatingCopy} className="bg-teal-600 hover:bg-teal-700">
              {creatingCopy ? "Creating Copy..." : "Create Editable Copy"}
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                onClick={handleGenerateFinalReport}
                disabled={generatingReport || !allFormsExist}
                className="bg-green-600 hover:bg-green-700"
              >
                {generatingReport ? "Generating Report..." : "Generate Final Report"}
              </Button>
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                Save Analysis
              </Button>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-300 mb-6">{clientName}</p>

        {!hasCopy && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Client Submitted Forms (Read-Only)
              </CardTitle>
              <CardDescription className="text-blue-700">
                You are viewing the original client-submitted data. To perform analysis and make edits, click "Create
                Editable Copy" above. Your changes will not affect the original client submissions.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {hasCopy && (
          <Card className="mb-6 bg-teal-50 border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <FileEdit className="h-5 w-5" />
                Advisor Analysis Workspace
              </CardTitle>
              <CardDescription className="text-teal-700">
                Edit and analyze client forms below. Your changes are saved separately and will not modify the client's
                original submissions. After completing your analysis, you can generate a final report to compare with
                the actual final report of client.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="financial-goals"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 gap-2"
            >
              Financial Goals
              {!!financialGoalsData.advisor_notes && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger
              value="growth-strategy"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 gap-2"
            >
              Growth Strategy
              {!!growthStrategyData.advisor_notes && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger
              value="defense-strategy"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 gap-2"
            >
              Defense Strategy
              {!!defenseStrategyData.advisor_notes && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger
              value="savings-spending"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 gap-2"
            >
              Savings vs Spending
              {!!savingsVsSpendingData.advisor_notes && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger
              value="final-report"
              disabled={!allFormsExist}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 gap-2 disabled:opacity-50"
            >
              Final Report
              {allFormsExist && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          {/* Financial Goals Tab - FULL FORM */}
          <TabsContent value="financial-goals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Financial Goals Analysis</CardTitle>
                    <CardDescription>
                      Review and edit client's financial goals and retirement planning data
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveFinancialGoals} disabled={saving.financialGoals} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving.financialGoals ? "Saving..." : "Save Financial Goals"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Age</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.current_age || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({ ...financialGoalsData, current_age: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label>Retirement Age</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.retirement_age || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            retirement_age: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Years to Retirement</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.years_to_retirement || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            years_to_retirement: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Marital Status</Label>
                      <Select
                        value={financialGoalsData.marital_status || "single"}
                        onValueChange={(value) =>
                          setFinancialGoalsData({ ...financialGoalsData, marital_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Number of Children</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.number_of_children || 0}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            number_of_children: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Dependents</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.dependents || 0}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            dependents: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Retirement Income Goals */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Retirement Income Goals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monthly Retirement Income (Today's Dollars)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_retirement_income_today || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_retirement_income_today: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Annual Retirement Income (Today's Dollars)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.annual_retirement_income_today || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            annual_retirement_income_today: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Annual Retirement Income (Pre-Tax)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.annual_retirement_income_pretax || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            annual_retirement_income_pretax: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Annual Retirement Income (Inflation Adjusted)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.annual_retirement_income_inflation || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            annual_retirement_income_inflation: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Desired Retirement Income</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.desired_retirement_income || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            desired_retirement_income: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Monthly Expenses Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Monthly Expenses</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.total_monthly_expenses || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            total_monthly_expenses: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Expenses (General)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_expenses || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_expenses: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Housing Cost</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_housing_cost || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_housing_cost: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Home Taxes</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_home_taxes || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_home_taxes: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly HOA</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_hoa || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_hoa: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Utilities</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_utilities || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_utilities: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Home Insurance</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_home_insurance || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_home_insurance: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Home Repairs</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_home_repairs || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_home_repairs: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Groceries</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_groceries || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_groceries: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Entertainment</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_entertainment || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_entertainment: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Car Insurance</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_car_insurance || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_car_insurance: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Maintenance</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.monthly_maintenance || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            monthly_maintenance: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Federal Tax Last Year</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.federal_tax_last_year || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            federal_tax_last_year: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Federal Tax Expected This Year</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.federal_tax_expected_this_year || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            federal_tax_expected_this_year: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Healthcare & Long-term Care */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Healthcare & Long-term Care</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Healthcare Out-of-Pocket (20 years)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.healthcare_outofpocket_20years || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            healthcare_outofpocket_20years: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Long-term Care (3 years)</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.longterm_care_3years || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            longterm_care_3years: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Has LTC Insurance?</Label>
                      <Select
                        value={financialGoalsData.has_ltc_insurance ? "yes" : "no"}
                        onValueChange={(value) =>
                          setFinancialGoalsData({ ...financialGoalsData, has_ltc_insurance: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Healthcare Philosophy</Label>
                      <Textarea
                        rows={2}
                        value={financialGoalsData.healthcare_philosophy || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({ ...financialGoalsData, healthcare_philosophy: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Net Worth */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Net Worth Projections</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Net Worth</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.current_net_worth || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            current_net_worth: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Projected Net Worth at Retirement</Label>
                      <Input
                        type="number"
                        value={financialGoalsData.projected_net_worth_retirement || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({
                            ...financialGoalsData,
                            projected_net_worth_retirement: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Special Needs & Legacy Goals */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Special Needs & Legacy Goals</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Special Needs Description</Label>
                      <Textarea
                        rows={3}
                        value={financialGoalsData.special_needs_description || ""}
                        onChange={(e) =>
                          setFinancialGoalsData({ ...financialGoalsData, special_needs_description: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Special Needs Amount</Label>
                        <Input
                          type="number"
                          value={financialGoalsData.special_needs_amount || ""}
                          onChange={(e) =>
                            setFinancialGoalsData({
                              ...financialGoalsData,
                              special_needs_amount: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Special Needs Years</Label>
                        <Input
                          type="number"
                          value={financialGoalsData.special_needs_years || ""}
                          onChange={(e) =>
                            setFinancialGoalsData({
                              ...financialGoalsData,
                              special_needs_years: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Special Needs Begin Year</Label>
                        <Input
                          type="number"
                          value={financialGoalsData.special_needs_begin_year || ""}
                          onChange={(e) =>
                            setFinancialGoalsData({
                              ...financialGoalsData,
                              special_needs_begin_year: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Legacy Assets Amount</Label>
                        <Input
                          type="number"
                          value={financialGoalsData.legacy_asset_amount || ""}
                          onChange={(e) =>
                            setFinancialGoalsData({
                              ...financialGoalsData,
                              legacy_asset_amount: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Legacy Years</Label>
                        <Input
                          type="number"
                          value={financialGoalsData.legacy_asset_years || ""}
                          onChange={(e) =>
                            setFinancialGoalsData({
                              ...financialGoalsData,
                              legacy_asset_years: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Legacy Begin Year</Label>
                        <Input
                          type="number"
                          value={financialGoalsData.legacy_asset_begin_year || ""}
                          onChange={(e) =>
                            setFinancialGoalsData({
                              ...financialGoalsData,
                              legacy_asset_begin_year: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisor Notes */}
                <div>
                  <Label>Advisor Notes & Recommendations</Label>
                  <Textarea
                    rows={6}
                    placeholder="Add your professional analysis, insights, and recommendations for financial goals..."
                    value={financialGoalsData.advisor_notes || ""}
                    onChange={(e) => setFinancialGoalsData({ ...financialGoalsData, advisor_notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Strategy Tab - FULL FORM */}
          <TabsContent value="growth-strategy">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Growth Strategy Analysis</CardTitle>
                    <CardDescription>
                      Review and edit client's assets, retirement accounts, and investment strategy
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveGrowthStrategy} disabled={saving.growthStrategy} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving.growthStrategy ? "Saving..." : "Save Growth Strategy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 401(k) Information - Self */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">401(k) - Self</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Has 401(k)?</Label>
                      <Select
                        value={growthStrategyData.has_401k_self ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, has_401k_self: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current 401(k) Balance</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.current_401k_balance_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            current_401k_balance_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Company Match %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.company_match_percent_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            company_match_percent_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Is Max Funding?</Label>
                      <Select
                        value={growthStrategyData.is_max_funding_self ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, is_max_funding_self: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Monthly Contribution</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.monthly_contribution_401k_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            monthly_contribution_401k_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Present Value</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.present_value_401k_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            present_value_401k_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Projected Value at 65</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.projected_value_65_401k_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            projected_value_65_401k_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Average Return %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.average_return_401k_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            average_return_401k_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 401(k) Information - Spouse */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">401(k) - Spouse</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Has 401(k)?</Label>
                      <Select
                        value={growthStrategyData.has_401k_spouse ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, has_401k_spouse: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Current 401(k) Balance</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.current_401k_balance_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            current_401k_balance_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Company Match %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.company_match_percent_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            company_match_percent_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Contribution</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.monthly_contribution_401k_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            monthly_contribution_401k_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Projected Value at 65</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.projected_value_65_401k_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            projected_value_65_401k_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* IRA & Roth Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">IRA & Roth Accounts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Traditional IRA Balance (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.traditional_ira_balance_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            traditional_ira_balance_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Traditional IRA Balance (Spouse)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.traditional_ira_balance_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            traditional_ira_balance_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Roth Balance (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.roth_balance_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            roth_balance_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Roth Balance (Spouse)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.roth_balance_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            roth_balance_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Average IRA Return %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.average_return_ira || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            average_return_ira: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Average Roth IRA Return %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.average_return_roth_ira || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            average_return_roth_ira: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* HSA Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Health Savings Account (HSA)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>HSA Balance (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.hsa_balance_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            hsa_balance_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>HSA Annual Contribution (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.hsa_annual_contribution_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            hsa_annual_contribution_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>HSA Balance (Spouse)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.hsa_balance_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            hsa_balance_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>HSA Annual Contribution (Spouse)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.hsa_annual_contribution_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            hsa_annual_contribution_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Average HSA Return %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.average_return_hsa || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            average_return_hsa: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Social Security & Pension */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Social Security & Pension</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SS Monthly Benefit (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.ss_monthly_benefit_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            ss_monthly_benefit_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>SS Annual Benefit (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.ss_annual_benefit_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            ss_annual_benefit_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>SS Monthly Benefit (Spouse)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.ss_monthly_benefit_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            ss_monthly_benefit_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>SS Annual Benefit (Spouse)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.ss_annual_benefit_spouse || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            ss_annual_benefit_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Pension Monthly Amount (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.pension_monthly_amount_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            pension_monthly_amount_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Pension Starting Age (Self)</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.pension_starting_age_self || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            pension_starting_age_self: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Real Estate */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Real Estate</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Home Value</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_value || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_value: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Home Purchase Year</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_purchase_year || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_purchase_year: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Home Purchase Price</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_purchase_price || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_purchase_price: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Mortgage Balance</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_mortgage_balance || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_mortgage_balance: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Mortgage Payment</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_monthly_payment || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_monthly_payment: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Mortgage Interest Rate %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_interest_rate || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_interest_rate: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Home Equity</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.primary_home_equity || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            primary_home_equity: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Brokerage & Investments */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Brokerage & Investments</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Brokerage Stocks</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.brokerage_stocks || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            brokerage_stocks: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Brokerage Mutual Funds</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.brokerage_mutual_funds || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            brokerage_mutual_funds: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Brokerage Bonds</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.brokerage_bonds || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            brokerage_bonds: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Brokerage ETFs</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.brokerage_etfs || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            brokerage_etfs: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Average Brokerage Return %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.average_return_brokerage || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            average_return_brokerage: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Cash & Emergency Fund */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cash & Emergency Fund</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Checking Account</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.checking_account || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            checking_account: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Savings Account</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.savings_account || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            savings_account: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Emergency Fund</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.emergency_fund || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            emergency_fund: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Money Market</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.money_market || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            money_market: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Other Cash</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.other_cash || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            other_cash: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Business & Other Assets */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Business & Other Assets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Owns Business?</Label>
                      <Select
                        value={growthStrategyData.owns_business ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, owns_business: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Business Name</Label>
                      <Input
                        value={growthStrategyData.business_name || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({ ...growthStrategyData, business_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Business Ownership %</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.business_ownership_percent || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            business_ownership_percent: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Business Estimated Value</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.business_estimated_value || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            business_estimated_value: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Business Annual Income</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.business_annual_income || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            business_annual_income: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Alternative Investment Value</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.alternative_investment_value || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            alternative_investment_value: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Inheritance & Estate */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Inheritance & Estate Planning</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expects Inheritance?</Label>
                      <Select
                        value={growthStrategyData.expects_inheritance ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, expects_inheritance: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Inheritance Estimated Value</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.inheritance_estimated_value || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            inheritance_estimated_value: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Inheritance Expected Year</Label>
                      <Input
                        type="number"
                        value={growthStrategyData.inheritance_expected_year || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({
                            ...growthStrategyData,
                            inheritance_expected_year: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Has Will?</Label>
                      <Select
                        value={growthStrategyData.has_will ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, has_will: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Has Trust?</Label>
                      <Select
                        value={growthStrategyData.has_trust ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, has_trust: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Guardian Designated?</Label>
                      <Select
                        value={growthStrategyData.has_guardian_designated ? "yes" : "no"}
                        onValueChange={(value) =>
                          setGrowthStrategyData({ ...growthStrategyData, has_guardian_designated: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Guardian Name</Label>
                      <Input
                        value={growthStrategyData.guardian_name || ""}
                        onChange={(e) =>
                          setGrowthStrategyData({ ...growthStrategyData, guardian_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Advisor Notes */}
                <div>
                  <Label>Advisor Notes & Recommendations</Label>
                  <Textarea
                    rows={6}
                    placeholder="Add your professional analysis, insights, and recommendations for growth strategy..."
                    value={growthStrategyData.advisor_notes || ""}
                    onChange={(e) => setGrowthStrategyData({ ...growthStrategyData, advisor_notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Defense Strategy Tab */}
          <TabsContent value="defense-strategy">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Defense Strategy Analysis</CardTitle>
                    <CardDescription>
                      Review and edit client's insurance, emergency funds, and risk management strategies
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveDefenseStrategy} disabled={saving.defenseStrategy} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving.defenseStrategy ? "Saving..." : "Save Defense Strategy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Life Insurance */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Life Insurance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Life Insurance Coverage (Self)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.work_life_coverage_self || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            work_life_coverage_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Life Insurance Coverage (Spouse)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.work_life_coverage_spouse || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            work_life_coverage_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Total Life Insurance Need</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.life_insurance_need_total || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            life_insurance_need_total: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Life Insurance Gap</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.life_insurance_gap || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            life_insurance_gap: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Term Life Insurance Term (Years)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.term_life_insurance_term || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            term_life_insurance_term: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Term Life Insurance Premium</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.term_life_insurance_premium || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            term_life_insurance_premium: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Has Disability Insurance (Self)?</Label>
                      <Select
                        value={defenseStrategyData.has_disability_insurance_self ? "yes" : "no"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            has_disability_insurance_self: value === "yes",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Disability Insurance Coverage (Self)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.disability_coverage_self || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            disability_coverage_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Has Disability Insurance (Spouse)?</Label>
                      <Select
                        value={defenseStrategyData.has_disability_insurance_spouse ? "yes" : "no"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            has_disability_insurance_spouse: value === "yes",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Disability Insurance Coverage (Spouse)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.disability_coverage_spouse || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            disability_coverage_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Long-Term Care Insurance */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Long-Term Care Insurance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Has LTC Insurance?</Label>
                      <Select
                        value={defenseStrategyData.has_ltc_insurance ? "yes" : "no"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({ ...defenseStrategyData, has_ltc_insurance: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>LTC Policy Benefit Amount</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.ltc_policy_benefit_amount || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            ltc_policy_benefit_amount: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>LTC Policy Benefit Period (Years)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.ltc_policy_benefit_period || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            ltc_policy_benefit_period: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>LTC Policy Elimination Period (Days)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.ltc_policy_elimination_period || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            ltc_policy_elimination_period: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>LTC Policy Monthly Premium</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.ltc_policy_monthly_premium || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            ltc_policy_monthly_premium: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Fund */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Emergency Fund</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Emergency Fund Balance</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.emergency_fund_balance || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            emergency_fund_balance: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Recommended Emergency Fund (Months of Expenses)</Label>
                      <Input
                        type="number"
                        value={defenseStrategyData.recommended_emergency_fund_months || ""}
                        onChange={(e) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            recommended_emergency_fund_months: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Emergency Fund Status</Label>
                      <Select
                        value={defenseStrategyData.emergency_fund_status || "adequate"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({ ...defenseStrategyData, emergency_fund_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adequate">Adequate</SelectItem>
                          <SelectItem value="inadequate">Inadequate</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Business Contingency */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Business Contingency</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Business Interruption Insurance?</Label>
                      <Select
                        value={defenseStrategyData.has_business_interruption_insurance ? "yes" : "no"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            has_business_interruption_insurance: value === "yes",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Business Key Person Insurance?</Label>
                      <Select
                        value={defenseStrategyData.has_key_person_insurance ? "yes" : "no"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({ ...defenseStrategyData, has_key_person_insurance: value === "yes" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Business Disaster Recovery Plan?</Label>
                      <Select
                        value={defenseStrategyData.has_business_disaster_recovery_plan ? "yes" : "no"}
                        onValueChange={(value) =>
                          setDefenseStrategyData({
                            ...defenseStrategyData,
                            has_business_disaster_recovery_plan: value === "yes",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Advisor Notes */}
                <div>
                  <Label>Advisor Notes & Recommendations</Label>
                  <Textarea
                    rows={6}
                    placeholder="Add your professional analysis, insights, and recommendations for defense strategy..."
                    value={defenseStrategyData.advisor_notes || ""}
                    onChange={(e) => setDefenseStrategyData({ ...defenseStrategyData, advisor_notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Savings vs Spending Tab */}
          <TabsContent value="savings-spending">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Savings vs Spending Analysis</CardTitle>
                    <CardDescription>Review and edit client's income, expenses, and savings habits</CardDescription>
                  </div>
                  <Button onClick={handleSaveSavingsVsSpending} disabled={saving.savingsVsSpending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving.savingsVsSpending ? "Saving..." : "Save Savings vs Spending"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Income */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Income</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Annual Gross Income (Self)</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.annual_gross_income_self || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            annual_gross_income_self: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Annual Gross Income (Spouse)</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.annual_gross_income_spouse || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            annual_gross_income_spouse: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Other Income Sources</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.other_income_sources || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            other_income_sources: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Net Monthly Income</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.net_monthly_income || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            net_monthly_income: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Expenses</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Monthly Expenses</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.total_monthly_expenses || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            total_monthly_expenses: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Expenses (General)</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_expenses_general || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_expenses_general: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Housing Costs</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.total_housing || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            total_housing: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Debt Payments (Excluding Mortgage)</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_debt_payments || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_debt_payments: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Transportation Costs</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_transportation_costs || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_transportation_costs: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Food Costs</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_food_costs || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_food_costs: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Utilities</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_utilities || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_utilities: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Entertainment & Leisure</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_entertainment_leisure || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_entertainment_leisure: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Healthcare Costs</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_healthcare_costs || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_healthcare_costs: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Childcare Costs</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_childcare_costs || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_childcare_costs: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Monthly Other Expenses</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.monthly_other_expenses || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            monthly_other_expenses: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Savings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Savings & Investments</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Retirement Savings</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.total_retirement_savings || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            total_retirement_savings: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Annual Savings Rate %</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.annual_savings_rate_percent || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            annual_savings_rate_percent: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Investment Portfolio Value</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.investment_portfolio_value || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            investment_portfolio_value: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Emergency Fund Target</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.emergency_fund_target || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            emergency_fund_target: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Savings Goals</Label>
                      <Textarea
                        rows={3}
                        value={savingsVsSpendingData.savings_goals || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({ ...savingsVsSpendingData, savings_goals: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Health Score */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Financial Health Score</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Debt-to-Income Ratio %</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.debt_to_income_ratio_percent || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            debt_to_income_ratio_percent: Number.parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Savings Rate vs Target</Label>
                      <Select
                        value={savingsVsSpendingData.savings_rate_vs_target || "on_track"}
                        onValueChange={(value) =>
                          setSavingsVsSpendingData({ ...savingsVsSpendingData, savings_rate_vs_target: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_track">On Track</SelectItem>
                          <SelectItem value="behind">Behind</SelectItem>
                          <SelectItem value="ahead">Ahead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Credit Score</Label>
                      <Input
                        type="number"
                        value={savingsVsSpendingData.credit_score || ""}
                        onChange={(e) =>
                          setSavingsVsSpendingData({
                            ...savingsVsSpendingData,
                            credit_score: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Advisor Notes */}
                <div>
                  <Label>Advisor Notes & Recommendations</Label>
                  <Textarea
                    rows={6}
                    placeholder="Add your professional analysis, insights, and recommendations for savings vs spending..."
                    value={savingsVsSpendingData.advisor_notes || ""}
                    onChange={(e) =>
                      setSavingsVsSpendingData({ ...savingsVsSpendingData, advisor_notes: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Final Report Tab */}
          <TabsContent value="final-report">
            <Card>
              <CardHeader>
                <CardTitle>Advisor Final Report</CardTitle>
                <CardDescription>
                  {allFormsExist
                    ? "Final report has been generated based on your analyzed forms"
                    : "Complete and save all forms to generate the final report"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allFormsExist ? (
                  <div className="space-y-4">
                    <p className="text-green-600 font-semibold">All forms have been analyzed and saved.</p>
                    <p>The final report is now available for the client.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Please save all forms before the final report can be generated. Currently saved:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>{!!financialGoalsData.advisor_notes ? "✓" : "○"} Financial Goals</li>
                      <li>{!!growthStrategyData.advisor_notes ? "✓" : "○"} Growth Strategy</li>
                      <li>{!!defenseStrategyData.advisor_notes ? "✓" : "○"} Defense Strategy</li>
                      <li>{!!savingsVsSpendingData.advisor_notes ? "✓" : "○"} Savings vs Spending</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
