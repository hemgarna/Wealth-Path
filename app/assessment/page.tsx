"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, TrendingUp, Save, CheckCircle2 } from "lucide-react"
import { PersonalInfoStep } from "@/components/assessment/personal-info-step"
import { IncomeExpensesStep } from "@/components/assessment/income-expenses-step"
import { AssetsLiabilitiesStep } from "@/components/assessment/assets-liabilities-step"
import { GoalsStep } from "@/components/assessment/goals-step"
import { ReviewStep } from "@/components/assessment/review-step"
import { trackEvent } from "@/lib/tracking"

export type AssessmentData = {
  // Personal Information
  date_of_birth?: string
  marital_status?: string
  number_of_children?: number
  children_ages?: number[]

  // Profession fields for both spouses
  occupation?: string
  spouse_occupation?: string

  // Income & Expenses
  annual_income?: number
  spouse_annual_income?: number
  monthly_expenses?: number
  monthly_housing_cost?: number

  // Tax information fields
  federal_taxes_last_year?: number
  expected_federal_taxes_this_year?: number

  // Assets
  cash_savings?: number
  checking_balance?: number
  investment_accounts?: number
  retirement_401k?: number
  retirement_ira?: number
  home_value?: number
  other_assets?: number

  // Emergency fund amount
  emergency_fund_amount?: number

  // Annuities fields
  has_annuities?: boolean
  growth_annuities?: Array<{
    amount: number
    rate_of_return: number
    provider: string
  }>
  lifetime_income_annuities?: Array<{
    amount: number
    guaranteed_income: number
  }>

  // Liabilities
  mortgage_balance?: number
  mortgage_rate?: number
  mortgage_years_remaining?: number
  credit_card_debt?: number
  student_loans?: number
  auto_loans?: number
  other_debts?: number

  // Goals & Risk
  retirement_age?: number
  desired_retirement_income?: number
  risk_tolerance?: string
  college_funding_goal?: number
  emergency_fund_months?: number

  // Insurance
  current_life_insurance?: number
  current_disability_insurance?: boolean

  // Life insurance with cash value income stream
  life_insurance_cash_value?: number
  life_insurance_income_stream?: number

  // Profile fields
  full_name?: string
  email?: string
  phone?: string
  dependents?: number
}

const steps = [
  { id: 1, name: "Personal Info", description: "Basic information about you and your family" },
  { id: 2, name: "Income & Expenses", description: "Your current financial situation" },
  { id: 3, name: "Assets & Liabilities", description: "What you own and what you owe" },
  { id: 4, name: "Goals & Planning", description: "Your financial objectives" },
  { id: 5, name: "Review", description: "Confirm your information" },
]

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<AssessmentData>({
    number_of_children: 0,
    children_ages: [],
    marital_status: "single",
    risk_tolerance: "moderate",
    emergency_fund_months: 6,
    current_disability_insurance: false,
    full_name: "",
    email: "",
    phone: "",
    occupation: "",
    dependents: 0,
  })
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load user and existing assessment
  useEffect(() => {
    async function loadUserAndAssessment() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      await trackEvent("started_questionnaire", user.id)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      // Load existing draft assessment
      const { data: assessments } = await supabase
        .from("client_assessments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1)

      if (assessments && assessments.length > 0) {
        const assessment = assessments[0]
        setAssessmentId(assessment.id)
        setCurrentStep(assessment.last_saved_step || 1)

        // Map database fields to component state
        setData({
          full_name: profile?.full_name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          occupation: profile?.occupation || "",
          dependents: profile?.dependents || 0,
          date_of_birth: assessment.date_of_birth,
          marital_status: assessment.marital_status,
          number_of_children: assessment.number_of_children,
          children_ages: assessment.children_ages || [],
          annual_income: assessment.annual_income,
          spouse_annual_income: assessment.spouse_annual_income,
          monthly_expenses: assessment.monthly_expenses,
          monthly_housing_cost: assessment.monthly_housing_cost,
          cash_savings: assessment.cash_savings,
          checking_balance: assessment.checking_balance,
          investment_accounts: assessment.investment_accounts,
          retirement_401k: assessment.retirement_401k,
          retirement_ira: assessment.retirement_ira,
          home_value: assessment.home_value,
          other_assets: assessment.other_assets,
          mortgage_balance: assessment.mortgage_balance,
          mortgage_rate: assessment.mortgage_rate,
          mortgage_years_remaining: assessment.mortgage_years_remaining,
          credit_card_debt: assessment.credit_card_debt,
          student_loans: assessment.student_loans,
          auto_loans: assessment.auto_loans,
          other_debts: assessment.other_debts,
          retirement_age: assessment.retirement_age,
          desired_retirement_income: assessment.desired_retirement_income,
          risk_tolerance: assessment.risk_tolerance,
          college_funding_goal: assessment.college_funding_goal,
          emergency_fund_months: assessment.emergency_fund_months,
          current_life_insurance: assessment.current_life_insurance,
          current_disability_insurance: assessment.current_disability_insurance,
          life_insurance_cash_value: assessment.life_insurance_cash_value,
          life_insurance_income_stream: assessment.life_insurance_income_stream,
          federal_taxes_last_year: assessment.federal_taxes_last_year,
          expected_federal_taxes_this_year: assessment.expected_federal_taxes_this_year,
          emergency_fund_amount: assessment.emergency_fund_amount,
          has_annuities: assessment.has_annuities,
          growth_annuities: assessment.growth_annuities || [],
          lifetime_income_annuities: assessment.lifetime_income_annuities || [],
        })
      } else if (profile) {
        setData((prev) => ({
          ...prev,
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          occupation: profile.occupation || "",
          dependents: profile.dependents || 0,
        }))
      }

      setIsLoading(false)
    }

    loadUserAndAssessment()
  }, [router, supabase])

  // Auto-save function
  const autoSave = async (stepNumber: number) => {
    if (!userId) return

    setIsSaving(true)
    try {
      const progressPercentage = Math.round((stepNumber / steps.length) * 100)

      console.log("[v0] Auto-saving data for step:", stepNumber)
      console.log("[v0] Current data keys:", Object.keys(data))
      console.log("[v0] Data to save:", JSON.stringify(data, null, 2))

      if (data.full_name || data.email || data.phone || data.occupation || data.dependents !== undefined) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            occupation: data.occupation,
            dependents: data.dependents,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (profileError) {
          console.error("[v0] Profile update error:", profileError)
        } else {
          console.log("[v0] Profile updated successfully")
        }
      }

      const assessmentData = {
        user_id: userId,
        status: "draft",
        last_saved_step: stepNumber,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
        ...data, // This spreads ALL fields from data
      }

      console.log("[v0] Assessment data keys to save:", Object.keys(assessmentData))

      if (assessmentId) {
        // Update existing assessment
        const { error: updateError } = await supabase
          .from("client_assessments")
          .update(assessmentData)
          .eq("id", assessmentId)

        if (updateError) {
          console.error("[v0] Assessment update error:", updateError)
          console.error("[v0] Failed to save fields:", Object.keys(assessmentData))
        } else {
          console.log("[v0] Assessment updated successfully with", Object.keys(assessmentData).length, "fields")
        }
      } else {
        // Create new assessment
        const { data: newAssessment, error: insertError } = await supabase
          .from("client_assessments")
          .insert([assessmentData])
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Assessment insert error:", insertError)
          console.error("[v0] Failed to save fields:", Object.keys(assessmentData))
        } else if (newAssessment) {
          setAssessmentId(newAssessment.id)
          console.log("[v0] Assessment created successfully with ID:", newAssessment.id)
        }
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error("[v0] Auto-save critical error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save when data changes
  useEffect(() => {
    if (!isLoading && userId) {
      const timer = setTimeout(() => {
        autoSave(currentStep)
      }, 2000) // Debounce for 2 seconds

      return () => clearTimeout(timer)
    }
  }, [data, currentStep, isLoading, userId])

  const updateData = (newData: Partial<AssessmentData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  const nextStep = async () => {
    if (currentStep < steps.length) {
      const nextStepNumber = currentStep + 1

      if (currentStep === 1) {
        await trackEvent("step1_complete", userId!)
      } else if (currentStep === 2) {
        await trackEvent("step2_complete", userId!)
      } else if (currentStep === 3) {
        await trackEvent("step3_complete", userId!)
      } else if (currentStep === 4) {
        await trackEvent("step4_complete", userId!)
      }

      setCurrentStep(nextStepNumber)
      await autoSave(nextStepNumber)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!assessmentId) return

    try {
      // Mark assessment as submitted
      await supabase
        .from("client_assessments")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          progress_percentage: 100,
        })
        .eq("id", assessmentId)

      await trackEvent("consultation_booked", userId!)

      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Submit error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading your assessment...</p>
        </div>
      </div>
    )
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">FNA App</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <Save className="h-4 w-4 animate-pulse text-muted-foreground" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Saved</span>
                  </>
                ) : null}
              </div>
              <Button variant="ghost" onClick={() => router.push("/dashboard")} size="sm">
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{steps[currentStep - 1].name}</h2>
                <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-20 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 sm:p-8">
          {currentStep === 1 && <PersonalInfoStep data={data} updateData={updateData} />}
          {currentStep === 2 && <IncomeExpensesStep data={data} updateData={updateData} />}
          {currentStep === 3 && <AssetsLiabilitiesStep data={data} updateData={updateData} />}
          {currentStep === 4 && <GoalsStep data={data} updateData={updateData} />}
          {currentStep === 5 && <ReviewStep data={data} />}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2">
                Submit & View Results
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
