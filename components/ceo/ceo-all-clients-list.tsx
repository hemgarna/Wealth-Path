"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw } from "lucide-react"
import Link from "next/link"

interface CeoAllClientsListProps {
  ceoId: string
}

export function CeoAllClientsList({ ceoId }: CeoAllClientsListProps) {
  const [clients, setClients] = useState<any[]>([])
  const [advisors, setAdvisors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [advisorFilter, setAdvisorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    console.log("[v0] CEO - Fetching all clients across all advisors")

    // Fetch all advisors
    const { data: advisorData } = await supabase.from("profiles").select("id, full_name, email").eq("role", "advisor")
    setAdvisors(advisorData || [])

    const { data: allClientsData } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at, role, advisor_id, phone")
      .eq("role", "client")
      .order("created_at", { ascending: false })

    if (!allClientsData) {
      setClients([])
      setLoading(false)
      return
    }

    const clientIds = allClientsData.map((c) => c.id)

    let progressMap: Record<string, { stepsCompleted: number; totalSteps: number }> = {}

    try {
      const progressResponse = await fetch("/api/ceo/client-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds }),
      })

      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        progressMap = progressData.progress || {}
        console.log("[v0] CEO - Progress data fetched successfully via API")
      } else {
        console.error("[v0] CEO - Failed to fetch progress via API")
      }
    } catch (error) {
      console.error("[v0] CEO - Error fetching progress:", error)
    }

    // Fetch case statuses
    const { data: statuses } = await supabase.from("case_status").select("*").in("user_id", clientIds)

    const clientsWithDetails = allClientsData.map((client, index) => {
      const status = statuses?.find((s) => s.user_id === client.id)
      const advisor = advisorData?.find((a) => a.id === client.advisor_id)
      const year = new Date(client.created_at).getFullYear()
      const caseNumber = String(index + 1).padStart(3, "0")

      const progress = progressMap[client.id] || { stepsCompleted: 0, totalSteps: 5 }

      console.log(`[v0] CEO - ${client.full_name}: ${progress.stepsCompleted}/${progress.totalSteps} steps`)

      return {
        ...client,
        case_id: `FNA-${year}-${caseNumber}`,
        status: status?.status || "new",
        admin_notes: status?.admin_notes || null,
        last_reviewed_at: status?.last_reviewed_at || null,
        advisor_name: advisor?.full_name || advisor?.email || "Unassigned",
        steps_completed: progress.stepsCompleted,
        total_steps: progress.totalSteps,
      }
    })

    setClients(clientsWithDetails)
    setLoading(false)
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.case_id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAdvisor = advisorFilter === "all" || client.advisor_id === advisorFilter
    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesAdvisor && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      new: { label: "Active", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
      in_review: { label: "In Review", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
      completed: { label: "Completed", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
      pending: { label: "Pending", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
    }

    const { label, className } = config[status] || config.new
    return (
      <Badge variant="secondary" className={className}>
        {label}
      </Badge>
    )
  }

  const getStepCompletionBadge = (completed: number, total: number) => {
    const percentage = (completed / total) * 100

    let badgeColor = "bg-gray-100 text-gray-700"
    if (percentage === 100) {
      badgeColor = "bg-emerald-100 text-emerald-700"
    } else if (percentage >= 50) {
      badgeColor = "bg-amber-100 text-amber-700"
    }

    return (
      <Badge variant="secondary" className={badgeColor}>
        {completed}/{total} steps
      </Badge>
    )
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>

            <Select value={advisorFilter} onValueChange={setAdvisorFilter}>
              <SelectTrigger className="w-[200px] border-gray-300 bg-white">
                <SelectValue placeholder="All Advisors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Advisors</SelectItem>
                {advisors.map((advisor) => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    {advisor.full_name || advisor.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-300 bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">Active</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchData} variant="outline" className="gap-2 border-gray-300 bg-white hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Assigned Advisor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    FNA Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                      Loading cases...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                      No cases found
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/ceo/case/${client.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {client.case_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{client.full_name || "Unnamed Client"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{client.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{client.advisor_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStepCompletionBadge(client.steps_completed || 0, client.total_steps || 5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(client.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(client.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 line-clamp-2">{client.admin_notes || "-"}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
