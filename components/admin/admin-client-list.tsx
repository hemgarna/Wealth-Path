"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  BarChart3,
  LogOut,
  Users,
  Clock,
  CheckCircle,
  Share2,
  MoreVertical,
  Eye,
  XCircle,
  FileText,
  CheckCircle2,
  UserPlus,
  Archive,
} from "lucide-react"
import { fetchClients } from "@/lib/supabase/fetchClients" // Import fetchClients function
import { RequestUpgradeButton } from "@/components/admin/request-upgrade-button"
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"

interface ClientCase {
  id: string
  email: string
  full_name: string | null
  created_at: string
  status: string
  admin_notes: string | null
  last_reviewed_at: string | null
  case_id: string
  has_assessment: boolean
  assessment_status: string | null
  annual_income: number | null
  current_net_worth: number | null
  retirement_age: number | null
  assessment_progress: number | null
  shared_advisor_id: string | null
  phone: string | null // Added phone field
  archived: boolean // Added archived field
  steps_completed: number // Added steps_completed field
  total_steps: number // Added total_steps field
}

interface Advisor {
  id: string
  email: string
  full_name: string | null
  advisor_code: string | null
}

interface AdminClientListProps {
  viewAsAdvisorId?: string
  advisorInfo?: { full_name: string; email: string; advisor_code: string } | null
}

export default function AdminClientList({ viewAsAdvisorId, advisorInfo }: AdminClientListProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [clients, setClients] = useState<ClientCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientCase | null>(null)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [advisorEmail, setAdvisorEmail] = useState<string>("")
  const [sharing, setSharing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null)
  const [advisorProfile, setAdvisorProfile] = useState<any | null>(null)
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)
  const [clientCredentials, setClientCredentials] = useState<{
    name: string
    email: string
    temporaryPassword: string
  } | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false) // Changed to isSendingEmail for clarity
  const [upgradeRequest, setUpgradeRequest] = useState<any | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  const fetchAdvisorProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("[v0] Error fetching advisor profile:", error.message)
      return
    }

    setAdvisorProfile(profile)
    setCurrentUserId(user.id)

    const { data: existingRequest } = await supabase
      .from("upgrade_requests")
      .select("*")
      .eq("advisor_id", user.id)
      .order("requested_at", { ascending: false })
      .limit(1)
      .single()

    if (existingRequest) {
      setUpgradeRequest(existingRequest)
    }
  }

  const fetchClientsData = async () => {
    const { data, error } = await fetchClients(supabase, viewAsAdvisorId)
    if (error) {
      console.error("[v0] Error fetching clients:", error.message)
      setLoading(false)
      return
    }
    setClients(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAdvisorProfile()
    fetchClientsData()
  }, [])

  useEffect(() => {
    const resizeObserverErrHandler = (e: ErrorEvent) => {
      if (
        e.message === "ResizeObserver loop completed with undelivered notifications." ||
        e.message === "ResizeObserver loop limit exceeded"
      ) {
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener("error", resizeObserverErrHandler)

    return () => {
      window.removeEventListener("error", resizeObserverErrHandler)
    }
  }, [])

  async function handleLogout() {
    console.log("[v0] Logout button clicked - showing feedback dialog")
    setShowFeedbackDialog(true)
  }

  async function handleActualLogout() {
    console.log("[v0] Performing actual logout")
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  async function updateClientStatus(userId: string, newStatus: string) {
    const { error } = await supabase.from("case_status").upsert(
      {
        user_id: userId,
        status: newStatus,
        updated_at: new Date().toISOString(),
        last_reviewed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("[v0] Error updating status:", error.message)
      return false
    }

    setClients((prev) =>
      prev.map((client) =>
        client.id === userId ? { ...client, status: newStatus, last_reviewed_at: new Date().toISOString() } : client,
      ),
    )

    return true
  }

  function openShareDialog(client: ClientCase) {
    setSelectedClient(client)
    setAdvisorEmail("")
    setShareDialogOpen(true)
  }

  async function handleShareClient() {
    if (!selectedClient || !advisorEmail) return

    setSharing(true)

    try {
      const response = await fetch("/api/admin/share-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          advisorEmail: advisorEmail.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to share client. Please try again.")
        setSharing(false)
        return
      }

      setClients((prev) =>
        prev.map((client) => (client.id === selectedClient.id ? { ...client, is_shared: true } : client)),
      )
      setShareDialogOpen(false)
      setSharing(false)
      setAdvisorEmail("")
      alert(`Client successfully shared!`)
    } catch (error: any) {
      console.error("[v0] Error sharing client:", error)
      alert("Failed to share client. Please try again.")
      setSharing(false)
    }
  }

  const handleCreateClient = async () => {
    if (!newClientName || !newClientEmail) {
      alert("Please fill in all fields")
      return
    }

    setIsCreatingClient(true)
    try {
      console.log("[v0] Creating client account...")
      const response = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: newClientName,
          clientEmail: newClientEmail,
        }),
      })

      const data = await response.json()
      console.log("[v0] Create client response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create client")
      }

      if (data.emailStatus?.sent) {
        if (data.emailStatus.sentTo === "client") {
          alert(
            `✅ Client Account Created!\n\n` +
              `Account created for ${newClientName}\n` +
              `Login credentials have been sent directly to ${newClientEmail}\n\n` +
              `The client can now log in and complete their assessment.`,
          )
          // Close dialog immediately since email was sent successfully
          setAddClientDialogOpen(false)
          setNewClientName("")
          setNewClientEmail("")
          fetchClientsData()
        } else if (data.emailStatus.sentTo === "advisor") {
          alert(
            `✅ Client Account Created!\n\n` +
              `${data.emailStatus.message}\n\n` +
              `Please check your email and forward the credentials to ${newClientEmail}`,
          )
          // Show credentials dialog as backup
          setClientCredentials(data.credentials)
          setCredentialsDialogOpen(true)
          setAddClientDialogOpen(false)
          setNewClientName("")
          setNewClientEmail("")
          fetchClientsData()
        }
      } else {
        alert(
          `⚠️ Client Account Created - Manual Sharing Required\n\n` +
            `Account created successfully, but email delivery failed.\n` +
            `Please share the credentials manually with ${newClientEmail}`,
        )
        setClientCredentials(data.credentials)
        setCredentialsDialogOpen(true)
        setAddClientDialogOpen(false)
        setNewClientName("")
        setNewClientEmail("")
        fetchClientsData()
      }
    } catch (error: any) {
      console.error("[v0] Error creating client:", error)
      alert(`❌ Error: ${error.message || "Failed to create client account"}`)
    } finally {
      setIsCreatingClient(false)
    }
  }

  const handleArchiveClient = async (clientId: string) => {
    if (
      !confirm("Are you sure you want to archive this client? They will no longer appear in your active clients list.")
    ) {
      return
    }

    try {
      const { error } = await supabase.from("profiles").update({ archived: true }).eq("id", clientId)

      if (error) throw error

      alert("Client archived successfully")
      fetchClientsData()
    } catch (error) {
      console.error("Error archiving client:", error)
      alert("Failed to archive client")
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.case_id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    // Add filtering for 'shared' status
    if (statusFilter === "shared") {
      return matchesSearch && !!client.shared_advisor_id
    }

    // Handle 'active' and 'inactive' filters based on the 'archived' field
    if (statusFilter === "active") {
      return matchesSearch && !client.archived && client.status !== "completed"
    }
    if (statusFilter === "inactive") {
      return matchesSearch && !client.archived && client.status === "inactive"
    }
    if (statusFilter === "archived") {
      return matchesSearch && client.archived
    }

    return matchesSearch && matchesStatus
  })

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const stats = {
    total: clients.length,
    new: clients.filter((c) => c.status === "new").length,
    inProgress: clients.filter((c) => c.status === "in_progress").length,
    completed: clients.filter((c) => c.status === "completed").length,
    shared: clients.filter((c) => c.shared_advisor_id).length,
    archived: clients.filter((c) => c.archived).length,
  }

  const getStepCompletionBadge = (stepsCompleted: number, totalSteps: number) => {
    const percentage = (stepsCompleted / totalSteps) * 100

    let colorClass = "bg-gray-100 text-gray-700"
    if (percentage === 100) {
      colorClass = "bg-emerald-100 text-emerald-700"
    } else if (percentage >= 60) {
      colorClass = "bg-blue-100 text-blue-700"
    } else if (percentage >= 20) {
      colorClass = "bg-orange-100 text-orange-700"
    }

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}>
        {stepsCompleted}/{totalSteps} steps
      </span>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const sendCredentialsEmail = async () => {
    if (!clientCredentials) return

    setSendingEmail(true)
    try {
      const response = await fetch("/api/admin/send-credentials-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientCredentials.name,
          email: clientCredentials.email,
          temporaryPassword: clientCredentials.temporaryPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.note ? `✅ ${data.message}\n\n📧 Note: ${data.note}` : `✅ ${data.message}`)
      } else {
        alert(`❌ Failed to send email: ${data.error}\n\n${data.note || ""}`)
      }
    } catch (error) {
      console.error("[v0] Error sending credentials email:", error)
      alert("❌ Failed to send email. Please share credentials manually.")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSendCredentialsToClient = async () => {
    if (!clientCredentials) return

    setSendingEmail(true)
    try {
      const response = await fetch("/api/admin/send-credentials-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientCredentials.name,
          email: clientCredentials.email,
          temporaryPassword: clientCredentials.temporaryPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.note ? `✅ ${data.message}\n\n📧 Note: ${data.note}` : `✅ ${data.message}`)
      } else {
        alert(`❌ Failed to send email: ${data.error}\n\n${data.note || ""}`)
      }
    } catch (error) {
      console.error("[v0] Error sending credentials email:", error)
      alert("❌ Failed to send email. Please share credentials manually.")
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <>
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} onSubmit={handleActualLogout} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10">
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {viewAsAdvisorId && advisorInfo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/ceo")}
                      className="hover:bg-gray-50 transition-all hover:scale-105"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to CEO
                    </Button>
                  )}
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    {viewAsAdvisorId && advisorInfo
                      ? `${advisorInfo.full_name}'s Dashboard`
                      : "Financial Advisor Dashboard"}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  {!viewAsAdvisorId && currentUserId && advisorProfile && (
                    <RequestUpgradeButton
                      advisorId={currentUserId}
                      advisorName={advisorProfile.full_name || advisorProfile.email}
                      existingRequest={upgradeRequest}
                    />
                  )}
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/analytics")}
                    className="gap-2 hover:bg-blue-50 transition-all hover:scale-105"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                  <Button
                    onClick={() => setAddClientDialogOpen(true)}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white transition-all hover:scale-105 shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all hover:scale-105 bg-transparent"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto p-6 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200/50">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {advisorProfile?.full_name || "Advisor"}
                </h2>
                <p className="text-lg text-gray-600">
                  Manage your clients, track progress, and grow your financial advisory business
                </p>
              </div>
            </div>

            {/* Stats Cards Grid - Full width */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-blue-900">Total Cases</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                  <p className="text-xs text-blue-600 mt-1">All client cases</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-emerald-900">New Cases</CardTitle>
                  <FileText className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-emerald-700">{stats.new}</div>
                  <p className="text-xs text-emerald-600 mt-1">Recently added</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-orange-900">In Review</CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-orange-700">{stats.inProgress}</div>
                  <p className="text-xs text-orange-600 mt-1">Active reviews</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-purple-900">Completed</CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-purple-700">{stats.completed}</div>
                  <p className="text-xs text-purple-600 mt-1">Successfully closed</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-50 to-pink-50/30 border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/0 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-slate-900">Shared Cases</CardTitle>
                  <Share2 className="h-5 w-5 text-pink-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-slate-700">{stats.shared || 0}</div>
                  <p className="text-xs text-slate-600 mt-1">Collaborative cases</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/0 to-gray-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-gray-900">Archived Cases</CardTitle>
                  <Archive className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-gray-700">{stats.archived || 0}</div>
                  <p className="text-xs text-gray-600 mt-1">Archived clients</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or case ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-[200px] bg-white/80 backdrop-blur-sm border-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="shared">Shared Cases</SelectItem>
                  <SelectItem value="archived">Archived Cases</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-white/80 backdrop-blur-md border-gray-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900">Client Cases</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Case ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                            Loading clients...
                          </td>
                        </tr>
                      ) : filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                            No clients found
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={`/admin/case/${client.id}${viewAsAdvisorId ? `?viewAsAdvisor=${viewAsAdvisorId}` : ""}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {client.case_id}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-slate-200">
                                {client.full_name || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 dark:text-slate-400">{client.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 dark:text-slate-400">{client.phone || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStepCompletionBadge(client.steps_completed || 0, client.total_steps || 5)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 dark:text-slate-400 max-w-xs truncate">
                                {client.admin_notes || "No notes"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 dark:text-slate-400">
                                {new Date(client.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/case/${client.id}${viewAsAdvisorId ? `?viewAsAdvisor=${viewAsAdvisorId}` : ""}`,
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => updateClientStatus(client.id, "active")}
                                    className="cursor-pointer"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Mark as Active
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateClientStatus(client.id, "in_progress")}
                                    className="cursor-pointer"
                                  >
                                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                                    Mark as In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateClientStatus(client.id, "completed")}
                                    className="cursor-pointer"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                                    Mark as Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateClientStatus(client.id, "inactive")}
                                    className="cursor-pointer"
                                  >
                                    <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                                    Mark as Inactive
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openShareDialog(client)} className="cursor-pointer">
                                    <Share2 className="h-4 w-4 mr-2 text-indigo-600" />
                                    Share Client
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleArchiveClient(client.id)}
                                    className="cursor-pointer text-orange-600"
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  {/* Removed Delete functionality */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Client</DialogTitle>
                <DialogDescription>
                  Enter the email address of the financial advisor you want to share this client with. Both advisors
                  will have full access to the client's information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Client: {selectedClient?.full_name || selectedClient?.email}
                  </label>
                </div>
                <div>
                  <label htmlFor="advisor-email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Advisor Email
                  </label>
                  <Input
                    id="advisor-email"
                    type="email"
                    placeholder="advisor@example.com"
                    value={advisorEmail}
                    onChange={(e) => setAdvisorEmail(e.target.value)}
                    className="w-full"
                    disabled={sharing}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShareDialogOpen(false)} disabled={sharing}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleShareClient}
                    disabled={sharing || !advisorEmail.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {sharing ? "Sharing..." : "Share Client"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client account. Login credentials will be automatically sent to the client&apos;s email
                  address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="clientName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="clientName"
                    placeholder="Enter client's full name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="clientEmail" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="Enter client's email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddClientDialogOpen(false)
                    setNewClientName("")
                    setNewClientEmail("")
                  }}
                  disabled={isCreatingClient}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={!newClientName || !newClientEmail || isCreatingClient}
                  className="bg-gradient-to-r from-blue-600 to-violet-600"
                >
                  {isCreatingClient ? "Creating account and sending credentials..." : "Create Account"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-blue-600">Client Account Created</DialogTitle>
                <DialogDescription>
                  The account has been created successfully. You can now send the credentials directly to your client's
                  email.
                </DialogDescription>
              </DialogHeader>
              {clientCredentials && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Client Name</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{clientCredentials.name}</p>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(clientCredentials.name)}>
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email/Username</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{clientCredentials.email}</p>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(clientCredentials.email)}>
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Temporary Password</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono font-bold text-red-600">{clientCredentials.temporaryPassword}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(clientCredentials.temporaryPassword)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Recommended: Send via Email</p>
                        <p className="text-xs text-blue-700 mb-2">
                          Click below to send credentials directly to <strong>{clientCredentials.email}</strong>
                        </p>
                        <Button
                          onClick={handleSendCredentialsToClient}
                          disabled={sendingEmail}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {sendingEmail ? "Sending..." : "📧 Send Credentials to Client Email"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Alternative: Manual Sharing</p>
                        <p className="text-xs text-gray-600">
                          Use the copy buttons above to share credentials via phone, text, or in person.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800">
                      <strong>⚠️ Security Reminder:</strong> Advise your client to change their password immediately
                      after first login.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCredentialsDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

export { AdminClientList }
