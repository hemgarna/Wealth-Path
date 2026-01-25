"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Users, CheckCircle2, Target, TrendingDown, ArrowLeft, Moon, Sun } from "lucide-react"
import Link from "next/link"

interface ConversionFunnelClientProps {
  ceoId?: string
  advisorId?: string
  viewType?: "ceo" | "advisor"
}

interface FunnelStep {
  id: number
  name: string
  event_type: string
  count: number
  percentage: number
  dropoff: number
  dropoffPercentage: number
}

interface Advisor {
  id: string
  full_name: string
  clientCount: number
}

export function ConversionFunnelClient({ ceoId, advisorId, viewType = "ceo" }: ConversionFunnelClientProps) {
  const [dateRange, setDateRange] = useState("30")
  const [selectedAdvisor, setSelectedAdvisor] = useState("all")
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([])
  const [stats, setStats] = useState({
    totalVisitors: 0,
    conversions: 0,
    conversionRate: 0,
    totalDropoffs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    if (viewType === "ceo") {
      fetchAdvisors()
    }
    fetchFunnelData()
  }, [dateRange, selectedAdvisor])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  async function fetchAdvisors() {
    console.log("[v0] Analytics: Fetching advisors...")
    const { data: advisorProfiles, error: advisorError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "advisor")

    if (advisorError) {
      console.error("[v0] Analytics: Error fetching advisors:", advisorError)
      return
    }

    console.log("[v0] Analytics: Advisors fetched:", advisorProfiles?.length || 0)

    if (advisorProfiles) {
      // Get client counts for each advisor
      const advisorsWithCounts = await Promise.all(
        advisorProfiles.map(async (advisor) => {
          const { count, error: countError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("advisor_id", advisor.id)
            .eq("role", "client")

          if (countError) {
            console.error(`[v0] Analytics: Error fetching client count for advisor ${advisor.full_name}:`, countError)
          }

          return {
            ...advisor,
            clientCount: count || 0,
          }
        }),
      )

      console.log("[v0] Analytics: Advisors with client counts:", advisorsWithCounts)
      setAdvisors(advisorsWithCounts)
    }
  }

  async function fetchFunnelData() {
    console.log("[v0] Analytics: Fetching funnel data...")
    console.log("[v0] Analytics: Date range:", dateRange, "days")
    console.log("[v0] Analytics: Selected advisor:", selectedAdvisor)
    console.log("[v0] Analytics: View type:", viewType)

    setLoading(true)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(dateRange))

    console.log("[v0] Analytics: Date range:", startDate.toISOString(), "to", endDate.toISOString())

    let query = supabase
      .from("conversion_tracking")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    // If viewing as advisor, filter by this advisor's ID only
    if (viewType === "advisor" && advisorId) {
      console.log("[v0] Analytics: Filtering by advisor ID:", advisorId)
      query = query.eq("advisor_id", advisorId)
    } else if (viewType === "ceo" && selectedAdvisor !== "all") {
      // If viewing as CEO, allow filtering by selected advisor
      console.log("[v0] Analytics: CEO filtering by advisor ID:", selectedAdvisor)
      query = query.eq("advisor_id", selectedAdvisor)
    }

    const { data: events, error: eventsError } = await query

    if (eventsError) {
      console.error("[v0] Analytics: Error fetching events:", eventsError)
      setLoading(false)
      return
    }

    console.log("[v0] Analytics: Events fetched:", events?.length || 0)
    console.log(
      "[v0] Analytics: Event types:",
      events?.map((e) => e.event_type),
    )

    // Define funnel steps
    const steps = [
      { id: 1, name: "Landing Page Views", event_type: "landing_page_view" },
      { id: 2, name: "Signups", event_type: "signup" },
      { id: 3, name: "Started Questionnaire", event_type: "started_questionnaire" },
      { id: 4, name: "Step 1 Complete", event_type: "step1_complete" },
      { id: 5, name: "Step 2 Complete", event_type: "step2_complete" },
      { id: 6, name: "Step 3 Complete", event_type: "step3_complete" },
      { id: 7, name: "Step 4 Complete", event_type: "step4_complete" },
      { id: 8, name: "Consultation Booked", event_type: "consultation_booked" },
    ]

    // First pass: Count events for each step
    const stepCounts = steps.map((step) => ({
      ...step,
      count: events?.filter((e) => e.event_type === step.event_type).length || 0,
    }))

    // Second pass: Calculate percentages and dropoffs
    const firstStepCount = stepCounts[0]?.count || 0
    const funnelSteps: FunnelStep[] = stepCounts.map((step, index) => {
      const previousCount = index > 0 ? stepCounts[index - 1]?.count || 0 : step.count
      const dropoff = index > 0 ? previousCount - step.count : 0
      const dropoffPercentage = index > 0 && previousCount > 0 ? (dropoff / previousCount) * 100 : 0

      return {
        ...step,
        percentage: firstStepCount > 0 ? (step.count / firstStepCount) * 100 : 100,
        dropoff,
        dropoffPercentage,
      }
    })

    console.log("[v0] Analytics: Funnel steps calculated:", funnelSteps)

    setFunnelData(funnelSteps)

    // Calculate stats
    const totalVisitors = funnelSteps[0]?.count || 0
    const conversions = funnelSteps[funnelSteps.length - 1]?.count || 0
    const conversionRate = totalVisitors > 0 ? (conversions / totalVisitors) * 100 : 0
    const totalDropoffs = totalVisitors - conversions

    console.log("[v0] Analytics: Stats calculated:", {
      totalVisitors,
      conversions,
      conversionRate,
      totalDropoffs,
    })

    setStats({
      totalVisitors,
      conversions,
      conversionRate,
      totalDropoffs,
    })

    setLoading(false)
  }

  const backUrl = viewType === "advisor" ? "/admin" : "/ceo"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={backUrl}>
                <Button
                  variant="outline"
                  size="icon"
                  className="glass-card hover:scale-105 transition-transform bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Conversion Funnel Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Track visitor conversions and performance metrics
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="glass-card border-gray-200/50 dark:border-slate-700/50 hover:scale-105 transition-transform"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-6">
        {/* Filter Bar */}
        <Card className="glass-card border-gray-200/50 dark:border-slate-700/50 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px] glass-input">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="60">Last 60 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              {viewType === "ceo" && (
                <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
                  <SelectTrigger className="w-[250px] glass-input">
                    <SelectValue placeholder="Select advisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Advisors</SelectItem>
                    {advisors.map((advisor) => (
                      <SelectItem key={advisor.id} value={advisor.id}>
                        {advisor.full_name} ({advisor.clientCount} clients)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={fetchFunnelData}
                variant="outline"
                className="gap-2 glass-card hover:scale-105 transition-all bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            className="glass-card border-l-4 border-l-blue-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-slide-in-left"
            style={{ animationDelay: "0ms" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <Users className="h-4 w-4" />
                </div>
                Total Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {stats.totalVisitors}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Landing page views</p>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-l-4 border-l-green-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 animate-slide-in-left"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {stats.conversions}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Completed consultations</p>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-l-4 border-l-purple-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 animate-slide-in-left"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg">
                  <Target className="h-4 w-4" />
                </div>
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                {stats.conversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Visitor to consultation</p>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-l-4 border-l-red-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 animate-slide-in-left"
            style={{ animationDelay: "300ms" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
                  <TrendingDown className="h-4 w-4" />
                </div>
                Total Dropoffs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                {stats.totalDropoffs}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Users who didn't complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Visualization */}
        <Card className="glass-card border-gray-200/50 dark:border-slate-700/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Conversion Funnel Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {funnelData.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-slate-300">{step.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-slate-400">
                          {step.count} ({step.percentage.toFixed(1)}%)
                        </span>
                        {index > 0 && step.dropoff > 0 && (
                          <span className="text-red-600 dark:text-red-400 text-xs">
                            -{step.dropoff} ({step.dropoffPercentage.toFixed(1)}% dropoff)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative h-12 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${step.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-white mix-blend-difference">
                          {step.count} users
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
