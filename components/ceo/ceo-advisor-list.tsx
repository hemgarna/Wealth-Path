"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Users,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { AddAdvisorDialog } from "@/components/ceo/add-advisor-dialog"
import { EditAdvisorDialog } from "@/components/ceo/edit-advisor-dialog"
import { useRouter } from "next/navigation"

interface Advisor {
  id: string
  email: string
  full_name: string
  phone: string
  advisor_code: string
  advisor_status: string
  total_clients: number
  active_cases: number
  created_at: string
  expires_at: string | null
}

interface CeoAdvisorListProps {
  ceoId: string
  onUpdate: () => void
}

export function CeoAdvisorList({ ceoId, onUpdate }: CeoAdvisorListProps) {
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)

  const supabase = createBrowserClient()
  const router = useRouter()

  useEffect(() => {
    fetchAdvisors()
  }, [])

  async function fetchAdvisors() {
    setLoading(true)

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "advisor")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching advisors:", error)
    } else {
      // Count clients for each advisor
      const advisorsWithCounts = await Promise.all(
        (data || []).map(async (advisor) => {
          const { count: clientCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("advisor_id", advisor.id)
            .eq("role", "client")

          const { count: activeCases } = await supabase
            .from("case_status")
            .select("*", { count: "exact", head: true })
            .in("status", ["new", "in_review"])
            .in(
              "user_id",
              (
                await supabase.from("profiles").select("id").eq("advisor_id", advisor.id).eq("role", "client")
              ).data?.map((c) => c.id) || [],
            )

          return {
            ...advisor,
            total_clients: clientCount || 0,
            active_cases: activeCases || 0,
          }
        }),
      )

      setAdvisors(advisorsWithCounts)
    }

    setLoading(false)
  }

  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch =
      advisor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.advisor_code?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || advisor.advisor_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (advisorId: string, advisorName: string) => {
    if (!confirm(`Are you sure you want to delete ${advisorName}? This action cannot be undone.`)) return

    const { error } = await supabase.from("profiles").delete().eq("id", advisorId)

    if (error) {
      alert("Failed to delete advisor: " + error.message)
    } else {
      fetchAdvisors()
      onUpdate()
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-200 text-gray-700 gap-1">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  const handleViewAdvisorDashboard = (advisorId: string) => {
    router.push(`/admin?viewAsAdvisor=${advisorId}`)
  }

  const getExpirationInfo = (expiresAt: string | null) => {
    if (!expiresAt) return { text: "No expiration", variant: "default" as const, daysLeft: null }

    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const daysLeft = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) {
      return { text: "Expired", variant: "destructive" as const, daysLeft: 0 }
    } else if (daysLeft <= 30) {
      return { text: `${daysLeft} days left`, variant: "warning" as const, daysLeft }
    } else {
      return { text: `${daysLeft} days left`, variant: "default" as const, daysLeft }
    }
  }

  const handleExtendAccount = async (advisorId: string, advisorName: string) => {
    if (!confirm(`Extend ${advisorName}'s account by 1 year?`)) return

    const newExpirationDate = new Date()
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1)

    const { error } = await supabase
      .from("profiles")
      .update({ expires_at: newExpirationDate.toISOString() })
      .eq("id", advisorId)

    if (error) {
      alert("Failed to extend account: " + error.message)
    } else {
      alert(`${advisorName}'s account has been extended by 1 year`)
      fetchAdvisors()
    }
  }

  return (
    <>
      <Card className="glass-card border-gray-200/50 dark:border-slate-700/50 shadow-lg animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <Input
                placeholder="Search by advisor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-300/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="clients">
              <SelectTrigger className="w-[180px] border-gray-300/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clients">Sort by Clients</SelectItem>
                <SelectItem value="cases">Sort by Cases</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchAdvisors}
              variant="outline"
              className="gap-2 border-gray-300/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:scale-105 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Add New Advisor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-gray-200/50 dark:border-slate-700/50 shadow-xl animate-fade-in [animation-delay:100ms]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 border-b bg-gradient-to-r from-slate-50 via-blue-50 to-violet-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 backdrop-blur-xl z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Advisor ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Advisor Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Total Clients
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Active Cases
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Account Expires
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                        Loading advisors...
                      </div>
                    </td>
                  </tr>
                ) : filteredAdvisors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400">
                      No advisors found
                    </td>
                  </tr>
                ) : (
                  filteredAdvisors.map((advisor, index) => {
                    const expirationInfo = getExpirationInfo(advisor.expires_at)
                    return (
                      <tr
                        key={advisor.id}
                        className="hover:bg-white/80 dark:hover:bg-slate-800/80 hover:scale-[1.01] transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {advisor.advisor_code || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {advisor.full_name || "Unnamed Advisor"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <span className="text-sm text-gray-600 dark:text-slate-400">{advisor.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                            <span className="text-sm text-gray-600 dark:text-slate-400">{advisor.phone || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {advisor.total_clients}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {advisor.active_cases}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(advisor.advisor_status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              {expirationInfo.variant === "warning" && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                              {expirationInfo.variant === "destructive" && <XCircle className="h-4 w-4 text-red-500" />}
                              <span
                                className={`text-sm ${
                                  expirationInfo.variant === "destructive"
                                    ? "text-red-600 font-semibold"
                                    : expirationInfo.variant === "warning"
                                      ? "text-orange-600 font-medium"
                                      : "text-gray-600 dark:text-slate-400"
                                }`}
                              >
                                {expirationInfo.text}
                              </span>
                            </div>
                            {advisor.expires_at && (
                              <span className="text-xs text-gray-500 dark:text-slate-500">
                                {new Date(advisor.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAdvisorDashboard(advisor.id)}
                              className="gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105 transition-all"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-600 dark:text-blue-400">View Dashboard</span>
                            </Button>
                            {advisor.expires_at && expirationInfo.daysLeft !== null && expirationInfo.daysLeft < 90 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExtendAccount(advisor.id, advisor.full_name)}
                                className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-105 transition-all"
                              >
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs">Extend</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAdvisor(advisor)
                                setShowEditDialog(true)
                              }}
                              className="hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:scale-105 transition-all"
                            >
                              <Edit className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(advisor.id, advisor.full_name)}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 transition-all"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddAdvisorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          fetchAdvisors()
          onUpdate()
        }}
      />

      {selectedAdvisor && (
        <>
          <EditAdvisorDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            advisor={selectedAdvisor}
            onSuccess={() => {
              fetchAdvisors()
              onUpdate()
            }}
          />
        </>
      )}
    </>
  )
}
