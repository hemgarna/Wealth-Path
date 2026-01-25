"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, LogOut, BarChart3, Settings, Users } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { CeoAdvisorList } from "@/components/ceo/ceo-advisor-list"
import { CeoAllClientsList } from "@/components/ceo/ceo-all-clients-list"
import { CeoStats } from "@/components/ceo/ceo-stats"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { UpgradeRequestsPanel } from "@/components/ceo/upgrade-requests-panel"
import { AccessRequestsPanel } from "@/components/ceo/access-requests-panel"
import { WebsiteSuggestionsPanel } from "@/components/ceo/website-suggestions-panel"

interface CeoDashboardClientProps {
  ceoId: string
}

export function CeoDashboardClient({ ceoId }: CeoDashboardClientProps) {
  const [stats, setStats] = useState({
    totalAdvisors: 0,
    activeAdvisors: 0,
    totalClients: 0,
    newCasesThisMonth: 0,
    completedCases: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selfRegistrationEnabled, setSelfRegistrationEnabled] = useState(false)
  const [togglingRegistration, setTogglingRegistration] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        console.log("[v0] Auth event:", event)
      }

      // If session is null and user was signed out, redirect to login
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        console.log("[v0] Session expired, redirecting to login")
        router.push("/auth/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    fetchStats()
    fetchSelfRegistrationSetting()
  }, [])

  async function fetchSelfRegistrationSetting() {
    try {
      const response = await fetch("/api/settings/self-registration")
      const data = await response.json()
      setSelfRegistrationEnabled(data.enabled)
    } catch (err) {
      console.error("[v0] Failed to fetch self-registration setting:", err)
    }
  }

  async function toggleSelfRegistration(enabled: boolean) {
    setTogglingRegistration(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch("/api/settings/self-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        setSelfRegistrationEnabled(enabled)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update setting")
      }
    } catch (err) {
      console.error("[v0] Failed to toggle self-registration:", err)
      alert("Failed to update setting")
    } finally {
      setTogglingRegistration(false)
    }
  }

  async function fetchStats() {
    console.log("[v0] CEO Dashboard: Fetching stats...")
    setLoading(true)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error("[v0] Session error:", sessionError)
        router.push("/auth/login")
        return
      }

      // Fetch all advisors
      const { data: advisors, error: advisorsError } = await supabase.from("profiles").select("*").eq("role", "advisor")

      if (advisorsError) {
        console.error("[v0] Error fetching advisors:", advisorsError)
      } else {
        console.log("[v0] Advisors fetched:", advisors?.length || 0)
      }

      // Fetch all clients
      const { data: clients, error: clientsError } = await supabase.from("profiles").select("*").eq("role", "client")

      if (clientsError) {
        console.error("[v0] Error fetching clients:", clientsError)
      } else {
        console.log("[v0] Clients fetched:", clients?.length || 0)
      }

      // Fetch case statuses
      const { data: cases, error: casesError } = await supabase.from("case_status").select("*")

      if (casesError) {
        console.error("[v0] Error fetching cases:", casesError)
      } else {
        console.log("[v0] Cases fetched:", cases?.length || 0)
      }

      // Calculate new cases this month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const newCasesCount =
        clients?.filter((c) => {
          const createdAt = new Date(c.created_at)
          return createdAt >= startOfMonth
        }).length || 0

      const totalAdvisors = advisors?.length || 0
      const activeAdvisors = advisors?.filter((a) => a.advisor_status === "active").length || 0
      const totalClients = clients?.length || 0
      const completedCases = cases?.filter((c) => c.status === "completed").length || 0

      console.log("[v0] Stats calculated:", {
        totalAdvisors,
        activeAdvisors,
        totalClients,
        newCasesCount,
        completedCases,
      })

      setStats({
        totalAdvisors,
        activeAdvisors,
        totalClients,
        newCasesThisMonth: newCasesCount,
        completedCases,
      })
    } catch (error) {
      console.error("[v0] Error in fetchStats:", error)
      if (error instanceof Error && error.message.includes("refresh")) {
        console.log("[v0] Auth refresh error, redirecting to login")
        router.push("/auth/login")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 transition-colors duration-300">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-lg transition-all duration-300">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-violet-600 p-2.5 shadow-lg shadow-blue-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">CEO Dashboard</h1>
                <p className="text-sm text-gray-600">Platform-wide oversight and advisor management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/ceo/analytics")}
                className="gap-2 glass-card border-gray-200/50 hover:scale-105 transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 glass-card border-gray-200/50 hover:scale-105 transition-all hover:border-red-300 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-6">
        <div className="glass-card border border-gray-200/50 p-8 backdrop-blur-xl animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Welcome, CEO
            </h2>
            <p className="text-gray-600 text-lg">
              Monitor platform performance, manage financial advisors, and oversee all client cases.
            </p>
          </div>
        </div>

        {/* Settings Card */}
        <Card className="glass-card border border-gray-200/50 backdrop-blur-xl animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Platform Settings</CardTitle>
            </div>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="self-registration" className="text-sm font-semibold text-gray-900">
                    Client Self-Registration
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Allow clients to create accounts from the login page (useful for workshops)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${selfRegistrationEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {selfRegistrationEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Switch
                  id="self-registration"
                  checked={selfRegistrationEnabled}
                  onCheckedChange={toggleSelfRegistration}
                  disabled={togglingRegistration}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <CeoStats stats={stats} loading={loading} />

        <AccessRequestsPanel />

        <UpgradeRequestsPanel ceoId={ceoId} />

        <WebsiteSuggestionsPanel />

        <Tabs defaultValue="advisors" className="space-y-6">
          <TabsList className="glass-card border border-gray-200/50 p-1 backdrop-blur-xl animate-fade-in">
            <TabsTrigger
              value="advisors"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
            >
              Financial Advisors
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
            >
              All Client Cases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advisors" className="space-y-6 animate-fade-in">
            <CeoAdvisorList ceoId={ceoId} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6 animate-fade-in">
            <CeoAllClientsList ceoId={ceoId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
