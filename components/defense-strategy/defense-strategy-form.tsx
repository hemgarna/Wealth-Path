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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Heart, FileText, Users, Plus, Trash2, ExternalLink, ArrowLeft } from "lucide-react"
import { FormHelpPanel } from "@/components/forms/form-help-panel"
import { defenseStrategyHelp } from "@/lib/form-help-content"

interface LifeInsurancePolicy {
  id: string
  person: "self" | "spouse" | "child"
  child_name?: string
  coverage_amount: number | string
  policy_type: string
  provider: string
  premium_annual: number | string
  start_year: number | string
  expiration_year?: number | string
  is_cash_value: boolean
  cash_value: number | string
  expected_income_stream?: number | string
  covers_critical_illness?: boolean
  covers_chronic_illness?: boolean
  covers_terminal_illness?: boolean
  covers_critical_injury?: boolean
  covers_alzheimers?: boolean
}

interface FormData {
  // Work Life Insurance
  has_work_life_self: boolean
  work_life_coverage_self: number | string
  work_life_monthly_premium_self: number | string
  work_life_employer_paid_self: boolean
  has_work_life_spouse: boolean
  work_life_coverage_spouse: number | string
  work_life_monthly_premium_spouse: number | string
  work_life_employer_paid_spouse: boolean

  life_insurance_policies: LifeInsurancePolicy[]

  // Disability Insurance
  has_disability_insurance_self: boolean
  disability_coverage_monthly_self: number | string
  has_disability_insurance_spouse: boolean
  disability_coverage_monthly_spouse: number | string

  // Long-term Care Insurance
  has_ltc_insurance_self: boolean
  ltc_monthly_benefit_self: number | string
  has_ltc_insurance_spouse: boolean
  ltc_monthly_benefit_spouse: number | string

  // Umbrella Insurance
  has_umbrella_insurance: boolean
  umbrella_coverage: number | string
  umbrella_monthly_premium?: number | string // Added
  umbrella_annual_premium?: number | string // Added based on update

  // Mortgage Protection
  has_mortgage_protection: boolean
  mortgage_protection_coverage: number | string
  mortgage_protection_monthly_premium?: number | string // Added

  // Estate Planning
  trust_fully_funded: boolean
  guardian_name: string // Removed based on update

  has_foreign_assets: boolean
  foreign_countries: string
  foreign_permanent_assets: number | string
  foreign_liquid_assets: number | string
  exceeds_fbar_threshold: boolean
  fbar_filed_this_year: boolean
}

interface Props {
  userId: string
  initialData: any
  isReadOnly?: boolean // Adding isReadOnly prop to Props interface
  clientId?: string // Added clientId prop
  returnUrl?: string // Added returnUrl prop for proper back navigation
}

export default function DefenseStrategyForm({ userId, initialData, isReadOnly = false, clientId, returnUrl }: Props) {
  // Adding isReadOnly prop to Props interface
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [childrenNames, setChildrenNames] = useState<string[]>([])

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

  useEffect(() => {
    const fetchChildrenNames = async () => {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase.from("financial_goals").select("children").eq("user_id", userId).single()

        if (!error && data?.children) {
          const names = data.children.map((child: any) => child.name).filter(Boolean)
          setChildrenNames(names)
        }
      } catch (err) {
        console.error("[v0] Error fetching children names:", err)
      }
    }

    fetchChildrenNames()
  }, [userId])

  const [formData, setFormData] = useState<FormData>({
    // Work Life Insurance
    has_work_life_self: initialData?.has_work_life_self || false,
    work_life_coverage_self: initialData?.work_life_coverage_self ?? "",
    work_life_monthly_premium_self: initialData?.work_life_monthly_premium_self ?? "",
    work_life_employer_paid_self: initialData?.work_life_employer_paid_self || false,
    has_work_life_spouse: initialData?.has_work_life_spouse || false,
    work_life_coverage_spouse: initialData?.work_life_coverage_spouse ?? "",
    work_life_monthly_premium_spouse: initialData?.work_life_monthly_premium_spouse ?? "",
    work_life_employer_paid_spouse: initialData?.work_life_employer_paid_spouse || false,

    life_insurance_policies: initialData?.children_life_insurance || [],

    // Disability Insurance
    // Disability Insurance - DB uses has_work_disability_self and work_disability_monthly_benefit_self
    has_disability_insurance_self: initialData?.has_work_disability_self || false,
    disability_coverage_monthly_self: initialData?.work_disability_monthly_benefit_self ?? "",
    has_disability_insurance_spouse: initialData?.has_work_disability_spouse || false,
    disability_coverage_monthly_spouse: initialData?.work_disability_monthly_benefit_spouse ?? "",

    // Long-term Care Insurance
    // Long-term Care Insurance - DB uses has_ltc_self and ltc_monthly_benefit_self
    has_ltc_insurance_self: initialData?.has_ltc_self || false,
    ltc_monthly_benefit_self: initialData?.ltc_monthly_benefit_self ?? "",
    has_ltc_insurance_spouse: initialData?.has_ltc_spouse || false,
    ltc_monthly_benefit_spouse: initialData?.ltc_monthly_benefit_spouse ?? "",

    // Umbrella Insurance
    // Umbrella Insurance - DB uses has_umbrella and umbrella_annual_premium
    has_umbrella_insurance: initialData?.has_umbrella || false,
    umbrella_coverage: initialData?.umbrella_coverage ?? "",
    // Convert annual premium back to monthly for the form display
    umbrella_monthly_premium: initialData?.umbrella_annual_premium
      ? Number(initialData.umbrella_annual_premium) / 12
      : "",
    umbrella_annual_premium: initialData?.umbrella_annual_premium ?? "",

    // Mortgage Protection
    has_mortgage_protection: initialData?.has_mortgage_protection || false,
    mortgage_protection_coverage: initialData?.mortgage_protection_coverage ?? "",
    mortgage_protection_monthly_premium: initialData?.mortgage_protection_monthly_premium ?? "", // Added

    // Estate Planning
    trust_fully_funded: initialData?.trust_fully_funded || false,
    guardian_name: initialData?.guardian_name || "", // Kept based on initialData, but will be removed in save logic

    has_foreign_assets: initialData?.has_foreign_assets || false,
    foreign_countries: initialData?.foreign_countries || "",
    foreign_permanent_assets: initialData?.foreign_permanent_assets ?? "",
    foreign_liquid_assets: initialData?.foreign_liquid_assets ?? "",
    exceeds_fbar_threshold: initialData?.exceeds_fbar_threshold || false,
    fbar_filed_this_year: initialData?.fbar_filed_this_year || false,
  })

  const autoSave = useCallback(async () => {
    try {
      setAutoSaveStatus("saving")
      console.log("[v0] Auto-saving defense strategy data...")

      const dataToSave = {
        user_id: userId,
        has_work_life_self: formData.has_work_life_self,
        work_life_coverage_self: formData.work_life_coverage_self === "" ? 0 : Number(formData.work_life_coverage_self),
        work_life_monthly_premium_self:
          formData.work_life_monthly_premium_self === "" ? 0 : Number(formData.work_life_monthly_premium_self),
        work_life_employer_paid_self: formData.work_life_employer_paid_self,
        has_work_life_spouse: formData.has_work_life_spouse,
        work_life_coverage_spouse:
          formData.work_life_coverage_spouse === "" ? 0 : Number(formData.work_life_coverage_spouse),
        work_life_monthly_premium_spouse:
          formData.work_life_monthly_premium_spouse === "" ? 0 : Number(formData.work_life_monthly_premium_spouse),
        work_life_employer_paid_spouse: formData.work_life_employer_paid_spouse,
        // Use corrected field names for disability insurance
        has_work_disability_self: formData.has_disability_insurance_self,
        work_disability_monthly_benefit_self:
          formData.disability_coverage_monthly_self === "" ? 0 : Number(formData.disability_coverage_monthly_self),
        has_work_disability_spouse: formData.has_disability_insurance_spouse,
        work_disability_monthly_benefit_spouse:
          formData.disability_coverage_monthly_spouse === "" ? 0 : Number(formData.disability_coverage_monthly_spouse),
        // Use corrected field names for LTC insurance
        has_ltc_self: formData.has_ltc_insurance_self,
        ltc_monthly_benefit_self:
          formData.ltc_monthly_benefit_self === "" ? 0 : Number(formData.ltc_monthly_benefit_self),
        has_ltc_spouse: formData.has_ltc_insurance_spouse,
        ltc_monthly_benefit_spouse:
          formData.ltc_monthly_benefit_spouse === "" ? 0 : Number(formData.ltc_monthly_benefit_spouse),
        // Use corrected field names for umbrella insurance
        has_umbrella: formData.has_umbrella_insurance,
        umbrella_coverage: formData.umbrella_coverage === "" ? 0 : Number(formData.umbrella_coverage),
        umbrella_annual_premium:
          formData.umbrella_monthly_premium === "" ? 0 : Number(formData.umbrella_monthly_premium) * 12, // Updated for annual calculation
        has_mortgage_protection: formData.has_mortgage_protection,
        mortgage_protection_coverage:
          formData.mortgage_protection_coverage === "" ? 0 : Number(formData.mortgage_protection_coverage),
        mortgage_protection_monthly_premium:
          formData.mortgage_protection_monthly_premium === ""
            ? 0
            : Number(formData.mortgage_protection_monthly_premium), // Added
        trust_fully_funded: formData.trust_fully_funded,
        // guardian_name: formData.guardian_name || null, // Removed from autoSave
        has_foreign_assets: formData.has_foreign_assets, // Updated field name
        foreign_countries: formData.foreign_countries || null,
        foreign_permanent_assets:
          formData.foreign_permanent_assets === "" ? 0 : Number(formData.foreign_permanent_assets),
        foreign_liquid_assets: formData.foreign_liquid_assets === "" ? 0 : Number(formData.foreign_liquid_assets),
        exceeds_fbar_threshold: formData.exceeds_fbar_threshold,
        fbar_filed_this_year: formData.fbar_filed_this_year,
        children_life_insurance: formData.life_insurance_policies,
        completed: false,
      }

      const supabase = createBrowserClient()
      const { error } = await supabase.from("defense_strategy").upsert(dataToSave, {
        onConflict: "user_id",
      })

      if (error) {
        console.error("[v0] Auto-save error:", error)
        setAutoSaveStatus("idle")
      } else {
        console.log("[v0] Auto-save successful")
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus("idle"), 2000)
      }
    } catch (error) {
      console.error("[v0] Auto-save exception:", error)
      setAutoSaveStatus("idle")
    }
  }, [formData, userId])

  useEffect(() => {
    if (isReadOnly) {
      return
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Skip auto-save on initial mount
    if (
      !formData.work_life_coverage_self &&
      !formData.life_insurance_policies.length &&
      !formData.disability_coverage_monthly_self &&
      !formData.ltc_monthly_benefit_self
    ) {
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
  }, [formData, autoSave, isReadOnly])

  const addLifeInsurancePolicy = () => {
    const newPolicy: LifeInsurancePolicy = {
      id: Date.now().toString(),
      person: "self",
      coverage_amount: "",
      policy_type: "term",
      provider: "",
      premium_annual: "",
      start_year: "",
      expiration_year: "",
      is_cash_value: false,
      cash_value: "",
      expected_income_stream: "",
      // Added default values for new fields
      covers_critical_illness: false,
      covers_chronic_illness: false,
      covers_terminal_illness: false,
      covers_critical_injury: false,
      covers_alzheimers: false,
    }
    setFormData({
      ...formData,
      life_insurance_policies: [...formData.life_insurance_policies, newPolicy],
    })
  }

  const removeLifeInsurancePolicy = (id: string) => {
    setFormData({
      ...formData,
      life_insurance_policies: formData.life_insurance_policies.filter((p) => p.id !== id),
    })
  }

  const updateLifeInsurancePolicy = (id: string, field: keyof LifeInsurancePolicy, value: any) => {
    setFormData({
      ...formData,
      life_insurance_policies: formData.life_insurance_policies.map((p) =>
        p.id === id ? { ...p, [field]: value } : p,
      ),
    })
  }

  const handleBack = () => {
    if (returnUrl) {
      router.push(returnUrl)
    } else {
      router.push("/home")
    }
  }

  const handleFinalSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault() // Prevent default form submission
    }
    setSaving(true)

    try {
      console.log("[v0] SECTION 3 - Defense Strategy Form Data Before Submission:", {
        userId: userId,
        hasWorkLifeSelf: formData.has_work_life_self,
        workLifeCoverageSelf: formData.work_life_coverage_self,
        workLifeMonthlyPremiumSelf: formData.work_life_monthly_premium_self,
        hasWorkLifeSpouse: formData.has_work_life_spouse,
        workLifeCoverageSpouse: formData.work_life_coverage_spouse,
        workLifeMonthlyPremiumSpouse: formData.work_life_monthly_premium_spouse,
        lifeInsurancePoliciesCount: formData.life_insurance_policies?.length || 0,
        lifeInsurancePolicies: formData.life_insurance_policies,
        hasDisabilityInsuranceSelf: formData.has_disability_insurance_self,
        disabilityCoverageMonthlySelf: formData.disability_coverage_monthly_self,
        hasLTCInsuranceSelf: formData.has_ltc_insurance_self,
        ltcMonthlyBenefitSelf: formData.ltc_monthly_benefit_self,
        hasUmbrellaInsurance: formData.has_umbrella_insurance,
        umbrellaCoverage: formData.umbrella_coverage,
        umbrellaMonthlyPremium: formData.umbrella_monthly_premium,
        hasMortgageProtection: formData.has_mortgage_protection,
        mortgageProtectionCoverage: formData.mortgage_protection_coverage,
        mortgageProtectionMonthlyPremium: formData.mortgage_protection_monthly_premium,
        trustFullyFunded: formData.trust_fully_funded,
        hasForeignAssets: formData.has_foreign_assets,
        foreignPermanentAssets: formData.foreign_permanent_assets,
        foreignLiquidAssets: formData.foreign_liquid_assets,
        exceedsFBARThreshold: formData.exceeds_fbar_threshold,
        fbarFiledThisYear: formData.fbar_filed_this_year,
      })

      console.log("[v0] Defense Strategy - Starting final save...")
      console.log("[v0] Defense Strategy - User ID:", userId)
      console.log("[v0] Defense Strategy - Read-only mode:", isReadOnly)

      if (isReadOnly) {
        console.error("[v0] Defense Strategy - Cannot save in read-only mode!")
        alert("Cannot save in read-only mode")
        return
      }

      console.log("[v0] Saving defense strategy data:", formData)

      const supabase = createBrowserClient()

      console.log("[v0] Defense Strategy - Supabase client created")

      const dataToSave = {
        user_id: userId,
        // Work Life Insurance
        has_work_life_self: formData.has_work_life_self,
        work_life_coverage_self: formData.work_life_coverage_self === "" ? 0 : Number(formData.work_life_coverage_self),
        work_life_monthly_premium_self:
          formData.work_life_monthly_premium_self === "" ? 0 : Number(formData.work_life_monthly_premium_self),
        work_life_employer_paid_self: formData.work_life_employer_paid_self,
        has_work_life_spouse: formData.has_work_life_spouse,
        work_life_coverage_spouse:
          formData.work_life_coverage_spouse === "" ? 0 : Number(formData.work_life_coverage_spouse),
        work_life_monthly_premium_spouse:
          formData.work_life_monthly_premium_spouse === "" ? 0 : Number(formData.work_life_monthly_premium_spouse),
        work_life_employer_paid_spouse: formData.work_life_employer_paid_spouse,

        // Disability Insurance
        // Use corrected field names for disability insurance
        has_work_disability_self: formData.has_disability_insurance_self,
        work_disability_monthly_benefit_self:
          formData.disability_coverage_monthly_self === "" ? 0 : Number(formData.disability_coverage_monthly_self),
        has_work_disability_spouse: formData.has_disability_insurance_spouse,
        work_disability_monthly_benefit_spouse:
          formData.disability_coverage_monthly_spouse === "" ? 0 : Number(formData.disability_coverage_monthly_spouse),

        // Long-Term Care
        // Use corrected field names for LTC insurance
        has_ltc_self: formData.has_ltc_insurance_self,
        ltc_monthly_benefit_self:
          formData.ltc_monthly_benefit_self === "" ? 0 : Number(formData.ltc_monthly_benefit_self),
        has_ltc_spouse: formData.has_ltc_insurance_spouse,
        ltc_monthly_benefit_spouse:
          formData.ltc_monthly_benefit_spouse === "" ? 0 : Number(formData.ltc_monthly_benefit_spouse),

        // Umbrella Insurance
        // Use corrected field names for umbrella insurance
        has_umbrella: formData.has_umbrella_insurance,
        umbrella_coverage: formData.umbrella_coverage === "" ? 0 : Number(formData.umbrella_coverage),
        // Fixed field name from umbrella_monthly_premium to umbrella_annual_premium and multiplied by 12
        umbrella_annual_premium:
          formData.umbrella_monthly_premium === "" ? 0 : Number(formData.umbrella_monthly_premium) * 12,

        // Mortgage Protection
        has_mortgage_protection: formData.has_mortgage_protection,
        mortgage_protection_coverage:
          formData.mortgage_protection_coverage === "" ? 0 : Number(formData.mortgage_protection_coverage),
        mortgage_protection_monthly_premium:
          formData.mortgage_protection_monthly_premium === ""
            ? 0
            : Number(formData.mortgage_protection_monthly_premium), // Added

        // Estate Planning
        trust_fully_funded: formData.trust_fully_funded,
        // guardian_name: formData.guardian_name || null, // Removed per update

        // Foreign Assets
        has_foreign_assets: formData.has_foreign_assets, // Updated field name
        foreign_countries: formData.foreign_countries || null,
        foreign_permanent_assets:
          formData.foreign_permanent_assets === "" ? 0 : Number(formData.foreign_permanent_assets),
        foreign_liquid_assets: formData.foreign_liquid_assets === "" ? 0 : Number(formData.foreign_liquid_assets),
        exceeds_fbar_threshold: formData.exceeds_fbar_threshold,
        fbar_filed_this_year: formData.fbar_filed_this_year,

        children_life_insurance: formData.life_insurance_policies,

        completed: true,
      }

      console.log("[v0] Defense Strategy - Data to save:", dataToSave)
      console.log("[v0] Defense Strategy - Attempting upsert...")

      const { error } = await supabase.from("defense_strategy").upsert(dataToSave, {
        onConflict: "user_id",
      })

      if (error) {
        console.error("[v0] Save error:", error)
        // Added detailed error logging
        console.error("[v0] Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
        })
        console.error("[v0] Defense Strategy - FAILED to save to database")
        alert("Error saving data. Please try again.")
      } else {
        console.log("[v0] SECTION 3 - Defense Strategy saved successfully!", {
          userId: userId,
          completed: true,
          timestamp: new Date().toISOString(),
        })
        console.log("[v0] Save successful, redirecting to Savings vs Spending")
        console.log("[v0] Defense Strategy - Navigation URL:", returnUrl || "/savings-vs-spending/form")
        router.push(returnUrl || "/savings-vs-spending/form") // Use returnUrl for navigation
      }
    } catch (error) {
      console.error("[v0] Save exception:", error)
      console.error("[v0] Defense Strategy - Exception during save:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setSaving(false)
      console.log("[v0] Defense Strategy - Save process completed")
    }
  }

  const handleInputChange = useCallback(<T extends keyof FormData>(field: T, value: FormData[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleLifeInsurancePolicyChange = useCallback((id: string, field: keyof LifeInsurancePolicy, value: any) => {
    setFormData((prev) => ({
      ...prev,
      life_insurance_policies: prev.life_insurance_policies.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }))
  }, [])

  const addPolicy = useCallback((person: "self" | "spouse" | "child") => {
    const newPolicy: LifeInsurancePolicy = {
      id: Date.now().toString(),
      person,
      coverage_amount: "",
      policy_type: "term",
      provider: "",
      premium_annual: "",
      start_year: "",
      expiration_year: "",
      is_cash_value: false,
      cash_value: "",
      expected_income_stream: "",
      covers_critical_illness: false,
      covers_chronic_illness: false,
      covers_terminal_illness: false,
      covers_critical_injury: false,
      covers_alzheimers: false,
    }
    setFormData((prev) => ({
      ...prev,
      life_insurance_policies: [...prev.life_insurance_policies, newPolicy],
    }))
  }, [])

  const removePolicy = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      life_insurance_policies: prev.life_insurance_policies.filter((p) => p.id !== id),
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      {/* Removed FormAssistant import as the feature has been removed */}

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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Defensive Strategy</h1>
          <p className="text-slate-600">Protecting what matters most</p>
        </div>

        <form onSubmit={handleFinalSave} className="space-y-8">
          {/* Work Life Insurance */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <CardTitle>Work Life Insurance</CardTitle>
                  <CardDescription className="text-blue-100">Employer-provided life insurance coverage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Self */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Self</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={formData.has_work_life_self}
                      onCheckedChange={(checked) => handleInputChange("has_work_life_self", checked)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                    <Label className="font-medium">Has Work Life Insurance</Label>
                  </div>
                  {formData.has_work_life_self && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Coverage Amount ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.work_life_coverage_self ?? ""}
                          onChange={(e) => handleInputChange("work_life_coverage_self", e.target.value)}
                          placeholder="100,000"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Monthly Premium ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.work_life_monthly_premium_self ?? ""}
                          onChange={(e) => handleInputChange("work_life_monthly_premium_self", e.target.value)}
                          placeholder="0"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Switch
                          checked={formData.work_life_employer_paid_self}
                          onCheckedChange={(checked) => handleInputChange("work_life_employer_paid_self", checked)}
                          className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                          disabled={isReadOnly}
                        />
                        <Label>Employer Paid</Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spouse */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Spouse</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={formData.has_work_life_spouse}
                      onCheckedChange={(checked) => handleInputChange("has_work_life_spouse", checked)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                    <Label className="font-medium">Has Work Life Insurance</Label>
                  </div>
                  {formData.has_work_life_spouse && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Coverage Amount ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.work_life_coverage_spouse ?? ""}
                          onChange={(e) => handleInputChange("work_life_coverage_spouse", e.target.value)}
                          placeholder="100,000"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Monthly Premium ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formData.work_life_monthly_premium_spouse ?? ""}
                          onChange={(e) => handleInputChange("work_life_monthly_premium_spouse", e.target.value)}
                          placeholder="0"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Switch
                          checked={formData.work_life_employer_paid_spouse}
                          onCheckedChange={(checked) => handleInputChange("work_life_employer_paid_spouse", checked)}
                          className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                          disabled={isReadOnly}
                        />
                        <Label>Employer Paid</Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <div>
                  <CardTitle>Personal Life Insurance</CardTitle>
                  <CardDescription className="text-purple-100">
                    Add one or more personal life insurance policies
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {formData.life_insurance_policies.map((policy, index) => (
                <div key={policy.id} className="p-4 bg-white rounded-lg border border-purple-200 relative">
                  {/* Remove button */}
                  {formData.life_insurance_policies.length > 0 && !isReadOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLifeInsurancePolicy(policy.id)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Policy #{index + 1}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Person */}
                    <div>
                      <Label>Insured Person</Label>
                      <Select
                        value={policy.person}
                        onValueChange={(v) =>
                          updateLifeInsurancePolicy(policy.id, "person", v as "self" | "spouse" | "child")
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {policy.person === "child" && (
                      <div>
                        <Label>Child Name</Label>
                        {childrenNames.length > 0 ? (
                          <Select
                            value={policy.child_name || ""}
                            onValueChange={(v) => updateLifeInsurancePolicy(policy.id, "child_name", v)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className="border-slate-300">
                              <SelectValue placeholder="Select child" />
                            </SelectTrigger>
                            <SelectContent>
                              {childrenNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="text"
                            value={policy.child_name || ""}
                            onChange={(e) => updateLifeInsurancePolicy(policy.id, "child_name", e.target.value)}
                            placeholder="Enter child name"
                            className="border-slate-300"
                            readOnly={isReadOnly}
                          />
                        )}
                      </div>
                    )}

                    {/* Coverage Amount */}
                    <div>
                      <Label>Coverage Amount ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={policy.coverage_amount ?? ""}
                        onChange={(e) => updateLifeInsurancePolicy(policy.id, "coverage_amount", e.target.value)}
                        placeholder="500,000"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>

                    {/* Policy Type */}
                    <div>
                      <Label>Policy Type</Label>
                      <Select
                        value={policy.policy_type}
                        onValueChange={(v) => updateLifeInsurancePolicy(policy.id, "policy_type", v)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="term">Term Life</SelectItem>
                          <SelectItem value="whole">Whole Life</SelectItem>
                          <SelectItem value="universal">Universal Life</SelectItem>
                          <SelectItem value="variable_universal">Variable Universal Life</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Provider */}
                    <div>
                      <Label>Insurance Provider</Label>
                      <Input
                        type="text"
                        value={policy.provider}
                        onChange={(e) => updateLifeInsurancePolicy(policy.id, "provider", e.target.value)}
                        placeholder="Provider name"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>

                    {/* Annual Premium */}
                    <div>
                      <Label>Annual Premium ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={policy.premium_annual ?? ""}
                        onChange={(e) => updateLifeInsurancePolicy(policy.id, "premium_annual", e.target.value)}
                        placeholder="2,000"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>

                    {/* Start Year */}
                    <div>
                      <Label>Policy Start Year</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={policy.start_year ?? ""}
                        onChange={(e) => updateLifeInsurancePolicy(policy.id, "start_year", e.target.value)}
                        placeholder="2020"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>

                    {policy.policy_type === "term" && (
                      <div>
                        <Label>Policy Expiration Year</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={policy.expiration_year ?? ""}
                          onChange={(e) => updateLifeInsurancePolicy(policy.id, "expiration_year", e.target.value)}
                          placeholder="2050"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                      </div>
                    )}

                    {/* Has Cash Value */}
                    <div className="flex items-center gap-2 col-span-2">
                      <Switch
                        checked={policy.is_cash_value}
                        onCheckedChange={(checked) => updateLifeInsurancePolicy(policy.id, "is_cash_value", checked)}
                        className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                        disabled={isReadOnly}
                      />
                      <Label>Has Cash Value</Label>
                    </div>

                    {/* Cash Value */}
                    {policy.is_cash_value && (
                      <div className="col-span-2">
                        <Label>Current Cash Value ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={policy.cash_value ?? ""}
                          onChange={(e) => updateLifeInsurancePolicy(policy.id, "cash_value", e.target.value)}
                          placeholder="25,000"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                      </div>
                    )}

                    {policy.is_cash_value && (
                      <div className="col-span-2">
                        <Label>Expected Income Stream from Retirement Age till 90 (Annual)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={policy.expected_income_stream ?? ""}
                          onChange={(e) =>
                            updateLifeInsurancePolicy(policy.id, "expected_income_stream", e.target.value)
                          }
                          placeholder="12,000"
                          className="border-slate-300"
                          readOnly={isReadOnly}
                        />
                        <p className="text-xs text-blue-100 mt-1">
                          Annual income stream from retirement age till 90 (tax-free)
                        </p>
                      </div>
                    )}

                    <div className="col-span-2">
                      <Label className="text-base font-semibold mb-3 block">Additional Benefit Coverage</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.covers_critical_illness || false}
                            onCheckedChange={(checked) =>
                              updateLifeInsurancePolicy(policy.id, "covers_critical_illness", checked)
                            }
                            className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                            disabled={isReadOnly}
                          />
                          <Label>Critical Illness</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.covers_chronic_illness || false}
                            onCheckedChange={(checked) =>
                              updateLifeInsurancePolicy(policy.id, "covers_chronic_illness", checked)
                            }
                            className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                            disabled={isReadOnly}
                          />
                          <Label>Chronic Illness</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.covers_terminal_illness || false}
                            onCheckedChange={(checked) =>
                              updateLifeInsurancePolicy(policy.id, "covers_terminal_illness", checked)
                            }
                            className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                            disabled={isReadOnly}
                          />
                          <Label>Terminal Illness</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.covers_critical_injury || false}
                            onCheckedChange={(checked) =>
                              updateLifeInsurancePolicy(policy.id, "covers_critical_injury", checked)
                            }
                            className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                            disabled={isReadOnly}
                          />
                          <Label>Critical Injury</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.covers_alzheimers || false}
                            onCheckedChange={(checked) =>
                              updateLifeInsurancePolicy(policy.id, "covers_alzheimers", checked)
                            }
                            className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                            disabled={isReadOnly}
                          />
                          <Label>Alzheimer's</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Policy Button */}
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addPolicy("self")}
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Policy
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Disability Insurance */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <CardTitle>Disability Insurance</CardTitle>
                  <CardDescription className="text-green-100">Income protection if you can't work</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Self */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Self</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={formData.has_disability_insurance_self}
                      onCheckedChange={(checked) => handleInputChange("has_disability_insurance_self", checked)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                    <Label className="font-medium">Has Disability Insurance</Label>
                  </div>
                  {formData.has_disability_insurance_self && (
                    <div className="mt-3">
                      <Label>Monthly Benefit ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.disability_coverage_monthly_self ?? ""}
                        onChange={(e) => handleInputChange("disability_coverage_monthly_self", e.target.value)}
                        placeholder="5,000"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Spouse */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Spouse</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={formData.has_disability_insurance_spouse}
                      onCheckedChange={(checked) => handleInputChange("has_disability_insurance_spouse", checked)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                    <Label className="font-medium">Has Disability Insurance</Label>
                  </div>
                  {formData.has_disability_insurance_spouse && (
                    <div className="mt-3">
                      <Label>Monthly Benefit ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.disability_coverage_monthly_spouse ?? ""}
                        onChange={(e) => handleInputChange("disability_coverage_monthly_spouse", e.target.value)}
                        placeholder="5,000"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Long-Term Care Insurance */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <div>
                  <CardTitle>Long-Term Care Insurance</CardTitle>
                  <CardDescription className="text-orange-100">Coverage for extended care needs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Self */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Self</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={formData.has_ltc_insurance_self}
                      onCheckedChange={(checked) => handleInputChange("has_ltc_insurance_self", checked)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                    <Label className="font-medium">Has Long-Term Care Insurance</Label>
                  </div>
                  {formData.has_ltc_insurance_self && (
                    <div className="mt-3">
                      <Label>Monthly Benefit ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.ltc_monthly_benefit_self ?? ""}
                        onChange={(e) => handleInputChange("ltc_monthly_benefit_self", e.target.value)}
                        placeholder="6,000"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Spouse */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Spouse</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Switch
                      checked={formData.has_ltc_insurance_spouse}
                      onCheckedChange={(checked) => handleInputChange("has_ltc_insurance_spouse", checked)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                    <Label className="font-medium">Has Long-Term Care Insurance</Label>
                  </div>
                  {formData.has_ltc_insurance_spouse && (
                    <div className="mt-3">
                      <Label>Monthly Benefit ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.ltc_monthly_benefit_spouse ?? ""}
                        onChange={(e) => handleInputChange("ltc_monthly_benefit_spouse", e.target.value)}
                        placeholder="6,000"
                        className="border-slate-300"
                        readOnly={isReadOnly}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Umbrella Insurance */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <CardTitle>Umbrella Insurance</CardTitle>
                  <CardDescription className="text-cyan-100">Extra liability protection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Umbrella Policy</h4>
                <Switch
                  checked={formData.has_umbrella_insurance}
                  onCheckedChange={(v) => handleInputChange("has_umbrella_insurance", v)}
                  className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                  disabled={isReadOnly}
                />
              </div>
              {formData.has_umbrella_insurance && (
                <div className="space-y-4">
                  <div>
                    <Label>Coverage Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.umbrella_coverage ?? ""}
                      onChange={(e) => handleInputChange("umbrella_coverage", e.target.value)}
                      placeholder="1,000,000"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label>Monthly Premium ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.umbrella_monthly_premium ?? ""}
                      onChange={(e) => handleInputChange("umbrella_monthly_premium", e.target.value)}
                      placeholder="0"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mortgage Protection */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <CardTitle>Mortgage Protection</CardTitle>
                  <CardDescription className="text-yellow-100">Coverage for your home loan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Mortgage Protection Insurance</h4>
                <Switch
                  checked={formData.has_mortgage_protection}
                  onCheckedChange={(v) => handleInputChange("has_mortgage_protection", v)}
                  className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                  disabled={isReadOnly}
                />
              </div>
              {formData.has_mortgage_protection && (
                <div className="space-y-4">
                  <div>
                    <Label>Coverage Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.mortgage_protection_coverage ?? ""}
                      onChange={(e) => handleInputChange("mortgage_protection_coverage", e.target.value)}
                      placeholder="300,000"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label>Monthly Premium ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.mortgage_protection_monthly_premium ?? ""}
                      onChange={(e) => handleInputChange("mortgage_protection_monthly_premium", e.target.value)}
                      placeholder="0"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estate Planning */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <CardTitle>Estate Planning</CardTitle>
                  <CardDescription className="text-indigo-100">Legal documents and beneficiaries</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Trust Fully Funded and Notarized</Label>
                <Switch
                  checked={formData.trust_fully_funded}
                  onCheckedChange={(v) => handleInputChange("trust_fully_funded", v)}
                  className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-700 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <CardTitle>Foreign Assets</CardTitle>
                  <CardDescription className="text-gray-100">International financial holdings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Has Foreign Assets</h4>
                <Switch
                  checked={formData.has_foreign_assets}
                  onCheckedChange={(v) => handleInputChange("has_foreign_assets", v)}
                  className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                  disabled={isReadOnly}
                />
              </div>
              {formData.has_foreign_assets && (
                <div className="space-y-4">
                  <div>
                    <Label>Countries</Label>
                    <Input
                      type="text"
                      value={formData.foreign_countries || ""}
                      onChange={(e) => handleInputChange("foreign_countries", e.target.value)}
                      placeholder="India, Canada, UK"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <Label>Permanent Assets (Real Estate, Business, etc.) - USD</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.foreign_permanent_assets ?? ""}
                      onChange={(e) => handleInputChange("foreign_permanent_assets", e.target.value)}
                      placeholder="500,000"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <Label>Liquid Assets (Bank accounts, stocks, bonds, etc.) - USD</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.foreign_liquid_assets ?? ""}
                      onChange={(e) => handleInputChange("foreign_liquid_assets", e.target.value)}
                      placeholder="200,000"
                      className="border-slate-300"
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Exceeds FBAR Threshold ($10,000)?</Label>
                    <Switch
                      checked={formData.exceeds_fbar_threshold}
                      onCheckedChange={(v) => handleInputChange("exceeds_fbar_threshold", v)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">FBAR Filed This Year?</Label>
                    <Switch
                      checked={formData.fbar_filed_this_year}
                      onCheckedChange={(v) => handleInputChange("fbar_filed_this_year", v)}
                      className="data-[state=checked]:bg-green-500 transition-colors duration-200"
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <a
                      href="https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      FBAR Filing Information (IRS Website)
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(returnUrl || "/home")} className="px-8">
              Cancel
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={saving}
                className="px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            )}
          </div>
        </form>
      </div>

      {!isReadOnly && <FormHelpPanel helpItems={defenseStrategyHelp} title="Defense Strategy Help" />}
    </div>
  )
}
