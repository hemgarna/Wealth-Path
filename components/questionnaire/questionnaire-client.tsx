"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, ArrowLeft, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import FinancialGoalsStep from "./financial-goals-step"
import RetirementPlanningStep from "./retirement-planning-step"
import RealEstateInvestmentsStep from "./real-estate-investments-step"
import InsuranceProtectionStep from "./insurance-protection-step"
import ForeignAssetsStep from "./foreign-assets-step"

interface FinancialAssessmentData {
  id?: string
  current_step?: number
  progress_percentage?: number
  status?: string

  // College Planning
  college_child1_age?: number
  college_child1_years_from_today?: number
  college_child1_begin_year?: number
  college_child1_end_year?: number
  college_child1_amount?: number
  college_child2_age?: number
  college_child2_years_from_today?: number
  college_child2_begin_year?: number
  college_child2_end_year?: number
  college_child2_amount?: number

  // Marriage Planning
  marriage_child1_years_from_today?: number
  marriage_child1_year?: number
  marriage_child1_amount?: number
  marriage_child2_years_from_today?: number
  marriage_child2_year?: number
  marriage_child2_amount?: number

  // Retirement
  retirement_age?: number
  retirement_years_from_today?: number
  monthly_retirement_income_today?: number
  annual_retirement_income_today?: number

  // Long Term Care
  healthcare_out_of_pocket_amount?: number
  long_term_care_amount?: number

  // Life Goals
  life_goals_travel?: string
  life_goals_vacation_home?: string
  life_goals_charity?: string
  life_goals_other?: string

  // Legacy
  legacy_kids_home_business?: boolean
  legacy_assets_for_family?: boolean
  legacy_special_needs?: string

  // 401k and Retirement Accounts
  has_401k_him?: boolean
  has_401k_her?: boolean
  current_401k_value?: number
  company_match_him?: number
  company_match_her?: number
  max_funding_401k_him?: boolean
  max_funding_401k_her?: boolean
  projected_401k_at_65?: number

  has_traditional_ira?: boolean
  traditional_ira_value?: number
  has_roth_ira?: boolean
  roth_ira_value?: number
  has_hsa?: boolean
  hsa_value?: number
  social_security_projected?: number
  has_pension?: boolean
  pension_value?: number

  // Real Estate
  has_personal_home?: boolean
  personal_home_equity?: number
  has_rental_properties?: boolean
  rental_properties_value?: number
  rental_income_monthly?: number
  has_land_parcels?: boolean
  land_value?: number
  has_usa_inheritance?: boolean
  usa_inheritance_value?: number

  // Stocks & Business
  has_stocks_outside_401k?: boolean
  stocks_value?: number
  owns_business?: boolean
  business_value?: number
  has_alternative_investments?: boolean
  alternative_investments_value?: number
  has_cds?: boolean
  cds_value?: number
  cash_in_bank?: number
  emergency_fund?: number

  // Insurance
  life_insurance_work_him?: number
  life_insurance_work_her?: number
  life_insurance_outside_him?: number
  life_insurance_outside_her?: number
  is_cash_value_life_insurance?: boolean
  life_insurance_company?: string
  has_disability_insurance?: boolean
  has_long_term_care_insurance?: boolean
  has_mortgage_protection?: boolean
  has_umbrella_insurance?: boolean

  // Estate Planning
  has_529_plans?: boolean
  plan_529_value?: number
  has_will_and_trust?: boolean
  estate_planning_updated_year?: number

  // Monthly Budget
  monthly_net_pay?: number
  monthly_mortgage_rent?: number
  monthly_retirement_savings?: number
  monthly_lifestyle?: number
  monthly_short_term_savings?: number

  // Foreign Assets (FBAR/FATCA)
  offshore_retirement_funds?: number
  offshore_pension?: number
  offshore_real_estate_value?: number
  offshore_rental_income?: number
  offshore_business_value?: number
  offshore_inheritance?: number
  offshore_stocks?: number
  offshore_mutual_funds?: number
  offshore_fixed_deposits?: number
  offshore_savings_accounts?: number
  offshore_gold_silver?: number
  offshore_life_insurance?: number
  offshore_health_insurance?: number
  offshore_emergency_fund?: number
  offshore_other_investments?: number

  // Calculated totals
  total_fbar_amount?: number
  total_foreign_networth?: number
  total_usa_networth?: number
  total_networth?: number
}

interface Props {
  initialData: FinancialAssessmentData | null
  userId: string
}

export default function QuestionnaireClient({ initialData, userId }: Props) {
  const [currentStep, setCurrentStep] = useState(initialData?.last_saved_step || 1)
  const [formData, setFormData] = useState<FinancialAssessmentData>(initialData || {})
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(formData).length > 0) {
        setIsSaving(true)
        try {
          console.log("[v0] Auto-saving data:", formData)
          console.log("[v0] User ID:", userId)

          const { error } = await supabase.from("client_assessments").upsert(
            {
              user_id: userId,
              ...formData,
              last_saved_step: currentStep,
              progress_percentage: Math.round(progress),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          if (error) {
            console.error("[v0] Auto-save error:", error.message)
          } else {
            console.log("[v0] Auto-save successful")
          }
        } catch (err: any) {
          console.error("[v0] Auto-save exception:", err.message)
        } finally {
          setIsSaving(false)
        }
      }
    }

    const timer = setTimeout(autoSave, 2000)
    return () => clearTimeout(timer)
  }, [formData, currentStep, userId, supabase, progress])

  const updateFormData = (data: Partial<FinancialAssessmentData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final submission
      setIsSaving(true)
      try {
        console.log("[v0] Final submission data:", formData)

        const { error } = await supabase.from("client_assessments").upsert(
          {
            user_id: userId,
            ...formData,
            last_saved_step: totalSteps,
            progress_percentage: 100,
            status: "completed",
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        if (error) {
          console.error("[v0] Final submission error:", error.message)
          throw error
        }
        console.log("[v0] Final submission successful, redirecting to results")
        router.push("/results")
      } catch (err: any) {
        console.error("[v0] Final submission exception:", err.message)
        alert("There was an error submitting your assessment. Please try again.")
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <FinancialGoalsStep data={formData} updateData={updateFormData} />
      case 2:
        return (
          <div className="space-y-8">
            <RetirementPlanningStep data={formData} updateData={updateFormData} />
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold mb-4">Real Estate & Other Investments</h3>
              <RealEstateInvestmentsStep data={formData} updateData={updateFormData} />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-8">
            <InsuranceProtectionStep data={formData} updateData={updateFormData} />
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold mb-4">Foreign Assets (FBAR/FATCA)</h3>
              <ForeignAssetsStep data={formData} updateData={updateFormData} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const stepTitles = [
    "Section 1: Financial Goals",
    "Section 2: Current Growth Strategy (Offensive)",
    "Section 3: Current Defense Strategy (Defensive)",
  ]

  const stepDescriptions = [
    "College planning, retirement goals, medical/LTC, and legacy planning",
    "Retirement accounts (401k, IRA, Roth), investments, real estate, and Social Security",
    "Life insurance, disability insurance, emergency fund, estate planning, and foreign assets",
  ]

  return (
    <div className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Financial Planning Assessment</span>
          </div>
          {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              Section {currentStep} of {totalSteps}
            </p>
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
            <CardDescription>{stepDescriptions[currentStep - 1]}</CardDescription>
          </CardHeader>
          <CardContent>{getStepComponent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSaving}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={isSaving}>
            {currentStep === totalSteps ? "Complete Assessment" : "Next"}
            {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
