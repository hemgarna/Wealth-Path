"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  PlusCircle,
  Trash2,
  GraduationCap,
  Heart,
  Briefcase,
  Plane,
  Gift,
  Target,
  CheckCircle2,
  DollarSign,
} from "lucide-react"
import { FormHelpPanel } from "@/components/forms/form-help-panel"
import { financialGoalsHelp } from "@/lib/form-help-content"

// Define Supabase client globally or import it where needed.
// For this component, we'll create it within functions that need it.
// const supabase = createBrowserClient(); // Avoid global instantiation if client creation is conditional

interface Child {
  name: string
  current_age: number
  years_to_college: number
  college_begin_year: number
  college_end_year: number
  estimated_total_needed: number
  current_savings_amount: number
  monthly_savings_amount: number
  avg_annual_return_rate: number
  years_to_marriage: number
  marriage_year: number
  marriage_amount: number
}

interface FormData {
  top_priorities?: string[] | null
  user_id: string
  children: Child[]
  current_age: number | string
  spouse_name: string
  spouse_age: number | string
  years_to_retirement: number | string
  charity_annual: number | string
  monthly_utilities: number | string
  monthly_maintenance: number | string
  monthly_home_insurance: number | string
  monthly_entertainment: number | string
  monthly_home_taxes: number | string
  monthly_groceries: number | string
  monthly_retirement_income_today: number | string
  healthcare_philosophy: string
  healthcare_outofpocket_20years: number | string
  longterm_care_3years: number | string
  has_ltc_insurance: boolean
  other_goal_description: string
  legacy_kids_home_amount: number | string
  legacy_asset_amount: number | string
  special_needs_description: string
  completed: boolean
  retirement_age: number | string
  annual_retirement_income_today: number | string
  annual_retirement_income_inflation: number | string
  annual_retirement_income_pretax: number | string
  travel_enabled: boolean
  travel_annual_contribution: number | string
  vacation_home_enabled: boolean
  vacation_home_annual_contribution: number | string
  charity_enabled: boolean
  charity_annual_contribution: number | string
  other_goal_enabled: boolean
  other_goal_annual_contribution: number | string
  total_monthly_expenses?: number
  federal_tax_last_year: number | string
  federal_tax_expected_this_year: number | string
}

// Define Props interface
interface Props {
  userId: string
  initialData: Partial<FormData> | null
  isReadOnly?: boolean // Added isReadOnly prop to Props interface
  clientId?: string
  returnUrl?: string // Added returnUrl prop
}

export default function FinancialGoalsForm({ userId, initialData, isReadOnly = false, clientId, returnUrl }: Props) {
  // Added isReadOnly prop to Props interface and set default to false
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentYear = new Date().getFullYear()

  // Helper function to map initialData to FormData, handling potential nulls and ensuring correct types
  const mapInitialDataToFormData = (initialData: Partial<FormData> | null): FormData => {
    if (!initialData) {
      return {
        user_id: userId,
        children: [],
        current_age: "",
        spouse_name: "",
        spouse_age: "",
        years_to_retirement: "",
        charity_annual: "",
        monthly_utilities: "",
        monthly_maintenance: "",
        monthly_home_insurance: "",
        monthly_entertainment: "",
        monthly_home_taxes: "",
        monthly_groceries: "",
        monthly_retirement_income_today: "",
        healthcare_philosophy: "",
        healthcare_outofpocket_20years: "",
        longterm_care_3years: "",
        has_ltc_insurance: false,
        other_goal_description: "",
        legacy_kids_home_amount: "",
        legacy_asset_amount: "",
        special_needs_description: "",
        completed: false,
        retirement_age: "",
        annual_retirement_income_today: "",
        annual_retirement_income_inflation: "",
        annual_retirement_income_pretax: "",
        travel_enabled: false,
        travel_annual_contribution: "",
        vacation_home_enabled: false,
        vacation_home_annual_contribution: "",
        charity_enabled: false,
        charity_annual_contribution: "",
        other_goal_enabled: false,
        other_goal_annual_contribution: "",
        federal_tax_last_year: "",
        federal_tax_expected_this_year: "",
      }
    }

    return {
      user_id: userId,
      top_priorities: initialData.top_priorities ?? [],
      children: initialData.children || [],
      current_age: initialData.current_age ?? "",
      spouse_name: initialData.spouse_name ?? "",
      spouse_age: initialData.spouse_age ?? "",
      years_to_retirement: initialData.years_to_retirement ?? "",
      charity_annual: initialData.charity_annual ?? "",
      monthly_utilities: initialData.monthly_utilities ?? "",
      monthly_maintenance: initialData.monthly_maintenance ?? "",
      monthly_home_insurance: initialData.monthly_home_insurance ?? "",
      monthly_entertainment: initialData.monthly_entertainment ?? "",
      monthly_home_taxes: initialData.monthly_home_taxes ?? "",
      monthly_groceries: initialData.monthly_groceries ?? "",
      monthly_retirement_income_today: initialData.monthly_retirement_income_today ?? "",
      healthcare_philosophy: initialData.healthcare_philosophy ?? "",
      healthcare_outofpocket_20years: initialData.healthcare_outofpocket_20years ?? "",
      longterm_care_3years: initialData.longterm_care_3years ?? "",
      has_ltc_insurance: initialData.has_ltc_insurance ?? false,
      other_goal_description: initialData.other_goal_description ?? "",
      legacy_kids_home_amount: initialData.legacy_kids_home_amount ?? "",
      legacy_asset_amount: initialData.legacy_asset_amount ?? "",
      special_needs_description: initialData.special_needs_description ?? "",
      completed: initialData.completed ?? false,
      retirement_age: initialData.retirement_age ?? "",
      annual_retirement_income_today: initialData.annual_retirement_income_today ?? "",
      annual_retirement_income_inflation: initialData.annual_retirement_income_inflation ?? "",
      annual_retirement_income_pretax: initialData.annual_retirement_income_pretax ?? "",
      travel_enabled: (initialData.travel_amount && Number(initialData.travel_amount) > 0) ?? false,
      travel_annual_contribution: initialData.travel_amount ?? "",
      vacation_home_enabled:
        (initialData.vacation_home_amount && Number(initialData.vacation_home_amount) > 0) ?? false,
      vacation_home_annual_contribution: initialData.vacation_home_amount ?? "",
      charity_enabled: (initialData.charity_amount && Number(initialData.charity_amount) > 0) ?? false,
      charity_annual_contribution: initialData.charity_amount ?? "",
      other_goal_enabled: (initialData.other_goal_amount && Number(initialData.other_goal_amount) > 0) ?? false,
      other_goal_annual_contribution: initialData.other_goal_amount ?? "",
      federal_tax_last_year: initialData.federal_tax_last_year ?? "",
      federal_tax_expected_this_year: initialData.federal_tax_expected_this_year ?? "",
    }
  }

  const [formData, setFormData] = useState<FormData>(mapInitialDataToFormData(initialData))

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

  // Handler for generic input changes, especially for new fields like top_priorities
  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    if (
      formData.current_age !== "" &&
      formData.retirement_age !== "" &&
      typeof formData.current_age === "number" &&
      typeof formData.retirement_age === "number"
    ) {
      const yearsToRetirement = Math.max(0, formData.retirement_age - formData.current_age)
      setFormData((prev) => ({
        ...prev,
        years_to_retirement: yearsToRetirement,
      }))
    } else if (formData.current_age === "" || formData.retirement_age === "") {
      setFormData((prev) => ({
        ...prev,
        years_to_retirement: "",
      }))
    }
  }, [formData.current_age, formData.retirement_age])

  useEffect(() => {
    if (
      formData.annual_retirement_income_pretax !== "" &&
      typeof formData.annual_retirement_income_pretax === "number" &&
      formData.years_to_retirement !== "" &&
      typeof formData.years_to_retirement === "number"
    ) {
      const inflationRate = 0.036 // 3.6% annual inflation
      // Formula: Inflation_Adjusted = Annual_Pre_Tax × (1.036)^Years_To_Retirement
      const futureValue =
        formData.annual_retirement_income_pretax * Math.pow(1 + inflationRate, formData.years_to_retirement)
      setFormData((prev) => ({
        ...prev,
        annual_retirement_income_inflation: Math.round(futureValue),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        annual_retirement_income_inflation: "",
      }))
    }
  }, [formData.annual_retirement_income_pretax, formData.years_to_retirement])

  // Auto-calculate fields
  useEffect(() => {
    // Note: The calculation logic here might need to be adjusted based on the new FormData structure.
    // For now, keeping the original logic where applicable and marking potential areas for review.

    // Original calculation for annual income, now likely needs to be derived from new fields.
    // const annualIncome = formData.monthly_retirement_income_today * 12;

    const totalMonthlyLifestyle =
      (Number(formData.monthly_utilities) || 0) +
      (Number(formData.monthly_maintenance) || 0) +
      (Number(formData.monthly_home_insurance) || 0) +
      (Number(formData.monthly_entertainment) || 0) +
      (Number(formData.monthly_home_taxes) || 0) +
      (Number(formData.monthly_groceries) || 0)

    setFormData((prev) => ({
      ...prev,
      // annual_retirement_income_today: annualIncome, // This field is removed in the new FormData
      // The new fields like desired_annual_retirement_income and expected_annual_expenses might be used here.
      total_monthly_expenses: totalMonthlyLifestyle,

      // retirement_begin_year calculation based on desired_retirement_age and current_age
      // Removed retirement_begin_year and retirement_end_year calculations as fields are removed
      // retirement_begin_year:
      //   prev.current_age !== "" && prev.retirement_age !== ""
      //     ? currentYear + (Number(prev.retirement_age) - Number(prev.current_age))
      //     : "",
      // retirement_end_year calculation might need a standard duration or be a separate field.
      // Using a placeholder duration of 25 years for now.
      // retirement_end_year:
      //   prev.current_age !== "" && prev.retirement_age !== ""
      //     ? currentYear + (Number(prev.retirement_age) - Number(prev.current_age)) + 25
      //     : "",

      // LTC begin and end year calculations - using ltc_years_from_today as a proxy for now
      // Removed LTC begin/end year calculations as fields are removed
      // ltc_begin_year: prev.ltc_years_from_today !== "" ? currentYear + Number(prev.ltc_years_from_today) : "",
      // ltc_end_year: prev.ltc_years_from_today !== "" ? currentYear + Number(prev.ltc_years_from_today) + 20 : "", // Assuming a 20-year duration for LTC needs

      // Travel begin and end year calculations
      // Removed Travel begin/end year calculations as fields are removed
      // travel_begin_year: prev.travel_years !== "" ? currentYear + Number(prev.travel_years) : "", // Use travel_years here
      // travel_end_year: prev.travel_years !== "" ? currentYear + Number(prev.travel_years) + 20 : "", // Assuming a 20-year duration for travel goals

      // Vacation home begin and end year calculations
      // Removed Vacation home begin/end year calculations as fields are removed
      // vacation_home_begin_year: prev.vacation_home_years !== "" ? currentYear + Number(prev.vacation_home_years) : "",
      // vacation_home_end_year:
      //   prev.vacation_home_years !== "" ? currentYear + Number(prev.vacation_home_years) + 20 : "", // Assuming a 20-year duration for vacation home goal

      // Charity begin and end year calculations
      // Removed Charity begin/end year calculations as fields are removed
      // charity_begin_year: prev.charity_years !== "" ? currentYear + Number(prev.charity_years) : "",
      // charity_end_year: prev.charity_years !== "" ? currentYear + Number(prev.charity_years) + 20 : "", // Assuming a 20-year duration for charity goals

      // Legacy kids home begin and end year calculations
      // Removed Legacy kids home begin/end year calculations as fields are removed
      // legacy_kids_home_begin_year:
      //   prev.legacy_kids_home_years !== "" ? currentYear + Number(prev.legacy_kids_home_years) : "",
      // legacy_kids_home_end_year:
      //   prev.legacy_kids_home_years !== "" ? currentYear + Number(prev.legacy_kids_home_years) + 20 : "", // Assuming a 20-year duration

      // Legacy asset begin and end year calculations
      // Removed Legacy asset begin/end year calculations as fields are removed
      // legacy_asset_begin_year: prev.legacy_asset_years !== "" ? currentYear + Number(prev.legacy_asset_years) : "",
      // legacy_asset_end_year: prev.legacy_asset_years !== "" ? currentYear + Number(prev.legacy_asset_years) + 20 : "", // Assuming a 20-year duration

      // Special needs begin and end year calculations
      // Removed Special needs begin/end year calculations as fields are removed
      // special_needs_begin_year: prev.special_needs_years !== "" ? currentYear + Number(prev.special_needs_years) : "",
      // special_needs_end_year:
      //   prev.special_needs_years !== "" ? currentYear + Number(prev.special_needs_years) + 20 : "", // Assuming a 20-year duration
    }))
  }, [
    // formData.monthly_retirement_income_today, // This field might not be directly used anymore.
    // formData.years_to_retirement, // Replaced by desired_retirement_age and current_age
    // Removed dependencies for removed fields
    // formData.ltc_years_from_today, // Depend on the new field
    // formData.travel_years, // Depend on the new field
    // formData.vacation_home_years,
    // formData.charity_years,
    // formData.legacy_kids_home_years,
    // formData.legacy_asset_years,
    // formData.special_needs_years,
    formData.monthly_groceries,
    formData.monthly_home_taxes,
    formData.monthly_utilities,
    formData.monthly_home_insurance,
    formData.monthly_entertainment,
    formData.monthly_maintenance,
    formData.current_age, // Added dependency
    formData.retirement_age, // Added dependency
    currentYear,
  ])

  const autoSave = useCallback(
    async (currentData: FormData) => {
      // Allow passing data to save to avoid re-reading formData
      try {
        setAutoSaveStatus("saving")
        console.log("[v0] Auto-saving financial goals data...")

        const supabase = createBrowserClient() // Correctly instantiate supabase client here
        const { error } = await supabase.from("financial_goals").upsert(
          {
            user_id: userId,
            top_priorities: currentData.top_priorities || [],

            // Personal Information
            current_age: currentData.current_age || null,

            // Retirement Planning
            retirement_age: currentData.retirement_age || null,
            years_to_retirement: currentData.years_to_retirement || null,
            monthly_retirement_income_today: currentData.monthly_retirement_income_today || null,
            annual_retirement_income_today: currentData.annual_retirement_income_today || null,
            annual_retirement_income_pretax: currentData.annual_retirement_income_pretax || null,
            annual_retirement_income_inflation: currentData.annual_retirement_income_inflation || null,

            monthly_utilities: currentData.monthly_utilities || null,
            monthly_maintenance: currentData.monthly_maintenance || null,
            monthly_home_insurance: currentData.monthly_home_insurance || null,
            monthly_entertainment: currentData.monthly_entertainment || null,
            monthly_home_taxes: currentData.monthly_home_taxes || null,
            monthly_groceries: currentData.monthly_groceries || null,

            // Healthcare Planning
            healthcare_philosophy: currentData.healthcare_philosophy,
            healthcare_outofpocket_20years: currentData.healthcare_outofpocket_20years || null,
            longterm_care_3years: currentData.longterm_care_3years || null,
            has_ltc_insurance: currentData.has_ltc_insurance,

            // Life Goals - Map form state to database columns
            travel_amount: currentData.travel_enabled ? currentData.travel_annual_contribution || null : null,
            vacation_home_amount: currentData.vacation_home_enabled
              ? currentData.vacation_home_annual_contribution || null
              : null,
            charity_amount: currentData.charity_enabled ? currentData.charity_annual_contribution || null : null,
            other_goal_amount: currentData.other_goal_enabled
              ? currentData.other_goal_annual_contribution || null
              : null,
            other_goal_description: currentData.other_goal_enabled ? currentData.other_goal_description : null,

            // Legacy Planning
            legacy_kids_home_amount: currentData.legacy_kids_home_amount || null,
            legacy_asset_amount: currentData.legacy_asset_amount || null,
            special_needs_description: currentData.special_needs_description,

            // Children as JSONB
            children: currentData.children,

            federal_tax_last_year: currentData.federal_tax_last_year || null,
            federal_tax_expected_this_year: currentData.federal_tax_expected_this_year || null,
          },
          {
            onConflict: "user_id",
          },
        )

        if (error) {
          console.error("[v0] Auto-save error:", error)
          setAutoSaveStatus("idle")
          throw error // Re-throw to be caught by the outer catch block
        } else {
          console.log("[v0] Auto-save successful")
          setAutoSaveStatus("saved")
          setTimeout(() => setAutoSaveStatus("idle"), 2000)
        }
      } catch (error) {
        console.error("[v0] Auto-save exception:", error)
        setAutoSaveStatus("idle")
      }
    },
    // formData is now passed directly to autoSave, so it doesn't need to be a dependency here
    [userId],
  )

  useEffect(() => {
    if (isReadOnly) {
      return
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Skip auto-save on initial mount or if required fields are not yet populated for calculation purposes
    // This condition is a bit broad and might need refinement based on what constitutes "initial" vs. "changed"
    if (formData.current_age === "" && formData.retirement_age === "" && formData.children.length === 0) {
      return
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(formData) // Pass current formData
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, autoSave, isReadOnly]) // Added isReadOnly to dependencies

  const addChild = () => {
    setFormData({
      ...formData,
      children: [
        ...formData.children,
        {
          name: "",
          current_age: 0,
          years_to_college: 0, // Changed default from 18 to 0
          college_begin_year: currentYear, // Changed default from currentYear + 18
          college_end_year: currentYear + 4, // Changed default from currentYear + 22
          estimated_total_needed: 80000,
          current_savings_amount: 0,
          monthly_savings_amount: 0,
          avg_annual_return_rate: 7, // Default 7% return rate
          years_to_marriage: 0,
          marriage_year: currentYear,
          marriage_amount: 0,
        },
      ],
    })
  }

  const removeChild = (index: number) => {
    setFormData({
      ...formData,
      children: formData.children.filter((_, i) => i !== index),
    })
  }

  const updateChild = (index: number, field: keyof Child, value: any) => {
    const updatedChildren = [...formData.children]
    updatedChildren[index] = { ...updatedChildren[index], [field]: value }

    // Recalculate related fields when key fields change
    if (field === "current_age") {
      const yearsToCollege = Math.max(0, 18 - Number(value)) // Ensure value is treated as number
      updatedChildren[index].years_to_college = yearsToCollege
      updatedChildren[index].college_begin_year = currentYear + yearsToCollege
      updatedChildren[index].college_end_year = currentYear + yearsToCollege + 4
    } else if (field === "years_to_college") {
      updatedChildren[index].college_begin_year = currentYear + Number(value)
      updatedChildren[index].college_end_year = currentYear + Number(value) + 4
    } else if (field === "college_begin_year") {
      updatedChildren[index].college_end_year = Number(value) + 4
      // Calculate years_to_college based on college_begin_year
      updatedChildren[index].years_to_college = Math.max(0, Number(value) - currentYear)
    }

    if (field === "years_to_marriage") {
      updatedChildren[index].marriage_year = currentYear + Number(value) // Ensure value is treated as number
    }

    setFormData({ ...formData, children: updatedChildren })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("You must be logged in to save your data.")
        return
      }

      console.log("[v0] SECTION 1 - Financial Goals Form Data Before Submission:", {
        userId: user.id,
        topPriorities: formData.top_priorities,
        currentAge: formData.current_age,
        retirementAge: formData.retirement_age,
        annualRetirementIncome: formData.annual_retirement_income_today,
        childrenCount: formData.children?.length || 0,
        children: formData.children,
        monthlyExpenses: {
          groceries: formData.monthly_groceries,
          homeTaxes: formData.monthly_home_taxes,
          hoa: formData.monthly_hoa, // This field is removed, so it won't be logged
          utilities: formData.monthly_utilities,
          homeInsurance: formData.monthly_home_insurance,
          entertainment: formData.monthly_entertainment,
          homeRepairs: formData.monthly_home_repairs, // This field is removed
          maintenance: formData.monthly_maintenance,
          carInsurance: formData.monthly_car_insurance, // This field is removed
        },
        hasLTCInsurance: formData.has_ltc_insurance,
        travelEnabled: formData.travel_enabled,
        travelContribution: formData.travel_annual_contribution,
        vacationHomeEnabled: formData.vacation_home_enabled,
        vacationHomeContribution: formData.vacation_home_annual_contribution,
        charityEnabled: formData.charity_enabled,
        charityContribution: formData.charity_annual_contribution,
        otherGoalEnabled: formData.other_goal_enabled,
        otherGoalDescription: formData.other_goal_description,
        otherGoalContribution: formData.other_goal_annual_contribution,
        legacyKidsHomeAmount: formData.legacy_kids_home_amount,
        legacyAssetAmount: formData.legacy_asset_amount,
      })

      const { error } = await supabase.from("financial_goals").upsert(
        {
          user_id: user.id,
          top_priorities: formData.top_priorities || [],
          current_age: formData.current_age === "" ? null : Number(formData.current_age),
          retirement_age: formData.retirement_age === "" ? null : Number(formData.retirement_age),
          years_to_retirement: formData.years_to_retirement === "" ? null : Number(formData.years_to_retirement),
          annual_retirement_income_today:
            formData.annual_retirement_income_today === "" ? null : Number(formData.annual_retirement_income_today),
          annual_retirement_income_inflation:
            formData.annual_retirement_income_inflation === ""
              ? null
              : Number(formData.annual_retirement_income_inflation),
          annual_retirement_income_pretax:
            formData.annual_retirement_income_pretax === "" ? null : Number(formData.annual_retirement_income_pretax),

          // Monthly Expenses - ADDING ALL FIELDS TO SUBMISSION
          monthly_utilities: formData.monthly_utilities === "" ? null : Number(formData.monthly_utilities),
          monthly_maintenance: formData.monthly_maintenance === "" ? null : Number(formData.monthly_maintenance),
          monthly_home_insurance:
            formData.monthly_home_insurance === "" ? null : Number(formData.monthly_home_insurance),
          monthly_entertainment: formData.monthly_entertainment === "" ? null : Number(formData.monthly_entertainment),
          // Store in existing column monthly_home_taxes
          monthly_home_taxes: formData.monthly_home_taxes === "" ? null : Number(formData.monthly_home_taxes),
          monthly_groceries: formData.monthly_groceries === "" ? null : Number(formData.monthly_groceries),

          monthly_retirement_income_today: Number(formData.monthly_retirement_income_today) || null,

          children: formData.children,
          healthcare_philosophy: formData.healthcare_philosophy,
          healthcare_outofpocket_20years:
            formData.healthcare_outofpocket_20years === "" ? null : Number(formData.healthcare_outofpocket_20years),
          longterm_care_3years: formData.longterm_care_3years === "" ? null : Number(formData.longterm_care_3years),
          has_ltc_insurance: formData.has_ltc_insurance,

          // Life Goals - Map to correct database columns
          travel_amount: formData.travel_enabled
            ? formData.travel_annual_contribution === ""
              ? null
              : Number(formData.travel_annual_contribution)
            : null,
          vacation_home_amount: formData.vacation_home_enabled
            ? formData.vacation_home_annual_contribution === ""
              ? null
              : Number(formData.vacation_home_annual_contribution)
            : null,
          charity_amount: formData.charity_enabled
            ? formData.charity_annual_contribution === ""
              ? null
              : Number(formData.charity_annual_contribution)
            : null,
          other_goal_amount: formData.other_goal_enabled
            ? formData.other_goal_annual_contribution === ""
              ? null
              : Number(formData.other_goal_annual_contribution)
            : null,
          other_goal_description: formData.other_goal_enabled ? formData.other_goal_description : null,

          legacy_kids_home_amount:
            formData.legacy_kids_home_amount === "" ? null : Number(formData.legacy_kids_home_amount),
          legacy_asset_amount: formData.legacy_asset_amount === "" ? null : Number(formData.legacy_asset_amount),
          special_needs_description: formData.special_needs_description,

          completed: true,

          federal_tax_last_year: formData.federal_tax_last_year === "" ? null : Number(formData.federal_tax_last_year),
          federal_tax_expected_this_year:
            formData.federal_tax_expected_this_year === "" ? null : Number(formData.federal_tax_expected_this_year),
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) throw error

      console.log("[v0] SECTION 1 - Financial Goals saved successfully!", {
        userId: user.id,
        completed: true,
        timestamp: new Date().toISOString(),
      })
      console.log("[v0] Financial Goals saved successfully, redirecting to Growth Strategy")
      router.push(returnUrl || "/growth-strategy/form")
    } catch (error: any) {
      console.error("[v0] SECTION 1 - Error saving financial goals:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      alert("Error saving data. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    // Added container and modified background gradient/padding
    <div className="container mx-auto max-w-4xl p-4">
      {/* Fixing back button to use returnUrl or default navigation */}
      {clientId && returnUrl && (
        <Button variant="outline" onClick={() => router.push(returnUrl)} className="mb-4">
          ← Back
        </Button>
      )}
      {clientId && !returnUrl && (
        <Button variant="outline" onClick={() => router.push(`/admin?clientId=${clientId}`)} className="mb-4">
          ← Back to Client
        </Button>
      )}
      {!clientId && (
        <Button variant="outline" onClick={() => router.push("/home")} className="mb-4">
          ← Back to Home
        </Button>
      )}
      {/* </CHANGE> */}

      {autoSaveStatus !== "idle" && (
        <div className="flex items-center gap-2 text-sm mb-4">
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

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full mb-4 shadow-lg">
          <Target className="w-4 h-4" />
          <span className="font-semibold text-sm">Section 1 of 3</span>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
          Section 1: Financial Goals
        </h1>
        <p className="text-slate-600 text-xl max-w-2xl mx-auto">Define your financial future and family aspirations</p>

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center gap-3 text-white">
              <Target className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">Top Priorities</h3>
                <p className="text-blue-100 text-base">Select the top 3 main things you are looking to solve</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <p className="text-slate-600 mb-6 text-center">
              Select up to 3 priorities ({formData.top_priorities?.filter(Boolean).length || 0}/3 selected)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "college_funding", label: "College Funding" },
                { id: "retirement_funding", label: "Retirement Funding" },
                { id: "tax_planning", label: "Tax Planning" },
                { id: "estate_planning", label: "Estate Planning" },
                { id: "insurance_review", label: "Insurance Review" },
                { id: "debt_reduction", label: "Debt Reduction" },
                { id: "investment_strategy", label: "Investment Strategy" },
                { id: "emergency_fund", label: "Emergency Fund" },
              ].map((priority) => {
                const isSelected = formData.top_priorities?.includes(priority.id)
                const selectedCount = formData.top_priorities?.filter(Boolean).length || 0
                const canSelect = isSelected || selectedCount < 3

                return (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => {
                      if (isReadOnly) return
                      if (!canSelect && !isSelected) return
                      const currentPriorities = formData.top_priorities || []
                      const newPriorities = isSelected
                        ? currentPriorities.filter((p) => p !== priority.id)
                        : [...currentPriorities, priority.id]
                      handleInputChange("top_priorities", newPriorities)
                    }}
                    disabled={isReadOnly || (!canSelect && !isSelected)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : canSelect && !isReadOnly
                          ? "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                          : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                      {priority.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 2.1 College Planning */}
        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-sm">2.1 College Planning</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Education funding for your children
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white to-blue-50/30">
            <Button
              type="button"
              onClick={addChild}
              disabled={isReadOnly} // <-- Add disabled prop
              className="mb-8 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Child Details
            </Button>

            <div className="space-y-6">
              {formData.children.map((child, index) => (
                <div
                  key={index}
                  className="p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      Child {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChild(index)}
                      disabled={isReadOnly} // <-- Add disabled prop
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Child Name</Label>
                      <Input
                        value={child.name}
                        onChange={(e) => updateChild(index, "name", e.target.value)}
                        placeholder="Child's name"
                        readOnly={isReadOnly} // <-- Add readOnly prop
                        className="mt-2 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Current Age</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={child.current_age || ""}
                        onChange={(e) => updateChild(index, "current_age", Number(e.target.value))}
                        readOnly={isReadOnly} // <-- Add readOnly prop
                        className="mt-2 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {/* START UPDATE */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Years Until College</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={child.years_to_college || ""}
                        onChange={(e) => updateChild(index, "years_to_college", Number(e.target.value))}
                        placeholder="e.g., 10"
                        readOnly={isReadOnly} // <-- Add readOnly prop
                        className="mt-2 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {/* END UPDATE */}
                  </div>

                  {/* START UPDATE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">College Begin Year</Label>
                      <Input
                        type="number"
                        min="2024"
                        step="1"
                        value={child.college_begin_year || ""}
                        onChange={(e) => updateChild(index, "college_begin_year", Number(e.target.value))}
                        placeholder="e.g., 2035"
                        readOnly={isReadOnly} // <-- Add readOnly prop
                        className="mt-2 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">College End Year</Label>
                      <Input
                        type="number"
                        min="2024"
                        step="1"
                        value={child.college_end_year || ""}
                        onChange={(e) => updateChild(index, "college_end_year", Number(e.target.value))}
                        placeholder="e.g., 2039"
                        readOnly={isReadOnly} // <-- Add readOnly prop
                        className="mt-2 border-2 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {/* END UPDATE */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        Estimated Total Amount Needed
                        <span className="text-xs text-blue-600 font-normal">(Select school type)</span>
                      </Label>
                      <Select
                        value={(child.estimated_total_needed || 80000).toString()}
                        onValueChange={(value) => updateChild(index, "estimated_total_needed", Number(value))}
                        disabled={isReadOnly} // <-- Add disabled prop
                      >
                        <SelectTrigger className="mt-2 border-2 focus:border-blue-500 font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="80000">$80,000 - State School</SelectItem>
                          <SelectItem value="120000">$120,000 - Regional</SelectItem>
                          <SelectItem value="200000">$200,000 - Private</SelectItem>
                          <SelectItem value="300000">$300,000 - Elite Private</SelectItem>
                          <SelectItem value="400000">$400,000 - Ivy League</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-green-200">
                    <h5 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      2.1.1 Educational Savings
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Current Savings Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={child.current_savings_amount || ""}
                          onChange={(e) => updateChild(index, "current_savings_amount", Number(e.target.value))}
                          placeholder="0"
                          readOnly={isReadOnly}
                          className="mt-2 border-2 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Monthly Savings Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="10"
                          value={child.monthly_savings_amount || ""}
                          onChange={(e) => updateChild(index, "monthly_savings_amount", Number(e.target.value))}
                          placeholder="0"
                          readOnly={isReadOnly}
                          className="mt-2 border-2 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Avg Annual Rate of Return (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={child.avg_annual_return_rate || ""}
                          onChange={(e) => updateChild(index, "avg_annual_return_rate", Number(e.target.value))}
                          placeholder="0"
                          readOnly={isReadOnly}
                          className="mt-2 border-2 focus:border-green-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2.2 Kids Marriage Planning - embedded */}
                  <div className="mt-6 pt-6 border-t-2 border-pink-200">
                    <h5 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-lg">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Heart className="w-5 h-5 text-rose-500" />
                      </div>
                      2.2 Marriage Planning
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Years from today</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={child.years_to_marriage || ""}
                          onChange={(e) => updateChild(index, "years_to_marriage", Number(e.target.value))}
                          readOnly={isReadOnly} // <-- Add readOnly prop
                          className="mt-2 border-2 focus:border-pink-500 transition-colors"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-700">Amount Needed</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={child.marriage_amount || ""}
                          onChange={(e) => updateChild(index, "marriage_amount", Number(e.target.value))}
                          placeholder="0"
                          readOnly={isReadOnly} // <-- Add readOnly prop
                          className="mt-2 border-2 focus:border-pink-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2.3 Retirement Planning */}
        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-sm">2.3 Retirement Planning</CardTitle>
                <CardDescription className="text-indigo-100 text-base">Your golden years blueprint</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white to-indigo-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Current Age</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.current_age || ""}
                  onChange={(e) => setFormData({ ...formData, current_age: Number(e.target.value) })}
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="h-12 text-lg border-2 border-indigo-200 focus:border-indigo-500 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Desired Retirement Age</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.retirement_age || ""}
                  onChange={(e) => setFormData({ ...formData, retirement_age: Number(e.target.value) })}
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="h-12 text-lg border-2 border-indigo-200 focus:border-indigo-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Spouse Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Spouse Name</Label>
                <Input
                  type="text"
                  value={formData.spouse_name || ""}
                  onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })}
                  readOnly={isReadOnly}
                  className="h-12 text-lg border-2 border-indigo-200 focus:border-indigo-500 transition-all"
                  placeholder="Enter spouse name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Spouse Age</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.spouse_age || ""}
                  onChange={(e) => setFormData({ ...formData, spouse_age: Number(e.target.value) })}
                  readOnly={isReadOnly}
                  className="h-12 text-lg border-2 border-indigo-200 focus:border-indigo-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                Monthly Retirement Income Needed (in today's dollars)
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.monthly_retirement_income_today || ""}
                onChange={(e) => {
                  const monthlyIncome = Number(e.target.value)
                  const annualPostTax = monthlyIncome * 12

                  const assumedTaxRate = 0.22 // 22% assumed total tax rate
                  const annualPreTax = annualPostTax / (1 - assumedTaxRate)

                  // Calculate inflation-Adjusted: Pre-Tax / 3.6%
                  const inflationAdjusted = annualPreTax / 0.036

                  setFormData({
                    ...formData,
                    monthly_retirement_income_today: monthlyIncome,
                    annual_retirement_income_today: annualPostTax,
                    annual_retirement_income_pretax: annualPreTax, // Store calculated pre-tax amount
                    annual_retirement_income_inflation: Math.round(inflationAdjusted),
                  })
                }}
                readOnly={isReadOnly} // <-- Add readOnly prop
                className="h-12 text-lg border-2 border-indigo-200 focus:border-indigo-500 transition-all"
                placeholder="0"
              />
              <p className="text-sm text-slate-600">Enter the monthly income you would need if you retired today</p>
            </div>

            {/* Annual Post-Tax Income Required (auto-calculated) */}
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 mb-4">
              <div className="text-sm font-semibold text-blue-700 mb-1">Annual Post-Tax Income Required</div>
              <div className="text-xl font-bold text-blue-900">
                ${(Number(formData.annual_retirement_income_today) || 0).toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 mt-1">Calculated as: Monthly × 12</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 mb-4">
              <div className="text-sm font-semibold text-green-700 mb-1">Annual Pre-Tax Income Required</div>
              <div className="text-xl font-bold text-green-900">
                ${Math.round((Number(formData.annual_retirement_income_today) || 0) / 0.78).toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">Calculated as: Annual Post-Tax ÷ 0.78 (assumes 22% tax)</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 mt-6">
              <div className="text-sm font-semibold text-purple-700 mb-1">
                Inflation-Adjusted Annual Income Required at Retirement
              </div>
              <div className="text-2xl font-bold text-purple-900">
                ${(Number(formData.annual_retirement_income_inflation) || 0).toLocaleString()}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Calculated as: (Monthly × 12 ÷ 0.78) ÷ 3.6%
                <br />
                <span className="text-purple-500">Assumes 22% total tax rate for pre-tax calculation</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CHANGE: Removed Monthly Lifestyle section */}

        {/* 2.4 Healthcare Planning */}
        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-sm">2.4 Healthcare Planning</CardTitle>
                <CardDescription className="text-green-100 text-base">
                  Healthcare and protection planning
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white to-green-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">
                  Healthcare Out-of-Pocket Expenses (after retirement)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.healthcare_outofpocket_20years || ""}
                  onChange={(e) => setFormData({ ...formData, healthcare_outofpocket_20years: Number(e.target.value) })}
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="h-12 text-lg border-2 border-green-200 focus:border-green-500 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Long Term Care/Disability (3 years of care)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.longterm_care_3years || ""}
                  onChange={(e) => setFormData({ ...formData, longterm_care_3years: Number(e.target.value) })}
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="h-12 text-lg border-2 border-green-200 focus:border-green-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-sm">2.5 Life Goals Planning</CardTitle>
                <CardDescription className="text-amber-100 text-base">Dream, travel, and give back</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white to-amber-50/30">
            <div className="p-6 bg-gradient-to-br from-cyan-50/50 to-blue-50/40 border-2 border-cyan-200 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-slate-900 text-lg">Travel, the world, Pilgrimage</h5>
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium text-slate-700">Enable</Label>
                  <Switch
                    checked={formData.travel_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, travel_enabled: checked })}
                    disabled={isReadOnly} // <-- Add disabled prop
                  />
                </div>
              </div>
              {formData.travel_enabled && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Annual Contribution</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.travel_annual_contribution || ""}
                    onChange={(e) => setFormData({ ...formData, travel_annual_contribution: Number(e.target.value) })}
                    placeholder="0"
                    readOnly={isReadOnly} // <-- Add readOnly prop
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/40 border-2 border-amber-200 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-slate-900 text-lg">Vacation Home</h5>
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium text-slate-700">Enable</Label>
                  <Switch
                    checked={formData.vacation_home_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, vacation_home_enabled: checked })}
                    disabled={isReadOnly} // <-- Add disabled prop
                  />
                </div>
              </div>
              {formData.vacation_home_enabled && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Annual Contribution</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.vacation_home_annual_contribution || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, vacation_home_annual_contribution: Number(e.target.value) })
                    }
                    placeholder="0"
                    readOnly={isReadOnly} // <-- Add readOnly prop
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/40 border-2 border-green-200 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-slate-900 text-lg">Charitable Giving & Community Support</h5>
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium text-slate-700">Enable</Label>
                  <Switch
                    checked={formData.charity_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, charity_enabled: checked })}
                    disabled={isReadOnly} // <-- Add disabled prop
                  />
                </div>
              </div>
              {formData.charity_enabled && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Annual Contribution</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.charity_annual_contribution || ""}
                    onChange={(e) => setFormData({ ...formData, charity_annual_contribution: Number(e.target.value) })}
                    placeholder="0"
                    readOnly={isReadOnly} // <-- Add disabled prop
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/40 border-2 border-violet-200 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-slate-900 text-lg">Other Life Goal</h5>
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium text-slate-700">Enable</Label>
                  <Switch
                    checked={formData.other_goal_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, other_goal_enabled: checked })}
                    disabled={isReadOnly} // <-- Add disabled prop
                  />
                </div>
              </div>
              {formData.other_goal_enabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Description</Label>
                    <Input
                      value={formData.other_goal_description}
                      onChange={(e) => setFormData({ ...formData, other_goal_description: e.target.value })}
                      placeholder="Describe your goal..."
                      readOnly={isReadOnly} // <-- Add readOnly prop
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Annual Contribution</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.other_goal_annual_contribution || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, other_goal_annual_contribution: Number(e.target.value) })
                      }
                      placeholder="0"
                      readOnly={isReadOnly} // <-- Add readOnly prop
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2.6 Long Term Care - Updated section number to 2.6 */}
        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-sm">2.6 Long Term Care</CardTitle>
                <CardDescription className="text-green-100 text-base">
                  Healthcare and protection planning
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white to-green-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">
                  Healthcare Out-of-Pocket Expenses (after retirement)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.healthcare_outofpocket_20years || ""}
                  onChange={(e) => setFormData({ ...formData, healthcare_outofpocket_20years: Number(e.target.value) })}
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="h-12 text-lg border-2 border-green-200 focus:border-green-500 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Long Term Care/Disability (3 years of care)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.longterm_care_3years || ""}
                  onChange={(e) => setFormData({ ...formData, longterm_care_3years: Number(e.target.value) })}
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="h-12 text-lg border-2 border-green-200 focus:border-green-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label className="text-sm font-bold text-slate-700">Currently have LTC insurance?</Label>
              <Select
                value={formData.has_ltc_insurance ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, has_ltc_insurance: value === "yes" })}
                disabled={isReadOnly} // <-- Add disabled prop
              >
                <SelectTrigger className="h-12 text-lg border-2 border-green-200 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold drop-shadow-sm">2.7 Legacy Planning</CardTitle>
                <CardDescription className="text-purple-100 text-base">Build generational wealth</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 bg-gradient-to-br from-white to-purple-50/30">
            <div className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/40 border-2 border-amber-200 rounded-2xl mb-6">
              <h5 className="font-bold text-slate-900 mb-4 text-lg">Fund for kids' primary home or business</h5>
              <div>
                <Label className="text-sm font-medium text-slate-700">Amount of Contribution</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.legacy_kids_home_amount || ""}
                  onChange={(e) => setFormData({ ...formData, legacy_kids_home_amount: Number(e.target.value) })}
                  placeholder="0"
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="mt-2 h-12 text-lg"
                />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-rose-50/50 to-pink-50/40 border-2 border-rose-200 rounded-2xl mb-6">
              <h5 className="font-bold text-slate-900 mb-4 text-lg">Legacy asset for kids/family</h5>
              <div>
                <Label className="text-sm font-medium text-slate-700">Amount of Contribution</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.legacy_asset_amount || ""}
                  onChange={(e) => setFormData({ ...formData, legacy_asset_amount: Number(e.target.value) })}
                  placeholder="0"
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="mt-2 h-12 text-lg"
                />
              </div>
            </div>

            {/* Plan for any special needs */}
            <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/40 border-2 border-purple-200 rounded-2xl mt-6">
              <h5 className="font-bold text-slate-900 mb-4 text-lg">Plan for any special needs</h5>
              <div className="mb-4">
                <Label className="text-sm font-medium text-slate-700">Description</Label>
                <Input
                  value={formData.special_needs_description}
                  onChange={(e) => setFormData({ ...formData, special_needs_description: e.target.value })}
                  placeholder="Describe special needs..."
                  readOnly={isReadOnly} // <-- Add readOnly prop
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
          <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Federal Tax Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Average Federal Taxes Paid Last Year</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.federal_tax_last_year}
                onChange={(e) => setFormData({ ...formData, federal_tax_last_year: e.target.value })}
                placeholder="0"
                readOnly={isReadOnly}
                className="mt-2"
              />
              <p className="text-xs text-slate-600 mt-1">Total federal income tax paid in the previous tax year</p>
            </div>

            <div>
              <Label>Expected Federal Taxes This Year</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.federal_tax_expected_this_year}
                onChange={(e) => setFormData({ ...formData, federal_tax_expected_this_year: e.target.value })}
                placeholder="0"
                readOnly={isReadOnly}
                className="mt-2"
              />
              <p className="text-xs text-slate-600 mt-1">Estimated federal income tax for the current tax year</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(returnUrl || "/home")}
            className="border-2 hover:bg-slate-50 transition-all px-8 py-6 text-lg bg-transparent"
          >
            Cancel
          </Button>
          {!isReadOnly && ( // <-- Conditionally render submit button if not readOnly
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-10 py-6 text-lg font-semibold"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Submit and Go to Next Section
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {!isReadOnly && <FormHelpPanel helpItems={financialGoalsHelp} title="Financial Goals Help" />}
    </div>
  )
}
