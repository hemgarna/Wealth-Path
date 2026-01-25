"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  FileText,
  Download,
  Share2,
  Upload,
  Trash2,
  File,
  FileCheck,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { ExpertComments } from "@/components/admin/expert-comments"
import { GapAnalysisReport } from "@/components/admin/gap-analysis-report"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface CaseDetailViewProps {
  caseId: string
  advisorId: string
  viewAsAdvisorId?: string // Added prop to track if CEO is viewing advisor's client
  isCeoView?: boolean // Added prop to identify CEO direct view
}

export function CaseDetailView({ caseId, advisorId, viewAsAdvisorId, isCeoView }: CaseDetailViewProps) {
  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState<any>(null)
  const [finalReport, setFinalReport] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [caseStatus, setCaseStatus] = useState<any>(null)
  const [caseNotes, setCaseNotes] = useState("")
  const [uploadedReports, setUploadedReports] = useState<any[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [financialGoals, setFinancialGoals] = useState<any>(null)
  const [growthStrategy, setGrowthStrategy] = useState<any>(null)
  const [defenseStrategy, setDefenseStrategy] = useState<any>(null)
  const [savingsVsSpending, setSavingsVsSpending] = useState<any>(null)
  // Add state for advisor analyzed versions
  const [advisorFinancialGoals, setAdvisorFinancialGoals] = useState<any>(null)
  const [advisorGrowthStrategy, setAdvisorGrowthStrategy] = useState<any>(null)
  const [advisorDefenseStrategy, setAdvisorDefenseStrategy] = useState<any>(null)
  const [advisorSavingsVsSpending, setAdvisorSavingsVsSpending] = useState<any>(null)
  const [advisorFinalReport, setAdvisorFinalReport] = useState<any>(null)
  const [copying, setCopying] = useState(false)

  const [financialOverview, setFinancialOverview] = useState<{
    annualIncome: number
    currentSavings: number
    monthlyExpenses: number
    insuranceCoverage: number
    retirementAge: number
    dependents: number
  } | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCaseData()
  }, [caseId])

  // Inside useEffect after existing fetchCaseData call, add:
  useEffect(() => {
    async function fetchFinancialOverview() {
      try {
        const response = await fetch(`/api/case/financial-overview?caseId=${caseId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Financial Overview from API:", data)
          setFinancialOverview(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching financial overview:", error)
      }
    }

    if (caseId) {
      fetchFinancialOverview()
    }
  }, [caseId])

  async function fetchCaseData() {
    setLoading(true)

    console.log("[v0] Fetching case data for:", caseId)

    console.log("[v0] Advisor ID:", advisorId, "Is valid UUID:", !!advisorId && advisorId.length > 0)

    const [
      clientResult,
      reportResult,
      assessmentResult,
      caseStatusResult,
      reportsResult,
      financialGoalsResult,
      growthStrategyResult,
      defenseStrategyResult,
      savingsVsSpendingResult,
      advisorFinancialGoalsResult,
      advisorGrowthStrategyResult,
      advisorDefenseStrategyResult,
      advisorSavingsVsSpendingResult,
      advisorFinalReportResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", caseId).single(),
      supabase.from("final_report").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("client_assessments").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("case_status").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("client_reports").select("*").eq("user_id", caseId).order("created_at", { ascending: false }),
      supabase.from("financial_goals").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("growth_strategy").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("defense_strategy").select("*").eq("user_id", caseId).maybeSingle(),
      supabase.from("savings_vs_spending").select("*").eq("user_id", caseId).maybeSingle(),
      advisorId && advisorId.length > 0
        ? supabase
            .from("advisor_financial_goals")
            .select("*")
            .eq("user_id", caseId)
            .eq("advisor_id", advisorId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      advisorId && advisorId.length > 0
        ? supabase
            .from("advisor_growth_strategy")
            .select("*")
            .eq("user_id", caseId)
            .eq("advisor_id", advisorId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      advisorId && advisorId.length > 0
        ? supabase
            .from("advisor_defense_strategy")
            .select("*")
            .eq("user_id", caseId)
            .eq("advisor_id", advisorId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      advisorId && advisorId.length > 0
        ? supabase
            .from("advisor_savings_vs_spending")
            .select("*")
            .eq("user_id", caseId)
            .eq("advisor_id", advisorId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      advisorId && advisorId.length > 0
        ? supabase
            .from("advisor_final_report")
            .select("*")
            .eq("user_id", caseId)
            .eq("advisor_id", advisorId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ])

    console.log("[v0] Fetched data - Client:", !!clientResult.data)
    console.log("[v0] Fetched data - Final Report:", !!reportResult.data)
    console.log(
      "[v0] Fetched data - Financial Goals:",
      !!financialGoalsResult.data,
      financialGoalsResult.data?.completed,
    )
    console.log(
      "[v0] Fetched data - Growth Strategy:",
      !!growthStrategyResult.data,
      growthStrategyResult.data?.completed,
    )
    console.log(
      "[v0] Fetched data - Defense Strategy:",
      !!defenseStrategyResult.data,
      defenseStrategyResult.data?.completed,
    )
    console.log(
      "[v0] Fetched data - Savings vs Spending:",
      !!savingsVsSpendingResult.data,
      savingsVsSpendingResult.data?.completed,
    )
    console.log("[v0] Fetched data - Advisor Financial Goals:", !!advisorFinancialGoalsResult.data)
    console.log("[v0] Fetched data - Advisor Growth Strategy:", !!advisorGrowthStrategyResult.data)
    console.log("[v0] Fetched data - Advisor Defense Strategy:", !!advisorDefenseStrategyResult.data)
    console.log("[v0] Fetched data - Advisor Savings vs Spending:", !!advisorSavingsVsSpendingResult.data)
    console.log("[v0] Fetched data - Advisor Final Report:", !!advisorFinalReportResult.data)

    setClientData(clientResult.data)
    setFinalReport(reportResult.data)
    setAssessment(assessmentResult.data)
    setUploadedReports(reportsResult.data || [])
    setFinancialGoals(financialGoalsResult.data)
    setGrowthStrategy(growthStrategyResult.data)
    setDefenseStrategy(defenseStrategyResult.data)
    setSavingsVsSpending(savingsVsSpendingResult.data)

    setAdvisorFinancialGoals(advisorFinancialGoalsResult.data)
    setAdvisorGrowthStrategy(advisorGrowthStrategyResult.data)
    setAdvisorDefenseStrategy(advisorDefenseStrategyResult.data)
    setAdvisorSavingsVsSpending(advisorSavingsVsSpendingResult.data)
    setAdvisorFinalReport(advisorFinalReportResult.data)

    if (caseStatusResult.data) {
      setCaseStatus(caseStatusResult.data)
      setCaseNotes(caseStatusResult.data.admin_notes || "")
    }

    setLoading(false)
  }

  async function handleReportUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("userId", caseId)

    try {
      const response = await fetch("/api/admin/upload-report", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setUploadDialogOpen(false)
        fetchCaseData() // Refresh data
        alert("Report uploaded successfully!")
      } else {
        alert("Failed to upload report")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload report")
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteReport(reportId: string) {
    if (!confirm("Are you sure you want to delete this report?")) return

    try {
      const response = await fetch("/api/admin/delete-report", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      })

      if (response.ok) {
        fetchCaseData() // Refresh data
        alert("Report deleted successfully!")
      } else {
        alert("Failed to delete report")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete report")
    }
  }

  async function exportToExcel() {
    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: caseId }),
      })

      if (response.ok) {
        alert("Report exported successfully")
      } else {
        alert("Failed to export report")
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      alert("Failed to export report")
    }
  }

  const handleDownloadForm = async (formType: string) => {
    try {
      const response = await fetch("/api/admin/download-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: caseId,
          formType,
        }),
      })

      if (!response.ok) throw new Error("Failed to download form")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${clientData.full_name.replace(/\s+/g, "_")}_${formType}_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("[v0] Error downloading form:", error)
      alert("Failed to download form. Please try again.")
    }
  }

  // This function is no longer used and has been removed.
  // async function handleMakeCopy(formType: string) {
  //   setCopying(true)
  //   try {
  //     const response = await fetch("/api/admin/copy-form-for-analysis", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: caseId,
  //         formType,
  //         advisorId,
  //       }),
  //     })

  //     if (response.ok) {
  //       alert("Form copied successfully! You can now edit it in the Advisor Analysis & Edits section.")
  //       fetchCaseData() // Refresh to show the new copy
  //     } else {
  //       const error = await response.json()
  //       alert(error.error || "Failed to copy form")
  //     }
  //   } catch (error) {
  //     console.error("Error copying form:", error)
  //     alert("Failed to copy form")
  //   } finally {
  //     setCopying(false)
  //   }
  // }

  const getCaseId = () => {
    if (!clientData?.created_at) return "FNA-2024-001"
    const date = new Date(clientData.created_at)
    const year = date.getFullYear()
    const caseNumber = clientData.email?.split("@")[0].length.toString().padStart(3, "0") || "001"
    return `FNA-${year}-${caseNumber}`
  }

  // Annual Income - try multiple sources in order of reliability
  const annualIncome =
    savingsVsSpending?.annual_gross_income ||
    (finalReport?.gross_monthly_income ? finalReport.gross_monthly_income * 12 : 0) ||
    finalReport?.total_income_before_tax ||
    assessment?.annual_income ||
    (financialGoals?.annual_retirement_income_today ? financialGoals.annual_retirement_income_today : 0) ||
    0

  // Current Savings - aggregate from multiple sources
  const currentSavings =
    (growthStrategy?.current_401k_balance_self || 0) +
      (growthStrategy?.current_401k_balance_spouse || 0) +
      (growthStrategy?.traditional_ira_balance_self || 0) +
      (growthStrategy?.traditional_ira_balance_spouse || 0) +
      (growthStrategy?.roth_balance_self || 0) +
      (growthStrategy?.roth_balance_spouse || 0) +
      (growthStrategy?.hsa_balance_self || 0) +
      (growthStrategy?.hsa_balance_spouse || 0) +
      (growthStrategy?.emergency_fund || 0) +
      (growthStrategy?.checking_account || 0) +
      (growthStrategy?.savings_account || 0) ||
    assessment?.cash_savings ||
    0

  // Monthly Expenses - try multiple sources
  const monthlyExpenses =
    savingsVsSpending?.total_short_term ||
    (savingsVsSpending?.total_housing || 0) + (savingsVsSpending?.total_lifestyle || 0) ||
    finalReport?.total_monthly_expenses ||
    financialGoals?.total_monthly_expenses ||
    assessment?.monthly_expenses ||
    0

  // Insurance Coverage - aggregate life insurance from defense strategy
  const insuranceCoverage =
    (defenseStrategy?.work_life_coverage_self || 0) +
      (defenseStrategy?.work_life_coverage_spouse || 0) +
      (defenseStrategy?.personal_life_coverage_self || 0) +
      (defenseStrategy?.personal_life_coverage_spouse || 0) ||
    finalReport?.life_insurance_total ||
    (assessment?.life_insurance_work_him || 0) +
      (assessment?.life_insurance_work_her || 0) +
      (assessment?.life_insurance_outside_him || 0) +
      (assessment?.life_insurance_outside_her || 0) ||
    assessment?.current_life_insurance ||
    0

  console.log("[v0] ===== FINANCIAL OVERVIEW CALCULATION =====")
  console.log("[v0] Case ID:", caseId)
  console.log("[v0] Data Sources Loaded:")
  console.log("  - financialGoals:", !!financialGoals, financialGoals?.completed)
  console.log("  - growthStrategy:", !!growthStrategy, growthStrategy?.completed)
  console.log("  - defenseStrategy:", !!defenseStrategy, defenseStrategy?.completed)
  console.log("  - savingsVsSpending:", !!savingsVsSpending, savingsVsSpending?.completed)
  console.log("  - finalReport:", !!finalReport)
  console.log("  - assessment:", !!assessment)
  console.log("[v0] Source Values:")
  console.log("  - savingsVsSpending.annual_gross_income:", savingsVsSpending?.annual_gross_income)
  console.log("  - finalReport.gross_monthly_income:", finalReport?.gross_monthly_income)
  console.log("  - finalReport.total_income_before_tax:", finalReport?.total_income_before_tax)
  console.log("  - assessment.annual_income:", assessment?.annual_income)
  console.log("  - growthStrategy.current_401k_balance_self:", growthStrategy?.current_401k_balance_self)
  console.log("  - savingsVsSpending.total_housing:", savingsVsSpending?.total_housing)
  console.log("  - savingsVsSpending.total_lifestyle:", savingsVsSpending?.total_lifestyle)
  console.log("  - finalReport.total_monthly_expenses:", finalReport?.total_monthly_expenses)
  console.log("  - defenseStrategy.work_life_coverage_self:", defenseStrategy?.work_life_coverage_self)
  console.log("  - finalReport.life_insurance_total:", finalReport?.life_insurance_total)
  console.log("[v0] Calculated Values:")
  console.log("  - Annual Income:", annualIncome)
  console.log("  - Current Savings:", currentSavings)
  console.log("  - Monthly Expenses:", monthlyExpenses)
  console.log("  - Insurance Coverage:", insuranceCoverage)
  console.log("[v0] ==========================================")

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      new: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "New" },
      in_review: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Review" },
      completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
      pending: { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
    }

    const { color, label } = config[status] || config.new
    return (
      <Badge className={`${color} border`} variant="outline">
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">Client not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={isCeoView ? "/ceo" : viewAsAdvisorId ? `/admin?viewAsAdvisor=${viewAsAdvisorId}` : "/admin"}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{getCaseId()}</h1>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{clientData.full_name || clientData.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={exportToExcel}>
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={exportToExcel}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
            >
              Comments & Notes
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Client Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">{clientData.full_name || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{clientData.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{clientData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">
                        {finalReport?.current_age ? `${finalReport.current_age} years` : "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium text-gray-900">{clientData.occupation || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(caseStatus?.status || "new")}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update the Financial Overview section to use API data */}
            {/* Financial Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual Income</p>
                    <p className="text-2xl font-semibold text-gray-900">${annualIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Savings</p>
                    <p className="text-2xl font-semibold text-gray-900">${currentSavings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
                    <p className="text-2xl font-semibold text-gray-900">${monthlyExpenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Insurance Coverage</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      $
                      {insuranceCoverage > 1000000
                        ? `${(insuranceCoverage / 1000000).toFixed(1)}M`
                        : insuranceCoverage.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Retirement Age</p>
                    <p className="text-lg font-medium text-gray-900">
                      {financialGoals?.retirement_age || assessment?.retirement_age || finalReport?.retirement_age
                        ? `${financialGoals?.retirement_age || assessment?.retirement_age || finalReport?.retirement_age} years`
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dependents</p>
                    <p className="text-lg font-medium text-gray-900">
                      {clientData.dependents || financialGoals?.children?.length || assessment?.number_of_children || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">FNA Created</p>
                    <p className="text-lg font-medium text-gray-900">
                      {finalReport?.created_at
                        ? new Date(finalReport.created_at).toLocaleDateString()
                        : clientData?.created_at
                          ? new Date(clientData.created_at).toLocaleDateString()
                          : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Submitted Forms Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Client Submitted Forms</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {assessment ? (
                    <span>
                      Progress:{" "}
                      {Math.floor(
                        (((financialGoals ? 1 : 0) +
                          (growthStrategy ? 1 : 0) +
                          (defenseStrategy ? 1 : 0) +
                          (savingsVsSpending ? 1 : 0) +
                          (finalReport ? 1 : 0)) /
                          5) *
                          100,
                      )}
                      % complete (
                      {(financialGoals ? 1 : 0) +
                        (growthStrategy ? 1 : 0) +
                        (defenseStrategy ? 1 : 0) +
                        (savingsVsSpending ? 1 : 0) +
                        (finalReport ? 1 : 0)}
                      /5 forms filled)
                    </span>
                  ) : (
                    "View forms filled out by the client"
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Financial Goals Form */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-3 flex-1">
                      <FileCheck className={`h-5 w-5 mt-0.5 ${financialGoals ? "text-green-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">Financial Goals Assessment</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Retirement planning, lifestyle goals, and long-term objectives
                        </p>
                        {financialGoals && (
                          <p className="text-xs text-green-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                              Filled • Submitted {new Date(financialGoals.updated_at).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(
                            `/financial-goals/form?clientId=${caseId}&mode=edit&returnUrl=${encodeURIComponent(isCeoView ? "/ceo" : "/admin")}`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(`/api/admin/download-form?userId=${caseId}&formType=financial_goals`, "_blank")
                        }
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Growth Strategy Form */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-3 flex-1">
                      <FileCheck className={`h-5 w-5 mt-0.5 ${growthStrategy ? "text-green-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">Growth Strategy & Assets</h4>
                        <p className="text-sm text-gray-500">
                          Investments, retirement accounts, real estate, and asset allocation
                        </p>
                        {growthStrategy && (
                          <p className="text-xs text-green-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                              Filled • Submitted {new Date(growthStrategy.updated_at).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(
                            `/growth-strategy/form?clientId=${caseId}&mode=edit&returnUrl=${encodeURIComponent(isCeoView ? "/ceo" : "/admin")}`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(`/api/admin/download-form?userId=${caseId}&formType=growth_strategy`, "_blank")
                        }
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Defense Strategy Form */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-3 flex-1">
                      <FileCheck className={`h-5 w-5 mt-0.5 ${defenseStrategy ? "text-green-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">Defense Strategy & Protection</h4>
                        <p className="text-sm text-gray-500">Insurance, estate planning, and asset protection</p>
                        {defenseStrategy && (
                          <p className="text-xs text-green-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                              Filled • Submitted {new Date(defenseStrategy.updated_at).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(
                            `/defense-strategy/form?clientId=${caseId}&mode=edit&returnUrl=${encodeURIComponent(isCeoView ? "/ceo" : "/admin")}`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(`/api/admin/download-form?userId=${caseId}&formType=defense_strategy`, "_blank")
                        }
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Savings vs Spending Form */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-3 flex-1">
                      <FileCheck
                        className={`h-5 w-5 mt-0.5 ${savingsVsSpending ? "text-green-600" : "text-gray-400"}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">Savings vs Spending Analysis</h4>
                        <p className="text-sm text-gray-500">Income, expenses, and cash-flow management</p>
                        {savingsVsSpending && (
                          <p className="text-xs text-green-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                              Filled • Submitted {new Date(savingsVsSpending.updated_at).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(
                            `/savings-vs-spending/form?clientId=${caseId}&mode=edit&returnUrl=${encodeURIComponent(isCeoView ? "/ceo" : "/admin")}`,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 bg-transparent"
                        onClick={() =>
                          window.open(
                            `/api/admin/download-form?userId=${caseId}&formType=savings_vs_spending`,
                            "_blank",
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Final Report */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-3 flex-1">
                      <FileCheck className={`h-5 w-5 mt-0.5 ${finalReport ? "text-green-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">Final Report</h4>
                        <p className="text-sm text-gray-500">Complete financial analysis and recommendations</p>
                        {finalReport && (
                          <p className="text-xs text-green-600 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                              Generated • Submitted {new Date(finalReport.updated_at).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/final-report?clientId=${caseId}&mode=edit&returnUrl=${encodeURIComponent(isCeoView ? "/ceo" : viewAsAdvisorId ? `/admin?viewAsAdvisor=${viewAsAdvisorId}` : "/admin")}`}
                      >
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent" disabled={!finalReport}>
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      {finalReport && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => handleDownloadForm("final_report")}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Case Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{caseNotes || "No notes yet"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <ExpertComments caseId={caseId} advisorId={advisorId} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Gap Analysis Report Section */}
            <GapAnalysisReport finalReport={finalReport} clientProfile={clientData} />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Uploaded Reports</CardTitle>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Add Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Upload Report</DialogTitle>
                      <DialogDescription>Upload a financial analysis report for this client.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReportUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Report Title *</Label>
                        <Input id="title" name="title" required placeholder="e.g., Retirement Gap Analysis Report" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reportType">Report Type *</Label>
                        <Select name="reportType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retirement_gap">Retirement Gap Analysis</SelectItem>
                            <SelectItem value="tax_optimization">Tax Optimization Strategy</SelectItem>
                            <SelectItem value="insurance_analysis">Insurance Analysis</SelectItem>
                            <SelectItem value="estate_planning">Estate Planning</SelectItem>
                            <SelectItem value="investment_strategy">Investment Strategy</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Brief description of the report contents"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="file">File *</Label>
                        <Input id="file" name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx" />
                        <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX</p>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload Report"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {uploadedReports.length > 0 ? (
                  <div className="space-y-3">
                    {uploadedReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <File className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{report.title}</h4>
                            {report.description && <p className="text-sm text-gray-600 mt-1">{report.description}</p>}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Uploaded {new Date(report.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{report.file_name}</span>
                              {report.file_size && (
                                <>
                                  <span>•</span>
                                  <span>{(report.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <File className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No reports uploaded yet</p>
                    <p className="text-sm mt-1">Click "Add Report" to upload financial analysis documents</p>
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
