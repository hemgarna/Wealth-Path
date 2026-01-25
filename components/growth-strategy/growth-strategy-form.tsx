"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { TrendingUp, Building2, Landmark, Plus, Trash2, ArrowLeft } from "lucide-react"
import { FormHelpPanel } from "@/components/forms/form-help-panel"
import { growthStrategyHelp } from "@/lib/form-help-content"

// import { FormAssistant } from "@/components/forms/form-assistant"

interface Annuity {
  id: string
  type: "growth" | "lifetime"
  amount: number | string
  return_rate?: number | string
  provider: string
  guaranteed_income?: number | string
}

interface FormData {
  // 401k
  has_401k_self: boolean
  current_401k_value_self: string
  monthly_contribution_401k_self: string
  employer_match_self: string
  average_return_401k_self: string
  has_401k_spouse: boolean
  current_401k_value_spouse: string
  monthly_contribution_401k_spouse: string
  employer_match_spouse: string
  average_return_401k_spouse: string

  // IRA
  has_traditional_ira: boolean
  traditional_ira_value: string
  average_return_traditional_ira: string
  has_roth_ira: boolean
  roth_ira_value: string
  average_return_roth_ira: string

  // HSA
  has_hsa: boolean
  hsa_value: string
  average_return_hsa: string

  // Investments
  brokerage_total_value: string
  average_return_brokerage: string
  portfolio_avg_return_after_tax: string
  crowd_funding_value: string
  crowd_funding_return_rate: string
  private_equity_value: string
  private_equity_return_rate: string
  jewelry_value: string
  precious_metals_return_rate: string
  other_assets_value: string
  other_assets_description: string
  other_assets_return_rate: string

  // CHANGING: Adding annuity fields
  has_annuities: boolean
  annuities: Annuity[]

  // Social Security
  expected_ss_self: string
  expected_ss_spouse: string

  // Pensions
  has_pension_self: boolean
  pension_monthly_self: string
  has_pension_spouse: boolean
  pension_monthly_spouse: string

  // Real Estate
  primary_home_value: string
  primary_home_mortgage_balance: string
  primary_home_monthly_payment: string
  rental_property_value: string
  rental_property_positive_income: string
}

interface Props {
  initialData: any
  userId: string
  isReadOnly?: boolean // Added isReadOnly prop
  clientId?: string // Added clientId prop
  returnUrl?: string // Added returnUrl prop for proper back navigation
}

export default function GrowthStrategyForm({ initialData, userId, isReadOnly = false, clientId, returnUrl }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState<FormData>({
    has_401k_self: initialData?.has_401k_self || false,
    current_401k_value_self: initialData?.current_401k_balance_self ?? "",
    monthly_contribution_401k_self: initialData?.monthly_contribution_401k_self ?? "",
    employer_match_self: initialData?.company_match_percent_self ?? "", // Corrected from initialData?.employer_match_self
    average_return_401k_self: initialData?.average_return_401k_self ?? "",
    has_401k_spouse: initialData?.has_401k_spouse || false,
    current_401k_value_spouse: initialData?.current_401k_balance_spouse ?? "",
    monthly_contribution_401k_spouse: initialData?.monthly_contribution_401k_spouse ?? "",
    employer_match_spouse: initialData?.company_match_percent_spouse ?? "", // Corrected from initialData?.employer_match_spouse
    average_return_401k_spouse: initialData?.average_return_401k_spouse ?? "",
    has_traditional_ira: initialData?.has_traditional_ira_self || false,
    traditional_ira_value: initialData?.traditional_ira_balance_self ?? "",
    average_return_traditional_ira: initialData?.average_return_ira ?? "",
    has_roth_ira: initialData?.has_roth_self || false,
    roth_ira_value: initialData?.roth_balance_self ?? "",
    average_return_roth_ira: initialData?.average_return_roth_ira ?? "",
    has_hsa: initialData?.has_hsa_self || false,
    hsa_value: initialData?.hsa_balance_self ?? "",
    average_return_hsa: initialData?.average_return_hsa ?? "",
    brokerage_total_value: initialData?.brokerage_stocks ?? "",
    average_return_brokerage: initialData?.average_return_brokerage ?? "", // Added field
    portfolio_avg_return_after_tax: initialData?.portfolio_avg_return_after_tax ?? "",
    crowd_funding_value: initialData?.crowd_funding_value ?? "",
    crowd_funding_return_rate: initialData?.crowd_funding_return_rate ?? "",
    private_equity_value: initialData?.private_equity_value ?? "",
    private_equity_return_rate: initialData?.private_equity_return_rate ?? "",
    jewelry_value: initialData?.jewelry_value ?? "", // This will be renamed to precious_metals_value
    precious_metals_return_rate: initialData?.precious_metals_return_rate ?? "",
    other_assets_value: initialData?.other_assets_value ?? "",
    other_assets_description: initialData?.other_assets_description ?? "",
    other_assets_return_rate: initialData?.other_assets_return_rate ?? "",
    // CHANGED: Initialize annuity fields from database
    has_annuities: initialData?.has_annuities || false,
    annuities: initialData?.annuities || [],

    expected_ss_self: initialData?.ss_monthly_benefit_self ?? "",
    expected_ss_spouse: initialData?.ss_monthly_benefit_spouse ?? "",
    has_pension_self: initialData?.has_pension_self || false,
    pension_monthly_self: initialData?.pension_monthly_amount_self ?? "",
    has_pension_spouse: initialData?.has_pension_spouse || false,
    pension_monthly_spouse: initialData?.pension_monthly_amount_spouse ?? "",
    primary_home_value: initialData?.primary_home_value ?? "",
    primary_home_mortgage_balance: initialData?.primary_home_mortgage_balance ?? "",
    primary_home_monthly_payment: initialData?.primary_home_monthly_payment ?? "",
    rental_property_value: initialData?.rental_properties?.[0]?.value ?? "",
    rental_property_positive_income: initialData?.rental_properties?.[0]?.monthly_income ?? "",
  })

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

  const addAnnuity = (type: "growth" | "lifetime") => {
    const newAnnuity: Annuity = {
      id: Date.now().toString(),
      type,
      amount: "",
      provider: "",
      ...(type === "growth" ? { return_rate: "" } : { guaranteed_income: "" }),
    }
    setFormData({
      ...formData,
      annuities: [...formData.annuities, newAnnuity],
    })
  }

  const removeAnnuity = (id: string) => {
    setFormData({
      ...formData,
      annuities: formData.annuities.filter((a) => a.id !== id),
    })
  }

  const updateAnnuity = (id: string, field: keyof Annuity, value: any) => {
    setFormData({
      ...formData,
      annuities: formData.annuities.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    })
  }

  // Helper to handle generic input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const homeEquity =
    (Number.parseFloat(formData.primary_home_value) || 0) -
    (Number.parseFloat(formData.primary_home_mortgage_balance) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      console.log("[v0] SECTION 2 - Growth Strategy Form Data Before Submission:", {
        userId: userId,
        has401kSelf: formData.has_401k_self,
        current401kValueSelf: formData.current_401k_value_self,
        has401kSpouse: formData.has_401k_spouse,
        current401kValueSpouse: formData.current_401k_value_spouse,
        hasTraditionalIRA: formData.has_traditional_ira,
        traditionalIRAValue: formData.traditional_ira_value,
        hasRothIRA: formData.has_roth_ira,
        rothIRAValue: formData.roth_ira_value,
        hasHSA: formData.has_hsa,
        hsaValue: formData.hsa_value,
        brokerageTotalValue: formData.brokerage_total_value,
        primaryHomeValue: formData.primary_home_value,
        primaryHomeMortgageBalance: formData.primary_home_mortgage_balance,
        homeEquityCalculated: homeEquity,
        expectedSSSelf: formData.expected_ss_self,
        expectedSSSpouse: formData.expected_ss_spouse,
        hasPensionSelf: formData.has_pension_self,
        pensionMonthlySelf: formData.pension_monthly_self,
      })

      console.log("[v0] Saving growth strategy data:", formData)

      // CHANGED: Build annuities array for database - now just use the array directly
      const annuitiesData = formData.has_annuities
        ? formData.annuities.map((annuity) => ({
            type: annuity.type,
            amount: Number.parseFloat(annuity.amount as string) || 0,
            provider: annuity.provider || "",
            ...(annuity.type === "growth"
              ? { return_rate: Number.parseFloat(annuity.return_rate as string) || 0 }
              : { guaranteed_income: Number.parseFloat(annuity.guaranteed_income as string) || 0 }),
          }))
        : []

      const dataToSave = {
        user_id: userId,
        client_id: clientId,
        // 401k - Self
        has_401k_self: formData.has_401k_self,
        current_401k_balance_self: Number.parseFloat(formData.current_401k_value_self) || 0,
        monthly_contribution_401k_self: Number.parseFloat(formData.monthly_contribution_401k_self) || 0,
        company_match_percent_self: Number.parseFloat(formData.employer_match_self) || 0, // Fixed to match the initialData mapping and backend schema
        average_return_401k_self: Number.parseFloat(formData.average_return_401k_self) || 7.0,
        // 401k - Spouse
        has_401k_spouse: formData.has_401k_spouse,
        current_401k_balance_spouse: Number.parseFloat(formData.current_401k_value_spouse) || 0,
        monthly_contribution_401k_spouse: Number.parseFloat(formData.monthly_contribution_401k_spouse) || 0,
        company_match_percent_spouse: Number.parseFloat(formData.employer_match_spouse) || 0, // Fixed to match the initialData mapping and backend schema
        average_return_401k_spouse: Number.parseFloat(formData.average_return_401k_spouse) || 7.0,
        // Traditional IRA
        has_traditional_ira_self: formData.has_traditional_ira,
        traditional_ira_balance_self: Number.parseFloat(formData.traditional_ira_value) || 0,
        average_return_ira: Number.parseFloat(formData.average_return_traditional_ira) || 7.0,
        // Roth IRA
        has_roth_self: formData.has_roth_ira,
        roth_balance_self: Number.parseFloat(formData.roth_ira_value) || 0,
        average_return_roth_ira: Number.parseFloat(formData.average_return_roth_ira) || 7.0,
        // HSA
        has_hsa_self: formData.has_hsa,
        hsa_balance_self: Number.parseFloat(formData.hsa_value) || 0,
        average_return_hsa: Number.parseFloat(formData.average_return_hsa) || 7.0,
        // Social Security
        ss_monthly_benefit_self: Number.parseFloat(formData.expected_ss_self) || 0,
        ss_monthly_benefit_spouse: Number.parseFloat(formData.expected_ss_spouse) || 0,
        // Pensions
        has_pension_self: formData.has_pension_self,
        pension_monthly_amount_self: Number.parseFloat(formData.pension_monthly_self) || 0,
        has_pension_spouse: formData.has_pension_spouse,
        pension_monthly_amount_spouse: Number.parseFloat(formData.pension_monthly_spouse) || 0,
        // Brokerage - use individual stock columns
        has_brokerage_account: formData.brokerage_total_value
          ? Number.parseFloat(formData.brokerage_total_value) > 0
          : false,
        brokerage_stocks: Number.parseFloat(formData.brokerage_total_value) || 0,
        brokerage_mutual_funds: 0,
        brokerage_bonds: 0,
        brokerage_etfs: 0,
        // Real Estate - corrected column names
        owns_primary_home: formData.primary_home_value ? Number.parseFloat(formData.primary_home_value) > 0 : false,
        primary_home_value: Number.parseFloat(formData.primary_home_value) || 0,
        primary_home_mortgage_balance: Number.parseFloat(formData.primary_home_mortgage_balance) || 0,
        primary_home_monthly_payment: Number.parseFloat(formData.primary_home_monthly_payment) || 0,
        primary_home_equity: homeEquity,
        // Rental properties as JSONB array
        rental_properties:
          formData.rental_property_value || formData.rental_property_positive_income
            ? [
                {
                  value: Number.parseFloat(formData.rental_property_value) || 0,
                  monthly_income: Number.parseFloat(formData.rental_property_positive_income) || 0, // Changed from positive_monthly_income to monthly_income
                },
              ]
            : [],
        portfolio_avg_return_after_tax: Number.parseFloat(formData.portfolio_avg_return_after_tax) || null,
        crowd_funding_value: Number.parseFloat(formData.crowd_funding_value) || null,
        crowd_funding_return_rate: Number.parseFloat(formData.crowd_funding_return_rate) || null,
        private_equity_value: Number.parseFloat(formData.private_equity_value) || null,
        private_equity_return_rate: Number.parseFloat(formData.private_equity_return_rate) || null,
        jewelry_value: Number.parseFloat(formData.jewelry_value) || null, // Renamed to precious_metals_value in the UI, but still using jewelry_value here for backward compatibility if needed. Consider renaming in DB schema.
        precious_metals_return_rate: Number.parseFloat(formData.precious_metals_return_rate) || null,
        other_assets_value: Number.parseFloat(formData.other_assets_value) || null,
        other_assets_description: formData.other_assets_description || null,
        other_assets_return_rate: Number.parseFloat(formData.other_assets_return_rate) || null,
        // CHANGED: Remove Kids Education Savings from save data
        // CHANGED: Add annuities to data
        has_annuities: formData.has_annuities,
        annuities: annuitiesData,
        completed: true,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Data being sent to database:", dataToSave)

      const { error } = await createBrowserClient().from("growth_strategy").upsert(dataToSave, {
        onConflict: "user_id",
      })

      if (error) {
        console.error("[v0] Database error:", error)
        console.error("[v0] Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
        })
        throw error
      }

      console.log("[v0] SECTION 2 - Growth Strategy saved successfully!", {
        userId: userId,
        completed: true,
        timestamp: new Date().toISOString(),
      })

      router.push(returnUrl || "/defense-strategy/form")
    } catch (error) {
      console.error("[v0] Error saving:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (returnUrl) {
      router.push(returnUrl)
    } else {
      router.push("/home")
    }
  }

  const handleFinalSave = async () => {
    setSaving(true)
    try {
      // This logic is similar to handleSubmit but might be for a specific "Save & Continue" action
      // Reusing handleSubmit for now, assuming it covers the necessary data saving.
      // In a more complex scenario, this might call a different save function.
      await handleSubmit(new Event("submit") as any) // Simulate form submission event
    } catch (error) {
      console.error("[v0] Error during final save:", error)
    } finally {
      setSaving(false)
    }
  }

  const autoSave = useCallback(async () => {
    if (isReadOnly) {
      return
    }

    try {
      setAutoSaveStatus("saving")
      console.log("[v0] Auto-saving growth strategy data...")

      // CHANGED: Build annuities array for auto-save
      const annuitiesData = formData.has_annuities
        ? formData.annuities.map((annuity) => ({
            type: annuity.type,
            amount: Number.parseFloat(annuity.amount as string) || 0,
            provider: annuity.provider || "",
            ...(annuity.type === "growth"
              ? { return_rate: Number.parseFloat(annuity.return_rate as string) || 0 }
              : { guaranteed_income: Number.parseFloat(annuity.guaranteed_income as string) || 0 }),
          }))
        : []

      const dataToSave = {
        user_id: userId,
        has_401k_self: formData.has_401k_self,
        current_401k_balance_self: Number.parseFloat(formData.current_401k_value_self) || 0,
        monthly_contribution_401k_self: Number.parseFloat(formData.monthly_contribution_401k_self) || 0,
        company_match_percent_self: Number.parseFloat(formData.employer_match_self) || 0,
        average_return_401k_self: Number.parseFloat(formData.average_return_401k_self) || 7.0,
        has_401k_spouse: formData.has_401k_spouse,
        current_401k_balance_spouse: Number.parseFloat(formData.current_401k_value_spouse) || 0,
        monthly_contribution_401k_spouse: Number.parseFloat(formData.monthly_contribution_401k_spouse) || 0,
        company_match_percent_spouse: Number.parseFloat(formData.employer_match_spouse) || 0,
        average_return_401k_spouse: Number.parseFloat(formData.average_return_401k_spouse) || 7.0,
        has_traditional_ira_self: formData.has_traditional_ira,
        traditional_ira_balance_self: Number.parseFloat(formData.traditional_ira_value) || 0,
        has_roth_self: formData.has_roth_ira,
        roth_balance_self: Number.parseFloat(formData.roth_ira_value) || 0,
        has_hsa_self: formData.has_hsa,
        hsa_balance_self: Number.parseFloat(formData.hsa_value) || 0,
        ss_monthly_benefit_self: Number.parseFloat(formData.expected_ss_self) || 0,
        ss_monthly_benefit_spouse: Number.parseFloat(formData.expected_ss_spouse) || 0,
        has_pension_self: formData.has_pension_self,
        pension_monthly_amount_self: Number.parseFloat(formData.pension_monthly_self) || 0,
        has_pension_spouse: formData.has_pension_spouse,
        pension_monthly_amount_spouse: Number.parseFloat(formData.pension_monthly_spouse) || 0,
        has_brokerage_account: formData.brokerage_total_value
          ? Number.parseFloat(formData.brokerage_total_value) > 0
          : false,
        brokerage_stocks: Number.parseFloat(formData.brokerage_total_value) || 0,
        brokerage_mutual_funds: 0,
        brokerage_bonds: 0,
        brokerage_etfs: 0,
        owns_primary_home: formData.primary_home_value ? Number.parseFloat(formData.primary_home_value) > 0 : false,
        primary_home_value: Number.parseFloat(formData.primary_home_value) || 0,
        primary_home_mortgage_balance: Number.parseFloat(formData.primary_home_mortgage_balance) || 0,
        primary_home_monthly_payment: Number.parseFloat(formData.primary_home_monthly_payment) || 0,
        primary_home_equity: homeEquity,
        rental_properties:
          formData.rental_property_value || formData.rental_property_positive_income
            ? [
                {
                  value: Number.parseFloat(formData.rental_property_value) || 0,
                  monthly_income: Number.parseFloat(formData.rental_property_positive_income) || 0, // Changed from positive_monthly_income to monthly_income
                },
              ]
            : [],
        portfolio_avg_return_after_tax: Number.parseFloat(formData.portfolio_avg_return_after_tax) || null,
        crowd_funding_value: Number.parseFloat(formData.crowd_funding_value) || null,
        crowd_funding_return_rate: Number.parseFloat(formData.crowd_funding_return_rate) || null,
        private_equity_value: Number.parseFloat(formData.private_equity_value) || null,
        private_equity_return_rate: Number.parseFloat(formData.private_equity_return_rate) || null,
        jewelry_value: Number.parseFloat(formData.jewelry_value) || null, // Renamed to precious_metals_value in the UI, but still using jewelry_value here for backward compatibility if needed.
        precious_metals_return_rate: Number.parseFloat(formData.precious_metals_return_rate) || null,
        other_assets_value: Number.parseFloat(formData.other_assets_value) || null,
        other_assets_description: formData.other_assets_description || null,
        other_assets_return_rate: Number.parseFloat(formData.other_assets_return_rate) || null,
        // CHANGED: Removed Kids Education Savings from auto-save data
        // Update database with average_return_brokerage
        average_return_brokerage: Number.parseFloat(formData.average_return_brokerage) || 7.0,
        // CHANGED: Add annuities to auto-save data
        has_annuities: formData.has_annuities,
        annuities: annuitiesData,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Auto-saving growth strategy data:", dataToSave)

      const { error } = await createBrowserClient().from("growth_strategy").upsert(dataToSave, {
        onConflict: "user_id",
      })

      if (error) {
        console.error("[v0] Auto-save error:", error.message)
        setAutoSaveStatus("idle")
        return
      }

      console.log("[v0] Auto-save successful")
      setAutoSaveStatus("saved")
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("[v0] Auto-save error:", error)
      setAutoSaveStatus("idle")
    }
  }, [formData, userId, isReadOnly, homeEquity]) // Removed clientId from dependencies

  useEffect(() => {
    const totalRetirementAccounts =
      (Number.parseFloat(formData.current_401k_value_self) || 0) +
      (Number.parseFloat(formData.current_401k_value_spouse) || 0) +
      (Number.parseFloat(formData.traditional_ira_value) || 0) +
      (Number.parseFloat(formData.roth_ira_value) || 0) +
      (Number.parseFloat(formData.hsa_value) || 0)

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // The condition for auto-saving might need to be more robust.
    // For now, we'll trigger auto-save if there's any relevant data input.
    const hasRelevantData =
      Number.parseFloat(formData.current_401k_value_self) > 0 ||
      Number.parseFloat(formData.current_401k_value_spouse) > 0 ||
      Number.parseFloat(formData.traditional_ira_value) > 0 ||
      Number.parseFloat(formData.roth_ira_value) > 0 ||
      Number.parseFloat(formData.hsa_value) > 0 ||
      Number.parseFloat(formData.primary_home_value) > 0 ||
      Number.parseFloat(formData.brokerage_total_value) > 0 ||
      Number.parseFloat(formData.average_return_brokerage) > 0 || // Check for new field
      // Removed annuity checks from hasRelevantData
      false // CHANGED: Removed kids education savings check

    if (!hasRelevantData) {
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
  }, [formData, autoSave])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      {/* Use FormHelpPanel instead of FormAssistant */}
      {!isReadOnly && <FormHelpPanel helpContent={growthStrategyHelp} />}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Current Growth Strategy (Offensive)</h1>
          <p className="text-slate-600">Track your wealth-building assets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Retirement Accounts */}
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <div>
                  <CardTitle>Retirement Accounts</CardTitle>
                  <CardDescription className="text-emerald-100">401k, IRA, HSA accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* 401k - Self */}
              <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900">401k (Self)</h4>
                  <Switch
                    checked={formData.has_401k_self}
                    onCheckedChange={(v) => handleInputChange("has_401k_self", v)}
                    disabled={isReadOnly}
                  />
                </div>
                {formData.has_401k_self && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Current Balance</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.current_401k_value_self}
                        onChange={(e) => handleInputChange("current_401k_value_self", e.target.value)}
                        placeholder="0"
                        // Disable all inputs in read-only mode
                        disabled={!formData.has_401k_self || isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Monthly Contribution</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.monthly_contribution_401k_self}
                        onChange={(e) => handleInputChange("monthly_contribution_401k_self", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_self || isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Employer Match %</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.employer_match_self}
                        onChange={(e) => handleInputChange("employer_match_self", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_self || isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Avg Annual Return %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.average_return_401k_self}
                        onChange={(e) => handleInputChange("average_return_401k_self", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_self || isReadOnly}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 401k - Spouse */}
              <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900">401k (Spouse)</h4>
                  <Switch
                    checked={formData.has_401k_spouse}
                    onCheckedChange={(v) => handleInputChange("has_401k_spouse", v)}
                    disabled={isReadOnly}
                  />
                </div>
                {formData.has_401k_spouse && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Current Balance</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.current_401k_value_spouse}
                        onChange={(e) => handleInputChange("current_401k_value_spouse", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_spouse || isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Monthly Contribution</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.monthly_contribution_401k_spouse}
                        onChange={(e) => handleInputChange("monthly_contribution_401k_spouse", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_spouse || isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Employer Match %</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.employer_match_spouse}
                        onChange={(e) => handleInputChange("employer_match_spouse", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_spouse || isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Avg Annual Return %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.average_return_401k_spouse}
                        onChange={(e) => handleInputChange("average_return_401k_spouse", e.target.value)}
                        placeholder="0"
                        disabled={!formData.has_401k_spouse || isReadOnly}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* IRA & HSA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">Traditional IRA / Rolled-over 401k</h4>
                    <Switch
                      checked={formData.has_traditional_ira}
                      onCheckedChange={(v) => handleInputChange("has_traditional_ira", v)}
                      disabled={isReadOnly}
                    />
                  </div>
                  {formData.has_traditional_ira && (
                    <div className="space-y-3">
                      <div>
                        <Label>Current Balance</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.traditional_ira_value}
                          onChange={(e) => handleInputChange("traditional_ira_value", e.target.value)}
                          placeholder="0"
                          disabled={!formData.has_traditional_ira || isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Avg Annual Return %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.average_return_traditional_ira}
                          onChange={(e) => handleInputChange("average_return_traditional_ira", e.target.value)}
                          placeholder="0"
                          disabled={!formData.has_traditional_ira || isReadOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">Roth IRA</h4>
                    <Switch
                      checked={formData.has_roth_ira}
                      onCheckedChange={(v) => handleInputChange("has_roth_ira", v)}
                      disabled={isReadOnly}
                    />
                  </div>
                  {formData.has_roth_ira && (
                    <div className="space-y-3">
                      <div>
                        <Label>Current Balance</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.roth_ira_value}
                          onChange={(e) => handleInputChange("roth_ira_value", e.target.value)}
                          placeholder="0"
                          disabled={!formData.has_roth_ira || isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Avg Annual Return %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.average_return_roth_ira}
                          onChange={(e) => handleInputChange("average_return_roth_ira", e.target.value)}
                          placeholder="0"
                          disabled={!formData.has_roth_ira || isReadOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">HSA</h4>
                    <Switch
                      checked={formData.has_hsa}
                      onCheckedChange={(v) => handleInputChange("has_hsa", v)}
                      disabled={isReadOnly}
                    />
                  </div>
                  {formData.has_hsa && (
                    <div className="space-y-3">
                      <div>
                        <Label>Current Balance</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.hsa_value}
                          onChange={(e) => handleInputChange("hsa_value", e.target.value)}
                          placeholder="0"
                          disabled={!formData.has_hsa || isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Avg Annual Return %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.average_return_hsa}
                          onChange={(e) => handleInputChange("average_return_hsa", e.target.value)}
                          placeholder="0"
                          disabled={!formData.has_hsa || isReadOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Security & Pensions */}
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <div className="flex items-center gap-3">
                    <Landmark className="w-6 h-6" />
                    <div>
                      <CardTitle>Social Security & Pensions</CardTitle>
                      <CardDescription className="text-blue-100">Expected benefits</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Social Security (Self) - Monthly Expected at Age 67</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.expected_ss_self}
                        onChange={(e) => handleInputChange("expected_ss_self", e.target.value)}
                        placeholder="0"
                        disabled={isReadOnly}
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        <a
                          href="https://www.ssa.gov/myaccount/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          Check your Social Security benefits estimate →
                        </a>
                      </p>
                    </div>
                    <div>
                      <Label>Social Security (Spouse) - Monthly Expected at Age 67</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.expected_ss_spouse}
                        onChange={(e) => handleInputChange("expected_ss_spouse", e.target.value)}
                        placeholder="0"
                        disabled={isReadOnly}
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        <a
                          href="https://www.ssa.gov/myaccount/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          Check your Social Security benefits estimate →
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">Pension (Self)</h4>
                        <Switch
                          checked={formData.has_pension_self}
                          onCheckedChange={(v) => handleInputChange("has_pension_self", v)}
                          disabled={isReadOnly}
                        />
                      </div>
                      {formData.has_pension_self && (
                        <div>
                          <Label>Monthly Benefit</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.pension_monthly_self}
                            onChange={(e) => handleInputChange("pension_monthly_self", e.target.value)}
                            placeholder="0"
                            disabled={!formData.has_pension_self || isReadOnly}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">Pension (Spouse)</h4>
                        <Switch
                          checked={formData.has_pension_spouse}
                          onCheckedChange={(v) => handleInputChange("has_pension_spouse", v)}
                          disabled={isReadOnly}
                        />
                      </div>
                      {formData.has_pension_spouse && (
                        <div>
                          <Label>Monthly Benefit</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.pension_monthly_spouse}
                            onChange={(e) => handleInputChange("pension_monthly_spouse", e.target.value)}
                            placeholder="0"
                            disabled={!formData.has_pension_spouse || isReadOnly}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investments */}
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6" />
                    <div>
                      <CardTitle>Investment Accounts</CardTitle>
                      {/* Updated description */}
                      <CardDescription className="text-blue-100">
                        Brokerage, stocks, and alternative investments
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Removed portfolio overview section as it's redundant with individual fields */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Total Brokerage/Investment Account Value</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.brokerage_total_value}
                        onChange={(e) => handleInputChange("brokerage_total_value", e.target.value)}
                        placeholder="0"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label>Annual Avg Return After Tax (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.average_return_brokerage}
                        onChange={(e) => handleInputChange("average_return_brokerage", e.target.value)}
                        placeholder="7.5"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Alternative & Other Assets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Crowd Funding</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.crowd_funding_value}
                          onChange={(e) => handleInputChange("crowd_funding_value", e.target.value)}
                          placeholder="0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Crowd Funding Annual Avg Return After Tax (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.crowd_funding_return_rate}
                          onChange={(e) => handleInputChange("crowd_funding_return_rate", e.target.value)}
                          placeholder="8.0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Private Equity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.private_equity_value}
                          onChange={(e) => handleInputChange("private_equity_value", e.target.value)}
                          placeholder="0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Private Equity Annual Avg Return After Tax (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.private_equity_return_rate}
                          onChange={(e) => handleInputChange("private_equity_return_rate", e.target.value)}
                          placeholder="12.0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Precious Metals</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.jewelry_value} // This should ideally be formData.precious_metals_value if renamed in FormData
                          onChange={(e) => handleInputChange("jewelry_value", e.target.value)} // This should ideally be setFormData({ ...formData, precious_metals_value: e.target.value })
                          placeholder="0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Precious Metals Annual Avg Return After Tax (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.precious_metals_return_rate}
                          onChange={(e) => handleInputChange("precious_metals_return_rate", e.target.value)}
                          placeholder="3.0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Any Other</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.other_assets_value}
                          onChange={(e) => handleInputChange("other_assets_value", e.target.value)}
                          placeholder="0"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Other Assets Annual Avg Return After Tax (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.other_assets_return_rate}
                          onChange={(e) => handleInputChange("other_assets_return_rate", e.target.value)}
                          placeholder="5.0"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                    {formData.other_assets_value && Number.parseFloat(formData.other_assets_value) > 0 && (
                      <div className="mt-4">
                        <Label>Description of Other Assets</Label>
                        <Input
                          type="text"
                          value={formData.other_assets_description}
                          onChange={(e) => handleInputChange("other_assets_description", e.target.value)}
                          placeholder="e.g., Art collection, antiques, etc."
                          disabled={isReadOnly}
                        />
                      </div>
                    )}
                  </div>

                  {/* CHANGED: Adding Annuities Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">Annuities</h4>
                      <Switch
                        checked={formData.has_annuities}
                        onCheckedChange={(v) => handleInputChange("has_annuities", v)}
                        disabled={isReadOnly}
                      />
                    </div>

                    {formData.has_annuities && (
                      <div className="space-y-4">
                        {/* Growth Annuities Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-foreground">Growth Annuities</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addAnnuity("growth")}
                              disabled={isReadOnly}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Growth Annuity
                            </Button>
                          </div>

                          {formData.annuities
                            .filter((a) => a.type === "growth")
                            .map((annuity, index) => (
                              <div key={annuity.id} className="relative p-4 bg-blue-50 rounded-lg mb-3">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium">Growth Annuity {index + 1}</span>
                                  {!isReadOnly && formData.annuities.filter((a) => a.type === "growth").length > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeAnnuity(annuity.id)}
                                      disabled={isReadOnly}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label>Amount</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={annuity.amount}
                                      onChange={(e) => updateAnnuity(annuity.id, "amount", e.target.value)}
                                      placeholder="0"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                  <div>
                                    <Label>Rate of Return (%)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={annuity.return_rate}
                                      onChange={(e) => updateAnnuity(annuity.id, "return_rate", e.target.value)}
                                      placeholder="5.0"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                  <div>
                                    <Label>Provider</Label>
                                    <Input
                                      type="text"
                                      value={annuity.provider}
                                      onChange={(e) => updateAnnuity(annuity.id, "provider", e.target.value)}
                                      placeholder="Provider Name"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                          {formData.annuities.filter((a) => a.type === "growth").length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No growth annuities added</p>
                          )}
                        </div>

                        {/* Lifetime Income Annuities Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-foreground">Lifetime Income Annuities</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addAnnuity("lifetime")}
                              disabled={isReadOnly}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Lifetime Income Annuity
                            </Button>
                          </div>

                          {formData.annuities
                            .filter((a) => a.type === "lifetime")
                            .map((annuity, index) => (
                              <div key={annuity.id} className="relative p-4 bg-green-50 rounded-lg mb-3">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium">Lifetime Income Annuity {index + 1}</span>
                                  {!isReadOnly &&
                                    formData.annuities.filter((a) => a.type === "lifetime").length > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAnnuity(annuity.id)}
                                        disabled={isReadOnly}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label>Amount</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={annuity.amount}
                                      onChange={(e) => updateAnnuity(annuity.id, "amount", e.target.value)}
                                      placeholder="0"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                  <div>
                                    <Label>Guaranteed Annual Income</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={annuity.guaranteed_income}
                                      onChange={(e) => updateAnnuity(annuity.id, "guaranteed_income", e.target.value)}
                                      placeholder="0"
                                      disabled={isReadOnly}
                                    />
                                    <p className="text-xs text-slate-600 mt-1">From your retirement age till 90</p>
                                  </div>
                                  <div>
                                    <Label>Provider</Label>
                                    <Input
                                      type="text"
                                      value={annuity.provider}
                                      onChange={(e) => updateAnnuity(annuity.id, "provider", e.target.value)}
                                      placeholder="Provider Name"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                          {formData.annuities.filter((a) => a.type === "lifetime").length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No lifetime income annuities added</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Real Estate */}
              <Card className="border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6" />
                    <div>
                      <CardTitle>Real Estate</CardTitle>
                      <CardDescription className="text-green-100">Primary home and rental properties</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4">Primary Residence</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Current Market Value</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.primary_home_value}
                            onChange={(e) => handleInputChange("primary_home_value", e.target.value)}
                            placeholder="0"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Remaining Mortgage Balance</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.primary_home_mortgage_balance}
                            onChange={(e) => handleInputChange("primary_home_mortgage_balance", e.target.value)}
                            placeholder="0"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Monthly Payment (including escrow)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.primary_home_monthly_payment}
                            onChange={(e) => handleInputChange("primary_home_monthly_payment", e.target.value)}
                            placeholder="0"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-semibold text-green-700">Home Equity (Calculated)</div>
                        <div className="text-2xl font-bold text-green-900">${homeEquity.toLocaleString()}</div>
                        <div className="text-xs text-green-600 mt-1">
                          Market Value - Mortgage Balance = $
                          {Number.parseFloat(formData.primary_home_value || "0").toLocaleString()} - $
                          {Number.parseFloat(formData.primary_home_mortgage_balance || "0").toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4">Rental Properties</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Total Rental Property Value</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.rental_property_value}
                            onChange={(e) => handleInputChange("rental_property_value", e.target.value)}
                            placeholder="0"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Positive Monthly Rental Income</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.rental_property_positive_income}
                            onChange={(e) => handleInputChange("rental_property_positive_income", e.target.value)}
                            placeholder="0"
                            disabled={isReadOnly}
                          />
                          <p className="text-xs text-slate-600 mt-1">Net positive cash flow after all expenses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conditionally render submit button based on isReadOnly */}
              {!isReadOnly && (
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFinalSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {saving ? "Saving..." : "Save & Continue"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>

      {!isReadOnly && <FormHelpPanel helpItems={growthStrategyHelp} title="Growth Strategy Help" />}
    </div>
  )
}
