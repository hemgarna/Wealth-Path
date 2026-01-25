"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, DollarSign, PiggyBank, Home, ArrowLeft } from "lucide-react"

interface FinalReportProps {
  financialGoals: any
  growthStrategy: any
  defenseStrategy: any
  savingsVsSpending: any
  profile: any
  clientId?: string
  advisorProfile?: {
    full_name: string
    email: string
    phone: string
    zoom_link?: string
  } | null
  returnUrl?: string
}

export default function FinalReportClient({
  financialGoals,
  growthStrategy,
  defenseStrategy,
  savingsVsSpending,
  profile,
  clientId,
  advisorProfile,
  returnUrl,
}: FinalReportProps) {
  const router = useRouter()
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  // calculationError is now a boolean and used to control rendering
  const [calculationError, setCalculationError] = useState(false)
  const [isSavingReport, setIsSavingReport] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [reportCalculated, setReportCalculated] = useState(false)
  const [calculatedData, setCalculatedData] = useState<any>(null)

  const data = {
    financialGoals,
    growthStrategy,
    defenseStrategy,
    savingsVsSpending,
    profile,
  }

  const [emailMessage, setEmailMessage] = useState<string | null>(null)

  useEffect(() => {
    const sendReportToAdmin = async () => {
      try {
        console.log("[v0] Auto-sending report to admin...")
        await fetch("/api/send-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
        console.log("[v0] Report sent to admin successfully")
      } catch (error) {
        console.error("[v0] Failed to send report to admin:", error)
      }
    }

    sendReportToAdmin()
  }, [])

  useEffect(() => {
    try {
      console.log("[v0] Starting final report calculations...")

      const safeNumber = (value: any): number => {
        const num = Number(value)
        return isNaN(num) || value === null || value === undefined ? 0 : num
      }

      let currentAge = 45
      let retirementAge = 67
      let yearsToRetirement = 0
      let totalRetirementNow = 0
      let totalRetirementAt67 = 0
      let currentBrokerage = 0
      let futureBrokerage = 0
      let taxDeferredNow = 0
      let taxDeferredAt67 = 0
      let taxAdvantageNow = 0
      let taxAdvantageAt67 = 0
      let taxableNow = 0
      let taxableAt67 = 0
      let taxDeferredPercentNow = 0
      let taxAdvantagePercentNow = 0
      let taxablePercentNow = 0
      let taxDeferredPercentAt67 = 0
      let taxAdvantagePercentAt67 = 0
      let taxablePercentAt67 = 0
      let retirementAccountIncome = 0
      let retirementAccountIncomeAfterTax = 0
      let rothIncome = 0
      let rothIncomeAfterTax = 0
      let insuranceIncome = 0
      let insuranceIncomeAfterTax = 0
      let lifetimeAnnuityIncome = 0
      let lifetimeAnnuityIncomeAfterTax = 0
      let socialSecurityTotal = 0
      let socialSecurityAfterTax = 0
      let pensionTotal = 0
      let pensionAfterTax = 0
      let rentalIncome = 0
      let rentalIncomeAfterTax = 0
      let otherInvestmentIncome = 0
      let otherInvestmentIncomeAfterTax = 0
      let totalIncomeBeforeTax = 0
      let totalIncomeAfterTax = 0
      let requiredAnnualIncome = 0
      let availableAnnualIncome = 0
      let annualSurplusOrGap = 0
      let kidsEducationProjections: any[] = []
      let currentDebt = 0
      let yearlyIncomeTimes10 = 0
      let primaryHomeMortgage = 0
      let kidsEducationCost = 0
      let totalFinancialResponsibility = 0
      let netMonthlyIncome = 0
      let grossMonthlyIncome = 0
      let totalMonthlyExpenses = 0
      let monthlySurplus = 0
      let savingsRate = 0
      let lifeInsuranceTotal = 0
      let financialGap = 0
      let monthlyBaseIncome = 0
      let preTax401k = 0
      let preTaxHSA = 0
      let espp = 0
      let currentEmergencyFund = 0
      let suggestedEmergencyFundMin = 0
      let suggestedEmergencyFundMax = 0
      let emergencyFundGap = 0

      currentAge = safeNumber(data?.financialGoals?.current_age) || 45
      retirementAge = safeNumber(data?.financialGoals?.retirement_age) || 67
      yearsToRetirement = Math.max(0, retirementAge - currentAge)

      console.log("[v0] === AGE AND YEARS CALCULATIONS ===")
      console.log("[v0] Current Age:", currentAge)
      console.log("[v0] Retirement Age:", retirementAge)
      console.log("[v0] Years to Retirement:", yearsToRetirement)

      const calculateFutureValue = (
        currentBalance: number,
        annualContribution: number,
        annualReturnRate: number,
        years: number,
      ) => {
        const rate = annualReturnRate / 100
        const balanceGrowth = currentBalance * Math.pow(1 + rate, years)
        let contributionGrowth = 0
        if (annualContribution > 0) {
          const monthlyRate = rate / 12
          const months = years * 12
          const monthlyContribution = annualContribution / 12
          contributionGrowth = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
        }
        const projectedValue = balanceGrowth + contributionGrowth
        console.log("[v0] calculateFutureValue:", {
          currentBalance,
          annualContribution,
          annualReturnRate,
          years,
          rate,
          balanceGrowth,
          contributionGrowth,
          projectedValue,
        })
        return projectedValue
      }

      const current401kSelf = safeNumber(data?.growthStrategy?.current_401k_balance_self)
      const current401kSpouse = safeNumber(data?.growthStrategy?.current_401k_balance_spouse)
      const currentTraditionalIRASelf = safeNumber(data?.growthStrategy?.traditional_ira_balance_self)
      const currentTraditionalIRASpouse = safeNumber(data?.growthStrategy?.traditional_ira_balance_spouse)
      const currentRollover401kSelf = safeNumber(data?.growthStrategy?.rollover_401k_balance_self)
      const currentRollover401kSpouse = safeNumber(data?.growthStrategy?.rollover_401k_balance_spouse)
      const currentRothSelf = safeNumber(data?.growthStrategy?.roth_balance_self)
      const currentRothSpouse = safeNumber(data?.growthStrategy?.roth_balance_spouse)
      const currentHSASelf = safeNumber(data?.growthStrategy?.hsa_balance_self)
      const currentHSASpouse = safeNumber(data?.growthStrategy?.hsa_balance_spouse)

      const annual401kContribSelf = safeNumber(data?.growthStrategy?.monthly_contribution_401k_self) * 12
      const annual401kContribSpouse = safeNumber(data?.growthStrategy?.monthly_contribution_401k_spouse) * 12
      const annualHSAContribSelf = safeNumber(data?.growthStrategy?.hsa_annual_contribution_self)
      const annualHSAContribSpouse = safeNumber(data?.growthStrategy?.hsa_annual_contribution_spouse)

      const return401kSelf = Math.min(Math.max(safeNumber(data?.growthStrategy?.average_return_401k_self) || 7, 0), 20)
      const return401kSpouse = Math.min(
        Math.max(safeNumber(data?.growthStrategy?.average_return_401k_spouse) || 7, 0),
        20,
      )
      const returnIRA = Math.min(Math.max(safeNumber(data?.growthStrategy?.average_return_ira) || 7, 0), 20)
      const returnRothIRA = Math.min(Math.max(safeNumber(data?.growthStrategy?.average_return_roth_ira) || 7, 0), 20)
      const returnHSA = Math.min(Math.max(safeNumber(data?.growthStrategy?.average_return_hsa) || 7, 0), 20)
      const returnBrokerage = Math.min(Math.max(safeNumber(data?.growthStrategy?.average_return_brokerage) || 7, 0), 20)

      console.log("[v0] === RETURN RATES (validated) ===")
      console.log("[v0] 401k Self Return:", return401kSelf)
      console.log("[v0] 401k Spouse Return:", return401kSpouse)
      console.log("[v0] IRA Return:", returnIRA)
      console.log("[v0] Roth Return:", returnRothIRA)
      console.log("[v0] HSA Return:", returnHSA)
      console.log("[v0] Brokerage Return:", returnBrokerage)

      const future401kSelf = calculateFutureValue(
        current401kSelf,
        annual401kContribSelf,
        return401kSelf,
        yearsToRetirement,
      )
      const future401kSpouse = calculateFutureValue(
        current401kSpouse,
        annual401kContribSpouse,
        return401kSpouse,
        yearsToRetirement,
      )
      const futureTraditionalIRASelf = calculateFutureValue(currentTraditionalIRASelf, 0, returnIRA, yearsToRetirement)
      const futureTraditionalIRASpouse = calculateFutureValue(
        currentTraditionalIRASpouse,
        0,
        returnIRA,
        yearsToRetirement,
      )
      const futureRollover401kSelf = calculateFutureValue(currentRollover401kSelf, 0, return401kSelf, yearsToRetirement)
      const futureRollover401kSpouse = calculateFutureValue(
        currentRollover401kSpouse,
        0,
        return401kSpouse,
        yearsToRetirement,
      )
      const futureRothSelf = calculateFutureValue(currentRothSelf, 0, returnRothIRA, yearsToRetirement)
      const futureRothSpouse = calculateFutureValue(currentRothSpouse, 0, returnRothIRA, yearsToRetirement)
      const futureHSASelf = calculateFutureValue(currentHSASelf, annualHSAContribSelf, returnHSA, yearsToRetirement)
      const futureHSASpouse = calculateFutureValue(
        currentHSASpouse,
        annualHSAContribSpouse,
        returnHSA,
        yearsToRetirement,
      )

      totalRetirementNow =
        current401kSelf +
        current401kSpouse +
        currentTraditionalIRASelf +
        currentTraditionalIRASpouse +
        currentRollover401kSelf +
        currentRollover401kSpouse +
        currentRothSelf +
        currentRothSpouse
      // HSA removed from retirement accounts

      totalRetirementAt67 =
        future401kSelf +
        future401kSpouse +
        futureTraditionalIRASelf +
        futureTraditionalIRASpouse +
        futureRollover401kSelf +
        futureRollover401kSpouse +
        futureRothSelf +
        futureRothSpouse
      // HSA removed from retirement accounts

      console.log("[v0] === RETIREMENT ACCOUNT PROJECTIONS ===")
      console.log("[v0] Total Retirement Now:", totalRetirementNow)
      console.log("[v0] Total Retirement At 67:", totalRetirementAt67)

      const brokerageStocks = safeNumber(data?.growthStrategy?.brokerage_stocks)
      const brokerageBonds = safeNumber(data?.growthStrategy?.brokerage_bonds)
      const brokerageETFs = safeNumber(data?.growthStrategy?.brokerage_etfs)
      const brokerageMutualFunds = safeNumber(data?.growthStrategy?.brokerage_mutual_funds)
      currentBrokerage = brokerageStocks + brokerageBonds + brokerageETFs + brokerageMutualFunds

      console.log("[v0] === BROKERAGE ACCOUNTS ===")
      console.log("[v0] Brokerage Stocks:", brokerageStocks)
      console.log("[v0] Brokerage Bonds:", brokerageBonds)
      console.log("[v0] Brokerage ETFs:", brokerageETFs)
      console.log("[v0] Brokerage Mutual Funds:", brokerageMutualFunds)
      console.log("[v0] Total Current Brokerage:", currentBrokerage)

      futureBrokerage = calculateFutureValue(currentBrokerage, 0, returnBrokerage, yearsToRetirement)

      console.log("[v0] Future Brokerage At 67:", futureBrokerage)

      taxDeferredNow =
        current401kSelf +
        current401kSpouse +
        currentTraditionalIRASelf +
        currentTraditionalIRASpouse +
        currentRollover401kSelf +
        currentRollover401kSpouse
      taxDeferredAt67 =
        future401kSelf +
        future401kSpouse +
        futureTraditionalIRASelf +
        futureTraditionalIRASpouse +
        futureRollover401kSelf +
        futureRollover401kSpouse
      taxAdvantageNow = currentRothSelf + currentRothSpouse + currentHSASelf + currentHSASpouse
      taxAdvantageAt67 = futureRothSelf + futureRothSpouse + futureHSASelf + futureHSASpouse
      taxableNow = currentBrokerage
      taxableAt67 = futureBrokerage

      const totalAccountsNow = taxDeferredNow + taxAdvantageNow + taxableNow
      const totalAccountsAt67 = taxDeferredAt67 + taxAdvantageAt67 + taxableAt67

      console.log("[v0] === TAX CATEGORY PERCENTAGES ===")
      console.log("[v0] Total Assets Now:", totalAccountsNow)
      console.log("[v0] Tax Deferred Now:", taxDeferredNow)
      console.log("[v0] Tax Advantage Now:", taxAdvantageNow)
      console.log("[v0] Taxable Now:", taxableNow)
      console.log("[v0] Total Assets At 67:", totalAccountsAt67)
      console.log("[v0] Tax Deferred At 67:", taxDeferredAt67)
      console.log("[v0] Tax Advantage At 67:", taxAdvantageAt67)
      console.log("[v0] Taxable At 67:", taxableAt67)

      taxDeferredPercentNow = totalAccountsNow > 0 ? (taxDeferredNow / totalAccountsNow) * 100 : 0
      taxAdvantagePercentNow = totalAccountsNow > 0 ? (taxAdvantageNow / totalAccountsNow) * 100 : 0
      taxablePercentNow = totalAccountsNow > 0 ? (taxableNow / totalAccountsNow) * 100 : 0

      taxDeferredPercentAt67 = totalAccountsAt67 > 0 ? (taxDeferredAt67 / totalAccountsAt67) * 100 : 0
      taxAdvantagePercentAt67 = totalAccountsAt67 > 0 ? (taxAdvantageAt67 / totalAccountsAt67) * 100 : 0
      taxablePercentAt67 = totalAccountsAt67 > 0 ? (taxableAt67 / totalAccountsAt67) * 100 : 0

      console.log("[v0] Tax Deferred % Now:", taxDeferredPercentNow)
      console.log("[v0] Tax Advantage % Now:", taxAdvantagePercentNow)
      console.log("[v0] Taxable % Now:", taxablePercentNow)
      console.log("[v0] Tax Deferred % At 67:", taxDeferredPercentAt67)
      console.log("[v0] Tax Advantage % At 67:", taxAdvantagePercentAt67)
      console.log("[v0] Taxable % At 67:", taxablePercentAt67)

      const ssSelf = safeNumber(data?.growthStrategy?.ss_monthly_benefit_self) * 12
      const ssSpouse = safeNumber(data?.growthStrategy?.ss_monthly_benefit_spouse) * 12
      socialSecurityTotal = ssSelf + ssSpouse
      socialSecurityAfterTax = socialSecurityTotal * 0.78

      const pensionSelf = safeNumber(data?.growthStrategy?.pension_monthly_amount_self) * 12
      const pensionSpouse = safeNumber(data?.growthStrategy?.pension_monthly_amount_spouse) * 12
      pensionTotal = pensionSelf + pensionSpouse
      pensionAfterTax = pensionTotal * 0.78

      const rentalProperties = data?.growthStrategy?.rental_properties || []
      rentalIncome = Array.isArray(rentalProperties)
        ? rentalProperties.reduce((total: number, property: any) => {
            return total + safeNumber(property.monthly_income) * 12
          }, 0)
        : 0
      rentalIncomeAfterTax = rentalIncome * 0.78

      retirementAccountIncome =
        (totalRetirementAt67 - (futureRothSelf + futureRothSpouse + futureHSASelf + futureHSASpouse)) / 20 // Assuming 20 year retirement draw-down, exclude Roth/HSA
      retirementAccountIncomeAfterTax = retirementAccountIncome * 0.78

      rothIncome = (futureRothSelf + futureRothSpouse) / 20 // Divide by 20 years for annual income
      rothIncomeAfterTax = rothIncome // Tax-free

      if (
        data?.growthStrategy?.has_annuities &&
        data?.growthStrategy?.annuities &&
        Array.isArray(data.growthStrategy.annuities)
      ) {
        lifetimeAnnuityIncome = data.growthStrategy.annuities
          .filter((annuity: any) => annuity.type === "lifetime")
          .reduce((total: number, annuity: any) => {
            return total + safeNumber(annuity.guaranteed_income, 0)
          }, 0)
      }
      lifetimeAnnuityIncomeAfterTax = lifetimeAnnuityIncome * 0.78 // Apply 22% tax

      console.log("[v0] === ANNUITY INCOME ===")
      console.log("[v0] Lifetime Annuity Income (Annual Before Tax):", lifetimeAnnuityIncome)
      console.log("[v0] Lifetime Annuity Income (Annual After Tax):", lifetimeAnnuityIncomeAfterTax)

      otherInvestmentIncome = 0
      otherInvestmentIncomeAfterTax = otherInvestmentIncome * 0.78

      insuranceIncome = 0
      if (
        data?.defenseStrategy?.life_insurance_policies &&
        Array.isArray(data.defenseStrategy.life_insurance_policies)
      ) {
        insuranceIncome = data.defenseStrategy.life_insurance_policies.reduce((total: number, policy: any) => {
          if (policy.is_cash_value && policy.expected_income_stream) {
            return total + (Number(policy.expected_income_stream) || 0)
          }
          return total
        }, 0)
      }
      insuranceIncomeAfterTax = insuranceIncome // Tax-free

      totalIncomeBeforeTax =
        retirementAccountIncome +
        rothIncome +
        socialSecurityTotal +
        pensionTotal +
        rentalIncome +
        otherInvestmentIncome +
        insuranceIncome +
        lifetimeAnnuityIncome // Add annuity income to total
      totalIncomeAfterTax =
        retirementAccountIncomeAfterTax +
        rothIncomeAfterTax +
        socialSecurityAfterTax +
        pensionAfterTax +
        rentalIncomeAfterTax +
        otherInvestmentIncomeAfterTax +
        insuranceIncomeAfterTax +
        lifetimeAnnuityIncomeAfterTax // Add annuity income to total

      console.log("[v0] === INCOME STREAMS (ANNUAL) ===")
      console.log("[v0] From Retirement Accounts (Annual Before Tax):", retirementAccountIncome)
      console.log("[v0] From Retirement Accounts (Annual After Tax):", retirementAccountIncomeAfterTax)
      console.log("[v0] From Roth (Annual Before Tax):", rothIncome)
      console.log("[v0] From Roth (Annual After Tax):", rothIncomeAfterTax)
      console.log("[v0] Social Security (Annual Before Tax):", socialSecurityTotal)
      console.log("[v0] Social Security (Annual After Tax):", socialSecurityAfterTax)
      console.log("[v0] Pension (Annual Before Tax):", pensionTotal)
      console.log("[v0] Pension (Annual After Tax):", pensionAfterTax)
      console.log("[v0] Rental Income (Annual Before Tax):", rentalIncome)
      console.log("[v0] Rental Income (Annual After Tax):", rentalIncomeAfterTax)
      console.log("[v0] Insurance Income (Annual Before Tax):", insuranceIncome)
      console.log("[v0] Insurance Income (Annual After Tax):", insuranceIncomeAfterTax)
      console.log("[v0] Total Before Tax (Annual):", totalIncomeBeforeTax)
      console.log("[v0] Total After Tax (Annual):", totalIncomeAfterTax)

      requiredAnnualIncome = data?.financialGoals?.annual_retirement_income_inflation || 0
      availableAnnualIncome = Math.round(totalIncomeBeforeTax)
      annualSurplusOrGap = availableAnnualIncome - requiredAnnualIncome

      console.log("[v0] === INCOME ANALYSIS (UPDATED) ===")
      console.log("[v0] Required Annual Income (from Financial Goals - Inflation Adjusted):", requiredAnnualIncome)
      console.log("[v0] Available Annual Income (Before Tax):", availableAnnualIncome)

      const calculateKidsEducationProjections = () => {
        if (!Array.isArray(data?.financialGoals?.children) || data?.financialGoals.children.length === 0) {
          return []
        }

        return data?.financialGoals.children.map((child: any) => {
          console.log("[v0] === CHILD DATA RAW ===", JSON.stringify(child, null, 2))
          const childAge = safeNumber(child.current_age)
          const collegeCost = safeNumber(child.estimated_total_needed)
          const yearsUntilCollege = Math.max(0, 18 - childAge)
          const months = yearsUntilCollege * 12

          // Fix: Use correct field names from financial goals form
          // Form saves: current_savings_amount, monthly_savings_amount, avg_annual_return_rate
          const currentSavings =
            safeNumber(child.current_savings_amount) || 
            safeNumber(child.current_savings) || 
            safeNumber(data?.growthStrategy?.kids_education_savings_amount) || 
            0
          const returnRate =
            safeNumber(child.avg_annual_return_rate) ||
            safeNumber(child.expected_return) ||
            safeNumber(data?.growthStrategy?.kids_education_savings_return_rate) ||
            7
          const monthlyContribution =
            safeNumber(child.monthly_savings_amount) ||
            safeNumber(child.monthly_contribution) ||
            safeNumber(data?.growthStrategy?.kids_education_monthly_savings) ||
            0

          const monthly529 = safeNumber(data?.savingsVsSpending?.monthly_college_529) || 0
          const effectiveMonthlyContribution = monthlyContribution > 0 ? monthlyContribution : monthly529

          const monthlyRate = returnRate / 100 / 12

          // Growth of current savings
          const currentSavingsGrowth = currentSavings * Math.pow(1 + monthlyRate, months)

          // Growth of monthly contributions
          let contributionGrowth = 0
          if (effectiveMonthlyContribution > 0 && months > 0) {
            contributionGrowth = effectiveMonthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          }

          const totalAtCollege = currentSavingsGrowth + contributionGrowth
          const fundingGap = collegeCost - totalAtCollege
          const fundingPercentage = collegeCost > 0 ? (totalAtCollege / collegeCost) * 100 : 0

          console.log("[v0] === KIDS EDUCATION PROJECTION FOR", child.name, "===")
          console.log("[v0] Child Age:", childAge)
          console.log("[v0] Years Until College:", yearsUntilCollege)
          console.log("[v0] Current Savings:", currentSavings)
          console.log("[v0] Monthly Contribution:", effectiveMonthlyContribution)
          console.log("[v0] 529 Monthly Contribution:", monthly529)
          console.log("[v0] Return Rate:", returnRate)
          console.log("[v0] Current Savings Growth:", currentSavingsGrowth)
          console.log("[v0] Contribution Growth:", contributionGrowth)
          console.log("[v0] Total At College:", totalAtCollege)
          console.log("[v0] College Cost:", collegeCost)
          console.log("[v0] Funding Gap:", fundingGap)
          console.log("[v0] Funding %:", fundingPercentage)

          return {
            name: child.name,
            age: childAge,
            yearsUntilCollege,
            currentSavings,
            monthlyContribution: effectiveMonthlyContribution,
            returnRate,
            totalAtCollege,
            collegeCost,
            fundingGap: Math.max(0, fundingGap),
            fundingPercentage,
            status:
              fundingPercentage >= 100
                ? "Fully Funded ✅"
                : fundingPercentage >= 75
                  ? "Nearly Funded ⚠️"
                  : "Underfunded 🚨",
          }
        })
      }

      kidsEducationProjections = calculateKidsEducationProjections()

      // FIX: Use a different variable name for loans to avoid redeclaration.
      const savingsVsSpendingLoans = data?.savingsVsSpending?.loans
      if (savingsVsSpendingLoans && typeof savingsVsSpendingLoans === "object") {
        currentDebt = Object.values(savingsVsSpendingLoans).reduce((total: number, loan: any) => {
          if (loan?.enabled && loan?.amount) {
            return total + safeNumber(loan.amount)
          }
          return total
        }, 0)
      }
      console.log("[v0] Current Debt Calculation:", { savingsVsSpendingLoans, currentDebt })

      // Pre_Tax_401k = (monthly_contribution_401k_self + monthly_contribution_401k_spouse)
      const monthly401kSelf = safeNumber(data?.growthStrategy?.monthly_contribution_401k_self) || 0
      const monthly401kSpouse = safeNumber(data?.growthStrategy?.monthly_contribution_401k_spouse) || 0
      preTax401k = monthly401kSelf + monthly401kSpouse

      // Pre_Tax_HSA = (hsa_annual_contribution_self + hsa_annual_contribution_spouse) / 12
      const annualHSASelf = safeNumber(data?.growthStrategy?.hsa_annual_contribution_self) || 0
      const annualHSASpouse = safeNumber(data?.growthStrategy?.hsa_annual_contribution_spouse) || 0
      preTaxHSA = (annualHSASelf + annualHSASpouse) / 12

      monthlyBaseIncome = safeNumber(data?.savingsVsSpending?.annual_gross_income) / 12 || 0
      espp = safeNumber(data?.savingsVsSpending?.espp) || 0

      netMonthlyIncome = safeNumber(data?.savingsVsSpending?.net_monthly_income) || 0
      grossMonthlyIncome = safeNumber(data?.savingsVsSpending?.annual_gross_income) / 12 || 0

      console.log("[v0] Net Monthly Income (from Savings vs Spending):", netMonthlyIncome)
      console.log("[v0] Gross Monthly Income:", grossMonthlyIncome)

      const budgetHousing = safeNumber(data?.savingsVsSpending?.total_housing) || 0
      const budgetRetirement = safeNumber(data?.savingsVsSpending?.total_retirement_savings) || 0

      const monthlyCollege529 = safeNumber(data?.savingsVsSpending?.monthly_college_529) || 0
      const monthlyCashValueLifeInsurance = safeNumber(data?.savingsVsSpending?.monthly_cash_value_life_insurance) || 0

      const monthlyTermLifePremiums = safeNumber(data?.savingsVsSpending?.monthly_term_life_premiums) || 0

      const additionalSavings = monthlyCollege529 + monthlyCashValueLifeInsurance

      const budgetLifestyle = (safeNumber(data?.savingsVsSpending?.total_lifestyle) || 0) + monthlyTermLifePremiums
      const budgetShortTerm = safeNumber(data?.savingsVsSpending?.total_short_term) || 0

      const loans = data?.savingsVsSpending?.loans
      let totalLoanPayments = 0
      if (loans && typeof loans === "object") {
        totalLoanPayments = Object.values(loans).reduce((total: number, loan: any) => {
          if (loan?.enabled && loan?.payment) {
            return total + safeNumber(loan.payment)
          }
          return total
        }, 0)
      }

      totalMonthlyExpenses =
        budgetHousing + budgetRetirement + budgetLifestyle + budgetShortTerm + totalLoanPayments + additionalSavings

      console.log("[v0] Budget Categories:", {
        housing: budgetHousing,
        retirement: budgetRetirement,
        lifestyle: budgetLifestyle,
        shortTerm: budgetShortTerm,
        loanPayments: totalLoanPayments,
        college529: monthlyCollege529,
        cashValueLifeInsurance: monthlyCashValueLifeInsurance,
        termLifePremiums: monthlyTermLifePremiums,
        additionalSavings: additionalSavings,
        total: totalMonthlyExpenses,
      })

      monthlySurplus = netMonthlyIncome - totalMonthlyExpenses
      savingsRate = grossMonthlyIncome > 0 ? (monthlySurplus / grossMonthlyIncome) * 100 : 0

      currentEmergencyFund = safeNumber(data?.savingsVsSpending?.monthly_emergency_fund) || 0
      suggestedEmergencyFundMin = Math.round(netMonthlyIncome * 9)
      suggestedEmergencyFundMax = Math.round(netMonthlyIncome * 12)
      emergencyFundGap = Math.max(0, suggestedEmergencyFundMin - currentEmergencyFund)

      console.log("[v0] ===EMERGENCY FUND ANALYSIS ===")
      console.log("[v0] Current Emergency Fund:", currentEmergencyFund)
      console.log("[v0] Suggested Min (9 months):", suggestedEmergencyFundMin)
      console.log("[v0] Suggested Max (12 months):", suggestedEmergencyFundMax)
      console.log("[v0] Emergency Fund Gap:", emergencyFundGap)

      yearlyIncomeTimes10 = (safeNumber(data?.savingsVsSpending?.annual_gross_income) + 0) * 10 // Assuming no spouse income for now
      primaryHomeMortgage = safeNumber(data?.growthStrategy?.primary_home_mortgage_balance)
      kidsEducationCost = Array.isArray(data?.financialGoals?.children)
        ? data?.financialGoals.children.reduce((total: number, child: any) => {
            return total + safeNumber(child.estimated_total_needed)
          }, 0)
        : 0

      // Don't double-count mortgage if it's in current debt
      totalFinancialResponsibility = currentDebt + yearlyIncomeTimes10 + kidsEducationCost

      let childrenInsuranceTotal = 0
      if (
        data?.defenseStrategy?.children_life_insurance &&
        Array.isArray(data?.defenseStrategy?.children_life_insurance)
      ) {
        childrenInsuranceTotal = data.defenseStrategy.children_life_insurance.reduce((sum: number, child: any) => {
          return sum + (safeNumber(child?.coverage_amount) || 0)
        }, 0)
      }

      lifeInsuranceTotal =
        // Removed: safeNumber(data?.defenseStrategy?.work_life_coverage_self) +
        // Removed: safeNumber(data?.defenseStrategy?.work_life_coverage_spouse) +
        safeNumber(data?.defenseStrategy?.personal_life_coverage_self) +
        safeNumber(data?.defenseStrategy?.personal_life_coverage_spouse) +
        childrenInsuranceTotal // Now includes children's insurance but NOT work life insurance

      financialGap = Math.max(0, totalFinancialResponsibility - lifeInsuranceTotal) // Calculate financialGap

      console.log("[v0] === FINANCIAL RESPONSIBILITY GAP ANALYSIS ===")
      console.log("[v0] Total Financial Responsibility:", totalFinancialResponsibility)
      console.log("[v0] Total Life Insurance Coverage (excluding work life):", lifeInsuranceTotal)
      console.log("[v0] Children Life Insurance Total:", childrenInsuranceTotal)
      console.log("[v0] Financial Gap:", financialGap)

      console.log("[v0] === FINANCIAL RESPONSIBILITY ===")
      console.log("[v0] Current Debt:", currentDebt)
      console.log("[v0] 10x Yearly Income:", yearlyIncomeTimes10)
      console.log("[v0] Mortgage Balance:", primaryHomeMortgage)
      console.log("[v0] Kids Education Cost:", kidsEducationCost)
      console.log("[v0] Total Financial Responsibility:", totalFinancialResponsibility)

      setCalculatedData({
        currentAge,
        retirementAge,
        yearsToRetirement,
        totalRetirementNow,
        taxDeferredNow,
        taxAdvantageNow,
        taxableNow,
        taxDeferredPercentNow,
        taxAdvantagePercentNow,
        taxablePercentNow,
        totalRetirementAt67,
        taxDeferredAt67,
        taxAdvantageAt67,
        taxableAt67,
        taxDeferredPercentAt67,
        taxAdvantagePercentAt67,
        taxablePercentAt67,
        retirementAccountIncome,
        retirementAccountIncomeAfterTax,
        rothIncome,
        rothIncomeAfterTax,
        // Adding insurance income to calculatedData
        insuranceIncome,
        insuranceIncomeAfterTax,
        lifetimeAnnuityIncome,
        lifetimeAnnuityIncomeAfterTax,
        socialSecurityTotal,
        socialSecurityAfterTax,
        pensionTotal,
        pensionAfterTax,
        rentalIncome,
        rentalIncomeAfterTax,
        otherInvestmentIncome,
        otherInvestmentIncomeAfterTax,
        totalIncomeBeforeTax,
        totalIncomeAfterTax,
        requiredAnnualIncome,
        availableAnnualIncome,
        annualSurplusOrGap,
        netMonthlyIncome,
        grossMonthlyIncome,
        totalMonthlyExpenses,
        monthlySurplus,
        savingsRate,
        currentDebt, // Declared and assigned in useEffect
        yearlyIncomeTimes10, // Declared and assigned in useEffect
        primaryHomeMortgage, // Declared and assigned in useEffect
        kidsEducationCost, // Declared and assigned in useEffect
        totalFinancialResponsibility, // Declared and assigned in useEffect
        lifeInsuranceTotal, // Declared and assigned in useEffect
        financialGap, // Declared and assigned in useEffect
        kidsEducationProjections: kidsEducationProjections, // Keep this for UI display, but exclude from save
        // Other potentially calculated fields that are not explicitly defined in the changes but might be used later
        currentBrokerage,
        futureBrokerage,
        monthlyBaseIncome,
        preTax401k,
        preTaxHSA,
        espp,
        // Include emergency fund metrics in calculatedData
        currentEmergencyFund,
        suggestedEmergencyFundMin,
        suggestedEmergencyFundMax,
        emergencyFundGap,
      })

      setReportCalculated(true)
      setCalculationError(false) // Reset error state on successful calculation
      console.log("[v0] Calculations completed successfully")
    } catch (error) {
      console.error("[v0] Error during calculations:", error)
      setCalculationError(true) // Set error state to true
      setReportCalculated(false) // Ensure report is not marked as calculated
    }
    // Add dependencies to useEffect to re-run calculations if inputs change
  }, [financialGoals, growthStrategy, defenseStrategy, savingsVsSpending, profile])

  useEffect(() => {
    if (calculatedData && reportCalculated && !calculationError) {
      console.log("[v0] Triggering auto-save with calculated data")
      saveFinalReport(calculatedData)
    } else {
      console.log("[v0] Auto-save conditions not met:", {
        calculatedData: !!calculatedData,
        reportCalculated,
        calculationError,
      })
    }
  }, [calculatedData, reportCalculated, calculationError]) // Depend on states that indicate calculation completion

  const saveFinalReport = async (reportData: any) => {
    setIsSavingReport(true)
    setSaveMessage(null)

    try {
      console.log("[v0] Sending final report to save API...")
      const { kidsEducationProjections, ...dataToSave } = reportData

      const snakeCaseData = {
        current_age: dataToSave.currentAge,
        retirement_age: dataToSave.retirementAge,
        years_to_retirement: dataToSave.yearsToRetirement,
        total_retirement_now: dataToSave.totalRetirementNow,
        tax_deferred_now: dataToSave.taxDeferredNow,
        tax_advantage_now: dataToSave.taxAdvantageNow,
        taxable_now: dataToSave.taxableNow,
        tax_deferred_percent_now: dataToSave.taxDeferredPercentNow,
        tax_advantage_percent_now: dataToSave.taxAdvantagePercentNow,
        taxable_percent_now: dataToSave.taxablePercentNow,
        total_retirement_at_67: dataToSave.totalRetirementAt67,
        tax_deferred_at_67: dataToSave.taxDeferredAt67,
        tax_advantage_at_67: dataToSave.taxAdvantageAt67,
        taxable_at_67: dataToSave.taxableAt67,
        tax_deferred_percent_at_67: dataToSave.taxDeferredPercentAt67,
        tax_advantage_percent_at_67: dataToSave.taxAdvantagePercentAt67,
        taxable_percent_at_67: dataToSave.taxablePercentAt67,
        retirement_account_income: dataToSave.retirementAccountIncome,
        retirement_account_income_after_tax: dataToSave.retirementAccountIncomeAfterTax,
        roth_income: dataToSave.rothIncome,
        roth_income_after_tax: dataToSave.rothIncomeAfterTax,
        social_security_total: dataToSave.socialSecurityTotal,
        social_security_after_tax: dataToSave.socialSecurityAfterTax,
        pension_total: dataToSave.pensionTotal,
        pension_after_tax: dataToSave.pensionAfterTax,
        rental_income: dataToSave.rentalIncome,
        rental_income_after_tax: dataToSave.rentalIncomeAfterTax,
        other_investment_income: dataToSave.otherInvestmentIncome,
        other_investment_income_after_tax: dataToSave.otherInvestmentIncomeAfterTax,
        total_income_before_tax: dataToSave.totalIncomeBeforeTax,
        total_income_after_tax: dataToSave.totalIncomeAfterTax,
        required_annual_income: dataToSave.requiredAnnualIncome,
        available_annual_income: dataToSave.availableAnnualIncome,
        annual_surplus_or_gap: dataToSave.annualSurplusOrGap,
        net_monthly_income: dataToSave.netMonthlyIncome,
        gross_monthly_income: dataToSave.grossMonthlyIncome,
        total_monthly_expenses: dataToSave.totalMonthlyExpenses,
        monthly_surplus: dataToSave.monthlySurplus,
        savings_rate: dataToSave.savingsRate,
        current_debt: dataToSave.currentDebt,
        yearly_income_times_10: dataToSave.yearlyIncomeTimes10,
        primary_home_mortgage: dataToSave.primaryHomeMortgage,
        kids_education_cost: dataToSave.kidsEducationCost,
        total_financial_responsibility: dataToSave.totalFinancialResponsibility,
        life_insurance_total: dataToSave.lifeInsuranceTotal,
        financial_gap: dataToSave.financialGap,
        // Include emergency fund metrics in snake_caseData
        current_emergency_fund: dataToSave.currentEmergencyFund,
        suggested_emergency_fund_min: dataToSave.suggestedEmergencyFundMin,
        suggested_emergency_fund_max: dataToSave.suggestedEmergencyFundMax,
        emergency_fund_gap: dataToSave.emergencyFundGap,
        // Include other calculated fields that are not explicitly defined in the changes but might be used later
        current_brokerage: Math.round(dataToSave.currentBrokerage),
        future_brokerage: Math.round(dataToSave.futureBrokerage),
        monthly_base_income: Math.round(dataToSave.monthlyBaseIncome),
        pre_tax_401k: Math.round(dataToSave.preTax401k),
        pre_tax_hsa: Math.round(dataToSave.preTaxHSA),
        espp: Math.round(dataToSave.espp),
      }

      const response = await fetch("/api/save-final-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snakeCaseData),
      })

      const result = await response.json()
      console.log("[v0] Save API response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to save final report")
      }

      setSaveMessage("Final report saved successfully!")
      console.log("[v0] Final report saved to database successfully")
    } catch (error) {
      console.error("[v0] Error saving final report:", error)
      setSaveMessage(`Failed to save final report: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSavingReport(false)
    }
  }

  const handleSendReport = async () => {
    setIsSendingEmail(true)
    setEmailMessage(null)
    try {
      console.log("[v0] Sending report via email...")
      const response = await fetch("/api/send-report-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportData: calculatedData,
          recipient: profile?.email, // Assuming profile has an email field
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to send email")
      }
      setEmailMessage("Report sent successfully to your email!")
      console.log("[v0] Report email sent successfully")
    } catch (error) {
      console.error("[v0] Error sending email:", error)
      setEmailMessage(`Failed to send report: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Handle error state for rendering
  if (calculationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full border-2 border-red-300 shadow-xl">
          <CardHeader className="bg-red-600 text-white">
            <CardTitle className="text-2xl">Error Loading Report</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-red-700 font-medium mb-4">
              We encountered an error while calculating your financial report. Please try refreshing the page.
            </p>
            <p className="text-sm text-slate-600 mb-6">Error details: {calculationError}</p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="default">
                Refresh Page
              </Button>
              <Button onClick={() => router.push("/")} variant="outline">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Add loading state for when calculations are in progress
  if (!calculatedData || !reportCalculated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating your final report...</p>
        </div>
      </div>
    )
  }

  const {
    currentAge,
    retirementAge,
    yearsToRetirement,
    totalRetirementNow,
    totalRetirementAt67,
    currentBrokerage,
    futureBrokerage,
    taxDeferredNow,
    taxDeferredAt67,
    taxAdvantageNow,
    taxAdvantageAt67,
    taxableNow,
    taxableAt67,
    taxDeferredPercentNow,
    taxAdvantagePercentNow,
    taxablePercentNow,
    taxDeferredPercentAt67,
    taxAdvantagePercentAt67,
    taxablePercentAt67,
    retirementAccountIncome,
    retirementAccountIncomeAfterTax,
    rothIncome,
    rothIncomeAfterTax,
    insuranceIncome,
    insuranceIncomeAfterTax,
    lifetimeAnnuityIncome,
    lifetimeAnnuityIncomeAfterTax,
    socialSecurityTotal,
    socialSecurityAfterTax,
    pensionTotal,
    pensionAfterTax,
    rentalIncome,
    rentalIncomeAfterTax,
    otherInvestmentIncome,
    otherInvestmentIncomeAfterTax,
    totalIncomeBeforeTax,
    totalIncomeAfterTax,
    requiredAnnualIncome,
    availableAnnualIncome,
    annualSurplusOrGap,
    netMonthlyIncome,
    grossMonthlyIncome,
    totalMonthlyExpenses,
    monthlySurplus,
    savingsRate,
    currentDebt, // Declared and assigned in useEffect
    yearlyIncomeTimes10, // Declared and assigned in useEffect
    primaryHomeMortgage, // Declared and assigned in useEffect
    kidsEducationCost, // Declared and assigned in useEffect
    totalFinancialResponsibility, // Declared and assigned in useEffect
    lifeInsuranceTotal, // Declared and assigned in useEffect
    financialGap, // Declared and assigned in useEffect
    monthlyBaseIncome,
    preTax401k,
    preTaxHSA,
    espp,
    // Destructure emergency fund metrics
    currentEmergencyFund,
    suggestedEmergencyFundMin,
    suggestedEmergencyFundMax,
    emergencyFundGap,
    kidsEducationProjections = [], // Add default empty array
  } = calculatedData || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {clientId && (
          // Use returnUrl for proper navigation back to advisor/CEO dashboard
          <Button
            variant="outline"
            onClick={() => {
              if (returnUrl) {
                router.push(returnUrl)
              } else {
                router.push("/home")
              }
            }}
            className="border-emerald-600/30 hover:bg-emerald-950/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {returnUrl ? "Dashboard" : "Home"}
          </Button>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 shadow-lg sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(returnUrl || "/home")}
                className="text-white hover:bg-blue-500"
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Your Financial Report</h1>
            </div>
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes("successfully") ? "text-green-300" : "text-red-300"}`}>
                  {saveMessage}
                </span>
              )}
              {emailMessage && (
                <span
                  className={`text-sm ${emailMessage.includes("successfully") ? "text-green-300" : "text-red-300"}`}
                >
                  {emailMessage}
                </span>
              )}
              <Button
                onClick={() => {
                  // Manually trigger save if needed, e.g., on button click
                  if (calculatedData && !calculationError) {
                    saveFinalReport(calculatedData)
                  }
                }}
                disabled={isSavingReport}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                {isSavingReport ? "Saving..." : "Save Report"}
              </Button>
              <Button
                onClick={handleSendReport}
                disabled={isSendingEmail}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                {isSendingEmail ? "Sending..." : "Email Report"}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push(returnUrl || "/home")} className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Comprehensive Financial Report</h1>
            <p className="text-lg text-slate-600">Based on your assessment responses</p>
          </div>

          <div className="space-y-6">
            {/* Savings vs Spending Analysis */}
            <Card className="mb-8 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <CardTitle className="text-2xl">Monthly Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Net Income card - simplified */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
                    <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-6 h-6" />
                      Net Income
                    </h3>
                    <div className="flex justify-center">
                      <span className="text-2xl font-bold text-emerald-900">
                        ${Math.round(netMonthlyIncome || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Total Expenses</h3>
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      ${Math.round(totalMonthlyExpenses || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 mt-2">
                      {grossMonthlyIncome > 0 ? Math.round((totalMonthlyExpenses / grossMonthlyIncome) * 100) : 0}% of
                      income
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Monthly Surplus</h3>
                      <PiggyBank className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className={`text-3xl font-bold ${monthlySurplus >= 0 ? "text-blue-600" : "text-red-600"}`}>
                      ${Math.round(monthlySurplus || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 mt-2">Savings Rate: {Math.round(savingsRate || 0)}%</div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Financial Health Status</h4>
                  {savingsRate >= 20 ? (
                    <p className="text-green-700 font-medium">
                      ✓ Excellent! You're saving {Math.round(savingsRate)}% of your income. Keep up the great work!
                    </p>
                  ) : savingsRate >= 10 ? (
                    <p className="text-blue-700 font-medium">
                      ⚠ Good progress at {Math.round(savingsRate)}%. Consider increasing savings to 20% or more for
                      optimal financial health.
                    </p>
                  ) : monthlySurplus > 0 ? (
                    <p className="text-orange-700 font-medium">
                      ⚠ Low savings rate at {Math.round(savingsRate)}%. Review expenses and increase savings
                      contributions.
                    </p>
                  ) : (
                    <p className="text-red-700 font-medium">
                      ⚠ Critical: Spending exceeds income by ${Math.round(Math.abs(monthlySurplus)).toLocaleString()}
                      /month. Immediate budget adjustment needed.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl border-2 border-blue-300">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Emergency Fund Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-semibold text-blue-700 mb-1">Current Emergency Fund</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${Math.round(currentEmergencyFund).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-700 mb-1">Suggested Range</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${Math.round(suggestedEmergencyFundMin).toLocaleString()} - $
                    {Math.round(suggestedEmergencyFundMax).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">9-12 months of net income</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-700 mb-1">Gap to Minimum</div>
                  <div className={`text-2xl font-bold ${emergencyFundGap > 0 ? "text-red-600" : "text-green-600"}`}>
                    {emergencyFundGap > 0 ? `-$${Math.round(emergencyFundGap).toLocaleString()}` : "Fully Funded ✓"}
                  </div>
                </div>
              </div>
              {emergencyFundGap > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Recommendation:</strong> Build your emergency fund to cover at least 9 months of expenses ($
                    {Math.round(suggestedEmergencyFundMin).toLocaleString()}) before increasing investment
                    contributions. This provides a crucial safety net for unexpected expenses or income loss.
                  </p>
                </div>
              )}
            </div>

            {/* Retirement & Investment Accounts */}
            <Card className="mb-8 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-2xl">Account Values at Age {retirementAge}</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Retirement Accounts</h3>
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Now</span>
                        <span className="text-xl font-bold text-slate-900">
                          ${Math.round(totalRetirementNow || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">At Age {retirementAge}</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${Math.round(totalRetirementAt67 || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Investment Accounts</h3>
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Now</span>
                        <span className="text-xl font-bold text-slate-900">
                          ${Math.round(taxableNow || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">At Age {retirementAge}</span>
                        <span className="text-2xl font-bold text-purple-600">
                          ${Math.round(taxableAt67 || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                    <h4 className="text-sm font-bold text-orange-700 mb-3 uppercase tracking-wide">Taxable Accounts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Now</span>
                        <span className="font-bold text-slate-900">
                          ${Math.round(taxableNow || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Percentage</span>
                        <span className="font-bold text-orange-600">{Math.round(taxablePercentNow || 0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">At Age {retirementAge}</span>
                        <span className="font-bold text-orange-700">
                          ${Math.round(taxableAt67 || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Percentage</span>
                        <span className="font-bold text-orange-600">{Math.round(taxablePercentAt67 || 0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                    <h4 className="text-sm font-bold text-red-700 mb-3 uppercase tracking-wide">
                      Tax Deferred Accounts
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Now</span>
                        <span className="font-bold text-slate-900">
                          ${Math.round(taxDeferredNow || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Percentage</span>
                        <span className="font-bold text-red-600">{Math.round(taxDeferredPercentNow || 0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">At Age {retirementAge}</span>
                        <span className="font-bold text-red-700">
                          ${Math.round(taxDeferredAt67 || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Percentage</span>
                        <span className="font-bold text-red-600">{Math.round(taxDeferredPercentAt67 || 0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <h4 className="text-sm font-bold text-green-700 mb-3 uppercase tracking-wide">
                      Tax Advantage Accounts
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Now</span>
                        <span className="font-bold text-slate-900">
                          ${Math.round(taxAdvantageNow || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Percentage</span>
                        <span className="font-bold text-green-600">{Math.round(taxAdvantagePercentNow || 0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">At Age {retirementAge}</span>
                        <span className="font-bold text-green-700">
                          ${Math.round(taxAdvantageAt67 || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-sm">Percentage</span>
                        <span className="font-bold text-green-600">{Math.round(taxAdvantagePercentAt67 || 0)}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">Roth, HSA - Tax-Free Growth!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Income Streams */}
            <Card className="mb-8 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <CardTitle className="text-2xl">Retirement Income Streams</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-3 px-4 font-bold text-slate-700">Income Source</th>
                        <th className="text-right py-3 px-4 font-bold text-slate-700">Before Tax (Annual)</th>
                        <th className="text-right py-3 px-4 font-bold text-slate-700">After 22% Tax (Annual)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium">From Retirement Accounts</td>
                        <td className="text-right py-4 px-4 font-bold text-blue-600">
                          ${Math.round(retirementAccountIncome).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">
                          ${Math.round(retirementAccountIncomeAfterTax).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium">From Roth Accounts</td>
                        <td className="text-right py-4 px-4 font-bold text-blue-600">
                          ${Math.round(rothIncome).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">
                          ${Math.round(rothIncomeAfterTax).toLocaleString()}
                        </td>
                      </tr>
                      {insuranceIncome > 0 && (
                        <tr className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-4 px-4 font-medium">Insurance Income (Cash Value)</td>
                          <td className="text-right py-4 px-4 font-bold text-blue-600">
                            ${Math.round(insuranceIncome).toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-green-600">
                            ${Math.round(insuranceIncomeAfterTax).toLocaleString()}
                          </td>
                        </tr>
                      )}
                      {lifetimeAnnuityIncome > 0 && (
                        <tr className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-4 px-4 font-medium">Annuity Income (Lifetime)</td>
                          <td className="text-right py-4 px-4 font-bold text-blue-600">
                            ${Math.round(lifetimeAnnuityIncome).toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-green-600">
                            ${Math.round(lifetimeAnnuityIncomeAfterTax).toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium">Social Security</td>
                        <td className="text-right py-4 px-4 font-bold text-blue-600">
                          ${Math.round(socialSecurityTotal).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">
                          ${Math.round(socialSecurityAfterTax).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium">Pension</td>
                        <td className="text-right py-4 px-4 font-bold text-blue-600">
                          ${Math.round(pensionTotal).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">
                          ${Math.round(pensionAfterTax).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium">Rental Income</td>
                        <td className="text-right py-4 px-4 font-bold text-blue-600">
                          ${Math.round(rentalIncome).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">
                          ${Math.round(rentalIncomeAfterTax).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-4 px-4 font-medium">Other Investment Income</td>
                        <td className="text-right py-4 px-4 font-bold text-blue-600">
                          ${Math.round(otherInvestmentIncome).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">
                          ${Math.round(otherInvestmentIncomeAfterTax).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                        <td className="py-4 px-4 text-lg">TOTAL</td>
                        <td className="text-right py-4 px-4 text-lg text-blue-700">
                          ${Math.round(totalIncomeBeforeTax).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 text-lg text-green-700">
                          ${Math.round(totalIncomeAfterTax).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Retirement Income Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-sm font-medium text-blue-600 mb-2">Required Annual Income</div>
                      <div className="text-2xl font-bold text-blue-700">
                        ${Math.round(requiredAnnualIncome || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="text-sm font-medium text-green-600 mb-2">Available Annual Income</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${Math.round(availableAnnualIncome || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {annualSurplusOrGap < 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                      <p className="text-red-700 font-medium">
                        ⚠ Your projected retirement income falls short by $
                        {Math.round(Math.abs(annualSurplusOrGap)).toLocaleString()}
                        /year. Consider increasing retirement contributions or adjusting retirement lifestyle
                        expectations.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {kidsEducationProjections.length > 0 && (
              <Card className="mb-8 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="text-2xl">Kids Education Funding Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    {kidsEducationProjections.map((projection: any, index: number) => (
                      <div
                        key={index}
                        className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200"
                      >
                        <h4 className="text-xl font-bold text-slate-900 mb-4">{projection.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-slate-600">Current Age</div>
                            <div className="text-lg font-bold text-slate-900">{projection.age} years</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Years Until College</div>
                            <div className="text-lg font-bold text-slate-900">{projection.yearsUntilCollege} years</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Current Savings</div>
                            <div className="text-lg font-bold text-slate-900">
                              ${Math.round(projection.currentSavings).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Monthly Contribution</div>
                            <div className="text-lg font-bold text-slate-900">
                              ${Math.round(projection.monthlyContribution).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Growing at</div>
                            <div className="text-lg font-bold text-slate-900">{projection.returnRate}% annually</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-600">Total Education Cost</div>
                            <div className="text-lg font-bold text-blue-700">
                              ${Math.round(projection.collegeCost).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-slate-700">Projected Savings at College Start</span>
                            <span className="font-bold text-slate-900">
                              ${Math.round(projection.totalAtCollege).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full transition-all ${projection.fundingPercentage >= 100 ? "bg-green-500" : projection.fundingPercentage >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(projection.fundingPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm font-medium text-slate-600">{projection.status}</span>
                            <span className="text-sm font-medium text-slate-600">
                              {Math.round(projection.fundingPercentage)}% Funded
                            </span>
                          </div>
                        </div>

                        {projection.fundingGap > 0 && (
                          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-orange-700">Funding Gap</span>
                              <span className="text-xl font-bold text-orange-700">
                                ${Math.round(projection.fundingGap).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-8 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                <CardTitle className="text-2xl">Financial Responsibility at Present - Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300">
                    <div className="text-sm font-semibold text-slate-600 mb-2">Total Financial Responsibility</div>
                    <div className="text-3xl font-bold text-slate-900">
                      ${Math.round(totalFinancialResponsibility || 0).toLocaleString()}
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>10x Yearly Income:</span>
                        <span className="font-semibold">${Math.round(yearlyIncomeTimes10 || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mortgage Balance:</span>
                        <span className="font-semibold">${Math.round(primaryHomeMortgage || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kids Education Cost:</span>
                        <span className="font-semibold">${Math.round(kidsEducationCost || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Debt:</span>
                        <span className="font-semibold">${Math.round(currentDebt || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-300">
                    <div className="text-sm font-semibold text-green-700 mb-2">Total Life Insurance Coverage</div>
                    <div className="text-3xl font-bold text-green-900">
                      ${Math.round(lifeInsuranceTotal || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 ${
                    financialGap > 0
                      ? "bg-gradient-to-br from-red-50 to-rose-100 border-red-300"
                      : "bg-gradient-to-br from-green-50 to-emerald-100 border-green-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-slate-900">
                        {financialGap > 0 ? "Insurance Gap (Shortfall)" : "Insurance Coverage Surplus"}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {financialGap > 0
                          ? "Additional life insurance coverage needed"
                          : "Your life insurance adequately covers financial responsibilities"}
                      </p>
                    </div>
                    <div className={`text-4xl font-bold ${financialGap > 0 ? "text-red-700" : "text-green-700"}`}>
                      ${Math.round(Math.abs(financialGap)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule a Meet Section - only show if advisor zoom link exists and not in advisor view */}
            {!clientId && advisorProfile?.zoom_link && (
              <div className="px-4 pb-16">
                <div className="max-w-6xl mx-auto">
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <CardContent className="relative z-10 p-12 md:p-16">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                            <Calendar className="w-12 h-12" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 drop-shadow-sm">Schedule a meet here</h3>
                        {/* <p className="text-xl text-white/90 drop-shadow-sm max-w-xl">
                          Book a personalized consultation with {advisorProfile.full_name} to discuss your
                          financial plan, clarify recommendations, and set actionable next steps.
                        </p> */}
                        <p className="text-lg text-purple-100 mb-2 max-w-2xl mx-auto">
                          Book a personalized consultation with {advisorProfile.full_name || "your advisor"} to discuss
                          your financial plan, clarify recommendations, and set actionable next steps.
                        </p>

                        {advisorProfile.email && (
                          <p className="text-sm text-purple-200 mb-6">
                            Contact: {advisorProfile.email}
                            {advisorProfile.phone && ` • ${advisorProfile.phone}`}
                          </p>
                        )}
                        <Button
                          asChild
                          size="lg"
                          className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-10 py-10"
                        >
                          <a href={advisorProfile.zoom_link} target="_blank" rel="noopener noreferrer">
                            Schedule a meet here
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
              <CardContent className="pt-10 pb-10">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                      <Calendar className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 drop-shadow-sm">
                    Thoughtful guidance. Measured decisions. Long-term confidence.
                  </h3>
                  <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
                    Schedule a complimentary consultation to discuss a personalized financial strategy designed to
                    support sustainable growth and stability.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-10 py-10"
                  >
                    <a
                      href="https://scheduler.zoom.us/anand-pq9c9z/1-1-with-anand"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Request a Free Consultation
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
