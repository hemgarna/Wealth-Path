"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, ArrowLeft } from "lucide-react" // Import ArrowLeft
import { FormHelpPanel } from "@/components/forms/form-help-panel"
import { savingsVsSpendingHelp } from "@/lib/form-help-content"
import { Switch } from "@/components/ui/switch" // Keep this import
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // Import RadioGroup and RadioGroupItem

interface FormData {
  monthly_base_income: string
  federal_tax: string
  state_tax: string
  fica_medicare: string
  pre_tax_401k: string
  pre_tax_hsa: string
  espp: string // Added ESPP field
  monthly_rsu: string
  net_monthly_income: string
  monthly_emergency_fund: string // Added Emergency Fund field

  follows_budget_plan: string

  // Category totals for budget analysis
  total_housing: string
  total_retirement_savings: string
  total_lifestyle: string
  total_short_term: string

  has_vehicle_loan: boolean
  vehicle_loan_amount: string
  vehicle_loan_apr: string
  vehicle_loan_payment: string

  has_credit_card_loan: boolean
  credit_card_loan_amount: string
  credit_card_loan_apr: string
  credit_card_loan_payment: string

  has_personal_loan: boolean
  personal_loan_amount: string
  personal_loan_apr: string
  personal_loan_payment: string

  has_education_loan: boolean
  education_loan_amount: string
  education_loan_apr: string
  education_loan_payment: string

  has_other_loan: boolean
  other_loan_amount: string
  other_loan_apr: string
  other_loan_payment: string
}

export default function SavingsVsSpendingForm({
  initialData,
  userId,
  isReadOnly = false,
  clientId, // Added clientId prop
  returnUrl, // Added returnUrl prop for proper back navigation
}: { initialData: any; userId: string; isReadOnly?: boolean; clientId?: string; returnUrl?: string }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState<FormData>({
    monthly_base_income:
      (initialData?.monthly_base_income ?? initialData?.annual_gross_income)
        ? (Number(initialData.annual_gross_income) / 12).toString()
        : "",
    federal_tax: initialData?.federal_tax ?? "",
    state_tax: initialData?.state_tax ?? "",
    fica_medicare: initialData?.fica_medicare ?? "",
    pre_tax_401k: initialData?.pre_tax_401k ?? "",
    pre_tax_hsa: initialData?.pre_tax_hsa ?? "",
    espp: initialData?.espp ?? "", // Initialize ESPP
    monthly_rsu: initialData?.monthly_rsu ?? "",
    net_monthly_income: initialData?.net_monthly_income ?? "",
    monthly_emergency_fund: initialData?.monthly_emergency_fund ?? "", // Initialize Emergency Fund
    follows_budget_plan: initialData?.follows_budget_plan ?? "no",
    total_housing: initialData?.total_housing ?? "",
    total_retirement_savings: initialData?.total_retirement_savings ?? "",
    total_lifestyle: initialData?.total_lifestyle ?? "",
    total_short_term: initialData?.total_short_term ?? "",

    has_vehicle_loan: initialData?.loans?.vehicle?.enabled ?? false,
    vehicle_loan_amount: initialData?.loans?.vehicle?.amount ?? "",
    vehicle_loan_apr: initialData?.loans?.vehicle?.apr ?? "",
    vehicle_loan_payment: initialData?.loans?.vehicle?.payment ?? "",

    has_credit_card_loan: initialData?.loans?.credit_card?.enabled ?? false,
    credit_card_loan_amount: initialData?.loans?.credit_card?.amount ?? "",
    credit_card_loan_apr: initialData?.loans?.credit_card?.apr ?? "",
    credit_card_loan_payment: initialData?.loans?.credit_card?.payment ?? "",

    has_personal_loan: initialData?.loans?.personal?.enabled ?? false,
    personal_loan_amount: initialData?.loans?.personal?.amount ?? "",
    personal_loan_apr: initialData?.loans?.personal?.apr ?? "",
    personal_loan_payment: initialData?.loans?.personal?.payment ?? "",

    has_education_loan: initialData?.loans?.education?.enabled ?? false,
    education_loan_amount: initialData?.loans?.education?.amount ?? "",
    education_loan_apr: initialData?.loans?.education?.apr ?? "",
    education_loan_payment: initialData?.loans?.education?.payment ?? "",

    has_other_loan: initialData?.loans?.other?.enabled ?? false,
    other_loan_amount: initialData?.loans?.other?.amount ?? "",
    other_loan_apr: initialData?.loans?.other?.apr ?? "",
    other_loan_payment: initialData?.loans?.other?.payment ?? "",
  })

  // Helper to handle input changes, respecting readOnly mode
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      if (isReadOnly) return
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    [isReadOnly],
  )

  // Helper for saving data
  const handleSave = useCallback(async () => {
    if (isReadOnly) return
    setIsSaving(true)

    try {
      const supabase = createBrowserClient()

      const loansData = {
        vehicle: {
          enabled: formData.has_vehicle_loan,
          amount: formData.vehicle_loan_amount === "" ? null : Number(formData.vehicle_loan_amount),
          apr: formData.vehicle_loan_apr === "" ? null : Number(formData.vehicle_loan_apr),
          payment: formData.vehicle_loan_payment === "" ? null : Number(formData.vehicle_loan_payment),
        },
        credit_card: {
          enabled: formData.has_credit_card_loan,
          amount: formData.credit_card_loan_amount === "" ? null : Number(formData.credit_card_loan_amount),
          apr: formData.credit_card_loan_apr === "" ? null : Number(formData.credit_card_loan_apr),
          payment: formData.credit_card_loan_payment === "" ? null : Number(formData.credit_card_loan_payment),
        },
        personal: {
          enabled: formData.has_personal_loan,
          amount: formData.personal_loan_amount === "" ? null : Number(formData.personal_loan_amount),
          apr: formData.personal_loan_apr === "" ? null : Number(formData.personal_loan_apr),
          payment: formData.personal_loan_payment === "" ? null : Number(formData.personal_loan_payment),
        },
        education: {
          enabled: formData.has_education_loan,
          amount: formData.education_loan_amount === "" ? null : Number(formData.education_loan_amount),
          apr: formData.education_loan_apr === "" ? null : Number(formData.education_loan_apr),
          payment: formData.education_loan_payment === "" ? null : Number(formData.education_loan_payment),
        },
        other: {
          enabled: formData.has_other_loan,
          amount: formData.other_loan_amount === "" ? null : Number(formData.other_loan_amount),
          apr: formData.other_loan_apr === "" ? null : Number(formData.other_loan_apr),
          payment: formData.other_loan_payment === "" ? null : Number(formData.other_loan_payment),
        },
      }

      const dataToSave = {
        user_id: userId,
        annual_gross_income: formData.monthly_base_income === "" ? null : Number(formData.monthly_base_income) * 12,
        federal_tax: formData.federal_tax === "" ? null : Number(formData.federal_tax),
        state_tax: formData.state_tax === "" ? null : Number(formData.state_tax),
        fica_medicare: formData.fica_medicare === "" ? null : Number(formData.fica_medicare),
        pre_tax_401k: formData.pre_tax_401k === "" ? null : Number(formData.pre_tax_401k),
        pre_tax_hsa: formData.pre_tax_hsa === "" ? null : Number(formData.pre_tax_hsa),
        espp: formData.espp === "" ? null : Number(formData.espp), // Save ESPP
        monthly_rsu: formData.monthly_rsu === "" ? null : Number(formData.monthly_rsu),
        net_monthly_income: formData.net_monthly_income === "" ? null : Number(formData.net_monthly_income),
        monthly_emergency_fund: formData.monthly_emergency_fund === "" ? null : Number(formData.monthly_emergency_fund), // Save Emergency Fund
        total_housing: formData.total_housing === "" ? null : Number(formData.total_housing),
        total_retirement_savings:
          formData.total_retirement_savings === "" ? null : Number(formData.total_retirement_savings),
        total_lifestyle: formData.total_lifestyle === "" ? null : Number(formData.total_lifestyle),
        total_short_term: formData.total_short_term === "" ? null : Number(formData.total_short_term),
        loans: loansData, // Save loans data
        completed: true,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("savings_vs_spending").upsert(dataToSave, { onConflict: "user_id" })

      if (error) {
        console.error("[v0] Database error during save:", error)
        throw error
      }

      console.log("[v0] Saved savings vs spending data successfully")
      setAutoSaveStatus("saved")
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("[v0] Error saving savings vs spending data:", error)
      alert("Error saving data. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [formData, userId, isReadOnly])

  // Handler for the "Back" button
  const handleBack = useCallback(() => {
    if (returnUrl) {
      router.push(returnUrl)
    } else {
      router.push("/home")
    }
  }, [router, returnUrl])

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "number") {
        e.preventDefault()
      }
    }

    document.addEventListener("wheel", preventScroll, { passive: false })

    return () => {
      document.removeEventListener("wheel", preventScroll)
    }
  }, [])

  // Calculate net monthly income
  useEffect(() => {
    if (formData.monthly_base_income) {
      const monthlyGross = Number(formData.monthly_base_income)
      const federalTax = monthlyGross * 0.139
      const stateTax = monthlyGross * 0.046
      const ficaMedicare = monthlyGross * 0.0765

      const netMonthly =
        monthlyGross +
        Number(formData.pre_tax_401k || 0) +
        Number(formData.pre_tax_hsa || 0) +
        Number(formData.espp || 0) +
        Number(formData.monthly_rsu || 0)

      setFormData((prev) => ({
        ...prev,
        federal_tax: Math.round(federalTax).toString(),
        state_tax: Math.round(stateTax).toString(),
        fica_medicare: Math.round(ficaMedicare).toString(),
        net_monthly_income: Math.round(netMonthly).toString(),
      }))
    }
  }, [formData.monthly_base_income, formData.pre_tax_401k, formData.pre_tax_hsa, formData.espp, formData.monthly_rsu]) // Added ESPP and RSU to dependencies

  const autoSave = useCallback(async () => {
    try {
      setAutoSaveStatus("saving")
      console.log("[v0] Auto-saving savings vs spending data...")

      const loansData = {
        vehicle: {
          enabled: formData.has_vehicle_loan,
          amount: formData.vehicle_loan_amount === "" ? null : Number(formData.vehicle_loan_amount),
          apr: formData.vehicle_loan_apr === "" ? null : Number(formData.vehicle_loan_apr),
          payment: formData.vehicle_loan_payment === "" ? null : Number(formData.vehicle_loan_payment),
        },
        credit_card: {
          enabled: formData.has_credit_card_loan,
          amount: formData.credit_card_loan_amount === "" ? null : Number(formData.credit_card_loan_amount),
          apr: formData.credit_card_loan_apr === "" ? null : Number(formData.credit_card_loan_apr),
          payment: formData.credit_card_loan_payment === "" ? null : Number(formData.credit_card_loan_payment),
        },
        personal: {
          enabled: formData.has_personal_loan,
          amount: formData.personal_loan_amount === "" ? null : Number(formData.personal_loan_amount),
          apr: formData.personal_loan_apr === "" ? null : Number(formData.personal_loan_apr),
          payment: formData.personal_loan_payment === "" ? null : Number(formData.personal_loan_payment),
        },
        education: {
          enabled: formData.has_education_loan,
          amount: formData.education_loan_amount === "" ? null : Number(formData.education_loan_amount),
          apr: formData.education_loan_apr === "" ? null : Number(formData.education_loan_apr),
          payment: formData.education_loan_payment === "" ? null : Number(formData.education_loan_payment),
        },
        other: {
          enabled: formData.has_other_loan,
          amount: formData.other_loan_amount === "" ? null : Number(formData.other_loan_amount),
          apr: formData.other_loan_apr === "" ? null : Number(formData.other_loan_apr),
          payment: formData.other_loan_payment === "" ? null : Number(formData.other_loan_payment),
        },
      }

      const dataToSave = {
        user_id: userId,
        annual_gross_income: formData.monthly_base_income === "" ? null : Number(formData.monthly_base_income) * 12,
        federal_tax: formData.federal_tax === "" ? null : Number(formData.federal_tax),
        state_tax: formData.state_tax === "" ? null : Number(formData.state_tax),
        fica_medicare: formData.fica_medicare === "" ? null : Number(formData.fica_medicare),
        pre_tax_401k: formData.pre_tax_401k === "" ? null : Number(formData.pre_tax_401k),
        pre_tax_hsa: formData.pre_tax_hsa === "" ? null : Number(formData.pre_tax_hsa),
        espp: formData.espp === "" ? null : Number(formData.espp), // Save ESPP
        // Save RSU
        monthly_rsu: formData.monthly_rsu === "" ? null : Number(formData.monthly_rsu),
        net_monthly_income: formData.net_monthly_income === "" ? null : Number(formData.net_monthly_income),
        monthly_emergency_fund: formData.monthly_emergency_fund === "" ? null : Number(formData.monthly_emergency_fund), // Save Emergency Fund
        total_housing: formData.total_housing === "" ? null : Number(formData.total_housing),
        total_retirement_savings:
          formData.total_retirement_savings === "" ? null : Number(formData.total_retirement_savings),
        total_lifestyle: formData.total_lifestyle === "" ? null : Number(formData.total_lifestyle),
        total_short_term: formData.total_short_term === "" ? null : Number(formData.total_short_term),
        loans: loansData, // Save loans data
      }

      // If clientId is provided (advisor/CEO editing), use API to bypass RLS
      if (clientId) {
        const response = await fetch("/api/forms/save-savings-vs-spending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, data: dataToSave }),
        })

        if (!response.ok) {
          console.error("[v0] Auto-save API error")
          setAutoSaveStatus("idle")
        } else {
          console.log("[v0] Auto-save successful via API")
          setAutoSaveStatus("saved")
          setTimeout(() => setAutoSaveStatus("idle"), 2000)
        }
      } else {
        const supabase = createBrowserClient()
        const { error } = await supabase.from("savings_vs_spending").upsert(dataToSave, { onConflict: "user_id" })

        if (error) {
          console.error("[v0] Auto-save error:", error)
          setAutoSaveStatus("idle")
        } else {
          console.log("[v0] Auto-save successful")
          setAutoSaveStatus("saved")
          setTimeout(() => setAutoSaveStatus("idle"), 2000)
        }
      }
    } catch (error) {
      console.error("[v0] Auto-save exception:", error)
      setAutoSaveStatus("idle")
    }
  }, [formData, userId, clientId])

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    if (!formData.monthly_base_income || isReadOnly) {
      // Added isReadOnly check
      return
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, autoSave, isReadOnly]) // Added isReadOnly to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      console.log("[v0] Savings vs Spending - Starting form submission...")
      console.log("[v0] Savings vs Spending - User ID:", userId)
      console.log("[v0] Savings vs Spending - Read-only mode:", isReadOnly)

      if (isReadOnly) {
        console.error("[v0] Savings vs Spending - Cannot save in read-only mode!")
        alert("Cannot save in read-only mode")
        return
      }

      const supabase = createBrowserClient()

      console.log("[v0] Savings vs Spending - Supabase client created")

      const loansData = {
        vehicle: {
          enabled: formData.has_vehicle_loan,
          amount: formData.vehicle_loan_amount === "" ? null : Number(formData.vehicle_loan_amount),
          apr: formData.vehicle_loan_apr === "" ? null : Number(formData.vehicle_loan_apr),
          payment: formData.vehicle_loan_payment === "" ? null : Number(formData.vehicle_loan_payment),
        },
        credit_card: {
          enabled: formData.has_credit_card_loan,
          amount: formData.credit_card_loan_amount === "" ? null : Number(formData.credit_card_loan_amount),
          apr: formData.credit_card_loan_apr === "" ? null : Number(formData.credit_card_loan_apr),
          payment: formData.credit_card_loan_payment === "" ? null : Number(formData.credit_card_loan_payment),
        },
        personal: {
          enabled: formData.has_personal_loan,
          amount: formData.personal_loan_amount === "" ? null : Number(formData.personal_loan_amount),
          apr: formData.personal_loan_apr === "" ? null : Number(formData.personal_loan_apr),
          payment: formData.personal_loan_payment === "" ? null : Number(formData.personal_loan_payment),
        },
        education: {
          enabled: formData.has_education_loan,
          amount: formData.education_loan_amount === "" ? null : Number(formData.education_loan_amount),
          apr: formData.education_loan_apr === "" ? null : Number(formData.education_loan_apr),
          payment: formData.education_loan_payment === "" ? null : Number(formData.education_loan_payment),
        },
        other: {
          enabled: formData.has_other_loan,
          amount: formData.other_loan_amount === "" ? null : Number(formData.other_loan_amount),
          apr: formData.other_loan_apr === "" ? null : Number(formData.other_loan_apr),
          payment: formData.other_loan_payment === "" ? null : Number(formData.other_loan_payment),
        },
      }

      console.log("[v0] SECTION 4 - Savings vs Spending Form Data Before Submission:", {
        userId: userId,
        monthlyBaseIncome: formData.monthly_base_income,
        federalTax: formData.federal_tax,
        stateTax: formData.state_tax,
        ficaMedicare: formData.fica_medicare,
        preTax401k: formData.pre_tax_401k,
        preTaxHSA: formData.pre_tax_hsa,
        espp: formData.espp, // Include ESPP in log
        // Include RSU in log
        monthlyRSU: formData.monthly_rsu,
        netMonthlyIncome: formData.net_monthly_income,
        monthlyEmergencyFund: formData.monthly_emergency_fund, // Include Emergency Fund in log
        totalHousing: formData.total_housing,
        totalRetirementSavings: formData.total_retirement_savings,
        totalLifestyle: formData.total_lifestyle,
        totalShortTerm: formData.total_short_term,
        loans: loansData,
        loansEnabled: {
          vehicle: loansData.vehicle.enabled,
          creditCard: loansData.credit_card.enabled,
          personal: loansData.personal.enabled,
          education: loansData.education.enabled,
          other: loansData.other.enabled,
        },
      })

      const dataToSave = {
        user_id: userId,
        annual_gross_income: formData.monthly_base_income === "" ? null : Number(formData.monthly_base_income) * 12,
        federal_tax: formData.federal_tax === "" ? null : Number(formData.federal_tax),
        state_tax: formData.state_tax === "" ? null : Number(formData.state_tax),
        fica_medicare: formData.fica_medicare === "" ? null : Number(formData.fica_medicare),
        pre_tax_401k: formData.pre_tax_401k === "" ? null : Number(formData.pre_tax_401k),
        pre_tax_hsa: formData.pre_tax_hsa === "" ? null : Number(formData.pre_tax_hsa),
        espp: formData.espp === "" ? null : Number(formData.espp), // Save ESPP
        monthly_rsu: formData.monthly_rsu === "" ? null : Number(formData.monthly_rsu),
        net_monthly_income: formData.net_monthly_income === "" ? null : Number(formData.net_monthly_income),
        monthly_emergency_fund: formData.monthly_emergency_fund === "" ? null : Number(formData.monthly_emergency_fund), // Save Emergency Fund
        total_housing: formData.total_housing === "" ? null : Number(formData.total_housing),
        total_retirement_savings:
          formData.total_retirement_savings === "" ? null : Number(formData.total_retirement_savings),
        total_lifestyle: formData.total_lifestyle === "" ? null : Number(formData.total_lifestyle),
        total_short_term: formData.total_short_term === "" ? null : Number(formData.total_short_term),
        loans: loansData,
        completed: true,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Savings vs Spending data:", dataToSave)
      console.log("[v0] Savings vs Spending - Attempting upsert...")
      console.log("[v0] Savings vs Spending - clientId:", clientId, "userId:", userId)

      // If clientId is provided (advisor/CEO editing), use API to bypass RLS
      if (clientId) {
        console.log("[v0] Savings vs Spending - Using API route for advisor/CEO save")
        const response = await fetch("/api/forms/save-savings-vs-spending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, data: dataToSave }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[v0] API error:", errorData)
          throw new Error(errorData.error || "Failed to save data")
        }
      } else {
        // Client saving their own data - use direct Supabase
        const { error } = await supabase.from("savings_vs_spending").upsert(dataToSave, { onConflict: "user_id" })

        if (error) {
          console.error("[v0] Database error:", error)
          console.error("[v0] Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
          })
          console.error("[v0] Savings vs Spending - FAILED to save to database")
          throw error
        }
      }

      console.log("[v0] SECTION 4 - Savings vs Spending saved successfully!", {
        userId: userId,
        completed: true,
        timestamp: new Date().toISOString(),
      })
      console.log("[v0] Save successful, redirecting to Final Report")
      console.log("[v0] Savings vs Spending - Navigation URL: /final-report")
      router.push("/final-report")
    } catch (error) {
      console.error("[v0] Error saving savings vs spending data:", error)
      console.error("[v0] Savings vs Spending - Exception during save:", error)
      alert("Error saving data. Please try again.")
    } finally {
      setIsSaving(false)
      console.log("[v0] Savings vs Spending - Save process completed")
    }
  }

  // Calculate recommended amounts based on budget allocation
  const netIncome = Number(formData.net_monthly_income || 0)
  const recommendedHousing = netIncome * 0.3
  const recommendedRetirement = netIncome * 0.2
  const recommendedLifestyle = netIncome * 0.3
  const recommendedShortTerm = netIncome * 0.2

  const actualHousing = Number(formData.total_housing || 0)
  const actualRetirement = Number(formData.total_retirement_savings || 0)
  const actualLifestyle = Number(formData.total_lifestyle || 0)
  const actualShortTerm = Number(formData.total_short_term || 0)

  const totalLoanPayments =
    Number(formData.vehicle_loan_payment || 0) +
    Number(formData.credit_card_loan_payment || 0) +
    Number(formData.personal_loan_payment || 0) +
    Number(formData.education_loan_payment || 0) +
    Number(formData.other_loan_payment || 0)

  const getStatus = (actual: number, recommended: number) => {
    if (recommended === 0) return { label: "Not Set", color: "text-gray-500" }
    const diff = Math.abs(actual - recommended)
    const percentDiff = (diff / recommended) * 100
    if (percentDiff <= 5) return { label: "On Track", color: "text-green-600" }
    if (percentDiff <= 15) return { label: "Slightly Off", color: "text-yellow-600" }
    return { label: "Needs Attention", color: "text-red-600" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      {!isReadOnly && (
        <div className="w-full max-w-xl mx-auto mb-6">
          <FormHelpPanel content={savingsVsSpendingHelp} />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack} // Use handleBack for unified navigation
            className="border-emerald-600/30 hover:bg-emerald-950/20 bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {autoSaveStatus !== "idle" && (
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === "saving" && (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-600">Saving...</span>
                </>
              )}
              {autoSaveStatus === "saved" && (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Saved</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Section 4: Savings vs Spending</h1>
          <p className="text-slate-600 mt-1">Analyze your budget and spending patterns</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Monthly Income Calculation */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                Monthly Income Calculation
              </CardTitle>
              <CardDescription className="text-blue-100">Calculate your net monthly take-home income</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Monthly Base Income of your Family</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.monthly_base_income}
                  onChange={(e) => handleInputChange("monthly_base_income", e.target.value)} // Use handleInputChange
                  placeholder="0"
                  readOnly={isReadOnly} // Readonly handled here
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pre-tax 401k Contribution (Monthly)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.pre_tax_401k}
                    onChange={(e) => handleInputChange("pre_tax_401k", e.target.value)} // Use handleInputChange
                    placeholder="0"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                </div>
                <div>
                  <Label>Pre-tax HSA Contribution (Monthly)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.pre_tax_hsa}
                    onChange={(e) => handleInputChange("pre_tax_hsa", e.target.value)} // Use handleInputChange
                    placeholder="0"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                </div>
              </div>

              <div>
                <Label>ESPP (Employee Stock Purchase Plan) - Monthly</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.espp}
                  onChange={(e) => handleInputChange("espp", e.target.value)} // Use handleInputChange
                  placeholder="0"
                  readOnly={isReadOnly} // Readonly handled here
                />
                <p className="text-xs text-slate-600 mt-1">Employee stock purchase plan contributions</p>
              </div>

              <div>
                <Label>RSU (Restricted Stock Units) - Monthly Vesting Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.monthly_rsu}
                  onChange={(e) => handleInputChange("monthly_rsu", e.target.value)} // Use handleInputChange
                  placeholder="0"
                  readOnly={isReadOnly} // Readonly handled here
                />
                <p className="text-xs text-slate-600 mt-1">Monthly RSU vesting value (pre-tax)</p>
              </div>

              {formData.monthly_base_income && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between font-bold text-blue-900 text-lg">
                    <span>Net Monthly Income:</span>
                    <span>${Number(formData.net_monthly_income).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardTitle>Budget Plan</CardTitle>
              <CardDescription className="text-indigo-100">Tell us about your budgeting approach</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Label className="text-base font-semibold mb-4 block">Do you follow any Budget plan?</Label>
              <RadioGroup
                value={formData.follows_budget_plan}
                onValueChange={(value) => handleInputChange("follows_budget_plan", value)} // Use handleInputChange
                className="flex gap-6"
                disabled={isReadOnly} // Disabled handled here
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="budget-yes" />
                  <Label htmlFor="budget-yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="budget-no" />
                  <Label htmlFor="budget-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>

              {/* Added Emergency Funds field */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <Label htmlFor="emergency-fund" className="text-base font-semibold text-indigo-900 mb-2 block">
                  How much Emergency funds have you maintained?
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="emergency-fund"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.monthly_emergency_fund || ""}
                    onChange={(e) => handleInputChange("monthly_emergency_fund", e.target.value)} // Use handleInputChange
                    placeholder="0"
                    className="pl-7"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                  Recommended: 3-6 months of expenses (${Math.round((netIncome || 0) * 3).toLocaleString()} - $
                  {Math.round((netIncome || 0) * 6).toLocaleString()})
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                Budget Analysis
              </CardTitle>
              <CardDescription className="text-purple-100">
                Compare your spending to recommended allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-6">
                Enter your actual monthly spending in each category to compare with recommended allocation.
              </p>

              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-green-900">Real Estate / Housing</h3>
                    <span className="text-sm text-green-700">
                      Recommended (30%): ${Math.round(recommendedHousing).toLocaleString()}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.total_housing}
                    onChange={(e) => handleInputChange("total_housing", e.target.value)} // Use handleInputChange
                    placeholder={`Recommended: $${Math.round(recommendedHousing).toLocaleString()}`}
                    className="mb-2"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                  {actualHousing > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={getStatus(actualHousing, recommendedHousing).color}>
                        {getStatus(actualHousing, recommendedHousing).label}
                      </span>
                      <span className={actualHousing > recommendedHousing ? "text-red-600" : "text-green-600"}>
                        ${Math.abs(actualHousing - recommendedHousing).toLocaleString()}{" "}
                        {actualHousing > recommendedHousing ? "over" : "under"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Retirement Savings (20%) */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-blue-900">Retirement Savings</h3>
                    <span className="text-sm text-blue-700">
                      Recommended (20%): ${Math.round(recommendedRetirement).toLocaleString()}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.total_retirement_savings}
                    onChange={(e) => handleInputChange("total_retirement_savings", e.target.value)} // Use handleInputChange
                    placeholder={`Recommended: $${Math.round(recommendedRetirement).toLocaleString()}`}
                    className="mb-2"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                  {actualRetirement > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={getStatus(actualRetirement, recommendedRetirement).color}>
                        {getStatus(actualRetirement, recommendedRetirement).label}
                      </span>
                      <span className={actualRetirement < recommendedRetirement ? "text-red-600" : "text-green-600"}>
                        ${Math.abs(actualRetirement - recommendedRetirement).toLocaleString()}{" "}
                        {actualRetirement < recommendedRetirement ? "under" : "over"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Lifestyle (30%) */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-yellow-900">Lifestyle</h3>
                    <span className="text-sm text-yellow-700">
                      Recommended (30%): ${Math.round(recommendedLifestyle).toLocaleString()}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.total_lifestyle}
                    onChange={(e) => handleInputChange("total_lifestyle", e.target.value)} // Use handleInputChange
                    placeholder={`Recommended: $${Math.round(recommendedLifestyle).toLocaleString()}`}
                    className="mb-2"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                  {actualLifestyle > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={getStatus(actualLifestyle, recommendedLifestyle).color}>
                        {getStatus(actualLifestyle, recommendedLifestyle).label}
                      </span>
                      <span className={actualLifestyle > recommendedLifestyle ? "text-red-600" : "text-green-600"}>
                        ${Math.abs(actualLifestyle - recommendedLifestyle).toLocaleString()}{" "}
                        {actualLifestyle > recommendedLifestyle ? "over" : "under"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Short-term Savings (20%) */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-purple-900">Short-term Savings</h3>
                    <span className="text-sm text-purple-700">
                      Recommended (20%): ${Math.round(recommendedShortTerm).toLocaleString()}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.total_short_term}
                    onChange={(e) => handleInputChange("total_short_term", e.target.value)} // Use handleInputChange
                    placeholder={`Recommended: $${Math.round(recommendedShortTerm).toLocaleString()}`}
                    className="mb-2"
                    readOnly={isReadOnly} // Readonly handled here
                  />
                  {actualShortTerm > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={getStatus(actualShortTerm, recommendedShortTerm).color}>
                        {getStatus(actualShortTerm, recommendedShortTerm).label}
                      </span>
                      <span className={actualShortTerm < recommendedShortTerm ? "text-red-600" : "text-green-600"}>
                        ${Math.abs(actualShortTerm - recommendedShortTerm).toLocaleString()}{" "}
                        {actualShortTerm < recommendedShortTerm ? "under" : "over"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {(actualHousing > 0 || actualRetirement > 0 || actualLifestyle > 0 || actualShortTerm > 0) && (
                <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                  <div className="flex justify-between font-semibold text-slate-900 mb-2">
                    <span>Total Monthly Spending:</span>
                    <span>
                      ${(actualHousing + actualRetirement + actualLifestyle + actualShortTerm).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Net Monthly Income:</span>
                    <span>${netIncome.toLocaleString()}</span>
                  </div>
                  {totalLoanPayments > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Total Loan Payments:</span>
                      <span className="text-red-600">-${totalLoanPayments.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-slate-300">
                    <span>Monthly Surplus/Deficit:</span>
                    <span
                      className={
                        netIncome -
                          (actualHousing + actualRetirement + actualLifestyle + actualShortTerm + totalLoanPayments) >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      $
                      {Math.abs(
                        netIncome -
                          (actualHousing + actualRetirement + actualLifestyle + actualShortTerm + totalLoanPayments),
                      ).toLocaleString()}{" "}
                      {netIncome -
                        (actualHousing + actualRetirement + actualLifestyle + actualShortTerm + totalLoanPayments) >=
                      0
                        ? "surplus"
                        : "deficit"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loan Information section can remain conditional or always visible */}
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Loan Information
              </CardTitle>
              <CardDescription className="text-orange-100">Track your loans and monthly payments</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Vehicle Loan */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Vehicle Loan</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="vehicle-loan-toggle" className="text-sm text-slate-600">
                      {formData.has_vehicle_loan ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="vehicle-loan-toggle"
                      checked={formData.has_vehicle_loan}
                      onCheckedChange={(checked) => handleInputChange("has_vehicle_loan", checked)} // Use handleInputChange
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly} // Disabled handled here
                    />
                  </div>
                </div>

                {formData.has_vehicle_loan && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Total Loan Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.vehicle_loan_amount}
                        onChange={(e) => handleInputChange("vehicle_loan_amount", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>APR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.vehicle_loan_apr}
                        onChange={(e) => handleInputChange("vehicle_loan_apr", e.target.value)} // Use handleInputChange
                        placeholder="5.5"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.vehicle_loan_payment}
                        onChange={(e) => handleInputChange("vehicle_loan_payment", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Revolving Credit Card Loan */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Revolving Credit Card Loan</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="credit-card-toggle" className="text-sm text-slate-600">
                      {formData.has_credit_card_loan ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="credit-card-toggle"
                      checked={formData.has_credit_card_loan}
                      onCheckedChange={(checked) => handleInputChange("has_credit_card_loan", checked)} // Use handleInputChange
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly} // Disabled handled here
                    />
                  </div>
                </div>

                {formData.has_credit_card_loan && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Total Loan Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.credit_card_loan_amount}
                        onChange={(e) => handleInputChange("credit_card_loan_amount", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>APR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.credit_card_loan_apr}
                        onChange={(e) => handleInputChange("credit_card_loan_apr", e.target.value)} // Use handleInputChange
                        placeholder="18.99"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.credit_card_loan_payment}
                        onChange={(e) => handleInputChange("credit_card_loan_payment", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Loan */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Personal Loan</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="personal-loan-toggle" className="text-sm text-slate-600">
                      {formData.has_personal_loan ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="personal-loan-toggle"
                      checked={formData.has_personal_loan}
                      onCheckedChange={(checked) => handleInputChange("has_personal_loan", checked)} // Use handleInputChange
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly} // Disabled handled here
                    />
                  </div>
                </div>

                {formData.has_personal_loan && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Total Loan Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.personal_loan_amount}
                        onChange={(e) => handleInputChange("personal_loan_amount", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>APR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.personal_loan_apr}
                        onChange={(e) => handleInputChange("personal_loan_apr", e.target.value)} // Use handleInputChange
                        placeholder="9.5"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.personal_loan_payment}
                        onChange={(e) => handleInputChange("personal_loan_payment", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Education Loan */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Education Loan</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="education-loan-toggle" className="text-sm text-slate-600">
                      {formData.has_education_loan ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="education-loan-toggle"
                      checked={formData.has_education_loan}
                      onCheckedChange={(checked) => handleInputChange("has_education_loan", checked)} // Use handleInputChange
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly} // Disabled handled here
                    />
                  </div>
                </div>

                {formData.has_education_loan && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Total Loan Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.education_loan_amount}
                        onChange={(e) => handleInputChange("education_loan_amount", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>APR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.education_loan_apr}
                        onChange={(e) => handleInputChange("education_loan_apr", e.target.value)} // Use handleInputChange
                        placeholder="6.8"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.education_loan_payment}
                        onChange={(e) => handleInputChange("education_loan_payment", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Loan */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Other Loan</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="other-loan-toggle" className="text-sm text-slate-600">
                      {formData.has_other_loan ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id="other-loan-toggle"
                      checked={formData.has_other_loan}
                      onCheckedChange={(checked) => handleInputChange("has_other_loan", checked)} // Use handleInputChange
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly} // Disabled handled here
                    />
                  </div>
                </div>

                {formData.has_other_loan && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Total Loan Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.other_loan_amount}
                        onChange={(e) => handleInputChange("other_loan_amount", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>APR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.other_loan_apr}
                        onChange={(e) => handleInputChange("other_loan_apr", e.target.value)} // Use handleInputChange
                        placeholder="7.5"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.other_loan_payment}
                        onChange={(e) => handleInputChange("other_loan_payment", e.target.value)} // Use handleInputChange
                        placeholder="0"
                        readOnly={isReadOnly} // Readonly handled here
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/defense-strategy/form")} // Keep the original navigation for 'Previous Section' if returnUrl is not provided.
              disabled={isReadOnly}
            >
              Previous Section
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {isSaving ? "Saving..." : "Save & Continue"}
              </Button>
            )}
          </div>
        </form>
      </div>

      {!isReadOnly && <FormHelpPanel helpItems={savingsVsSpendingHelp} title="Savings & Spending Help" />}
    </div>
  )
}
