"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Search,
  LogOut,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  TrendingDown,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ClientDetailModal } from "@/components/advisor/client-detail-modal"
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"

type Assessment = {
  id: string
  user_id: string
  status: string
  progress_percentage: number
  updated_at: string
  submitted_at?: string
  annual_income?: number
  spouse_annual_income?: number
  monthly_expenses?: number
  retirement_age?: number
  profiles: {
    id: string
    full_name: string
    email: string
  }
  [key: string]: any
}

type AdvisorDashboardClientProps = {
  assessments: Assessment[]
  advisorId: string
}

export function AdvisorDashboardClient({ assessments, advisorId }: AdvisorDashboardClientProps) {
  console.log("[v0] AdvisorDashboardClient mounted")

  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<Assessment | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  const handleSignOut = async () => {
    alert("[v0 DEBUG] Logout button clicked! Dialog should appear now.")
    console.log("[v0] Logout clicked, showing feedback dialog")
    setShowFeedbackDialog(true)
    console.log("[v0] showFeedbackDialog state set to:", true)
  }

  const completeSignOut = async () => {
    console.log("[v0] Completing sign out after feedback")
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // Filter assessments
  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: assessments.length,
    submitted: assessments.filter((a) => a.status === "submitted").length,
    draft: assessments.filter((a) => a.status === "draft").length,
    reviewed: assessments.filter((a) => a.status === "reviewed").length,
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; icon: any }> = {
      draft: { variant: "outline", icon: Clock },
      submitted: { variant: "default", icon: AlertCircle },
      reviewed: { variant: "secondary", icon: CheckCircle2 },
    }

    const config = variants[status] || variants.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const calculateNetWorth = (assessment: Assessment) => {
    const assets =
      (assessment.checking_balance || 0) +
      (assessment.cash_savings || 0) +
      (assessment.investment_accounts || 0) +
      (assessment.retirement_401k || 0) +
      (assessment.retirement_ira || 0) +
      (assessment.home_value || 0) +
      (assessment.other_assets || 0)

    const liabilities =
      (assessment.mortgage_balance || 0) +
      (assessment.student_loans || 0) +
      (assessment.auto_loans || 0) +
      (assessment.credit_card_debt || 0) +
      (assessment.other_debts || 0)

    return assets - liabilities
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">FNA App</span>
              <Badge variant="secondary" className="ml-2">
                Advisor
              </Badge>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Advisor Dashboard</h1>
          <p className="text-muted-foreground">Manage and review client financial assessments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
              <Users className="h-5 w-5 text-chart-1" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Submitted</h3>
              <AlertCircle className="h-5 w-5 text-chart-2" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.submitted}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
              <Clock className="h-5 w-5 text-chart-3" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
            <p className="text-xs text-muted-foreground mt-1">Draft assessments</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Reviewed</h3>
              <CheckCircle2 className="h-5 w-5 text-chart-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.reviewed}</p>
            <p className="text-xs text-muted-foreground mt-1">Completed reviews</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </Card>

        {/* Client List */}
        <div className="space-y-4">
          {filteredAssessments.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Clients will appear here once they start their assessments"}
              </p>
            </Card>
          ) : (
            filteredAssessments.map((assessment) => {
              const netWorth = calculateNetWorth(assessment)
              const annualIncome = (assessment.annual_income || 0) + (assessment.spouse_annual_income || 0)

              return (
                <Card key={assessment.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {assessment.profiles.full_name || "Unnamed Client"}
                        </h3>
                        {getStatusBadge(assessment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{assessment.profiles.email}</p>

                      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
                          <p
                            className={`text-sm font-semibold ${netWorth >= 0 ? "text-foreground" : "text-destructive"}`}
                          >
                            {netWorth >= 0 ? (
                              <TrendingUp className="h-3 w-3 inline mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 inline mr-1" />
                            )}
                            ${Math.abs(netWorth).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Annual Income</p>
                          <p className="text-sm font-semibold text-foreground">${annualIncome.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                          <p className="text-sm font-semibold text-foreground">{formatDate(assessment.updated_at)}</p>
                        </div>
                        {assessment.submitted_at && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatDate(assessment.submitted_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      {assessment.status === "draft" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${assessment.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{assessment.progress_percentage}%</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => setSelectedClient(assessment)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          assessment={selectedClient}
          advisorId={advisorId}
          onClose={() => setSelectedClient(null)}
          onUpdate={() => router.refresh()}
        />
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} onSubmit={completeSignOut} />
    </div>
  )
}
