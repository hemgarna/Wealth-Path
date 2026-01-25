"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Share2, Trash2, UserPlus, Eye, MessageSquare, Edit } from "lucide-react"
import Link from "next/link"

interface Share {
  id: string
  shared_with: string
  permission_level: string
  created_at: string
  revoked_at: string | null
  advisor_email?: string
  advisor_name?: string
}

interface CaseSharingProps {
  caseId: string
  advisorId: string
}

export function CaseSharing({ caseId, advisorId }: CaseSharingProps) {
  const [shares, setShares] = useState<Share[]>([])
  const [advisors, setAdvisors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState("")
  const [permissionLevel, setPermissionLevel] = useState("view")
  const [clientData, setClientData] = useState<any>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [caseId])

  async function fetchData() {
    setLoading(true)

    // Fetch client data
    const { data: client } = await supabase.from("profiles").select("*").eq("id", caseId).single()
    setClientData(client)

    // Fetch all advisors except current user
    const { data: advisorList } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "advisor")
      .neq("id", advisorId)

    setAdvisors(advisorList || [])

    // Fetch existing shares
    const { data: sharesData } = await supabase
      .from("case_sharing")
      .select("*")
      .eq("case_id", caseId)
      .is("revoked_at", null)

    if (sharesData) {
      // Fetch advisor details for each share
      const sharesWithDetails = await Promise.all(
        sharesData.map(async (share) => {
          const { data: advisor } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", share.shared_with)
            .single()

          return {
            ...share,
            advisor_email: advisor?.email,
            advisor_name: advisor?.full_name,
          }
        }),
      )
      setShares(sharesWithDetails)
    }

    setLoading(false)
  }

  async function shareCase() {
    if (!selectedAdvisor) {
      alert("Please select an advisor")
      return
    }

    setSaving(true)

    const { error } = await supabase.from("case_sharing").insert({
      case_id: caseId,
      shared_by: advisorId,
      shared_with: selectedAdvisor,
      permission_level: permissionLevel,
    })

    if (error) {
      console.error("Error sharing case:", error)
      if (error.code === "23505") {
        alert("This case is already shared with this advisor")
      } else {
        alert("Failed to share case")
      }
    } else {
      setSelectedAdvisor("")
      setPermissionLevel("view")
      fetchData()
    }

    setSaving(false)
  }

  async function revokeShare(shareId: string) {
    if (!confirm("Are you sure you want to revoke access to this case?")) return

    const { error } = await supabase
      .from("case_sharing")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", shareId)

    if (error) {
      console.error("Error revoking share:", error)
      alert("Failed to revoke access")
    } else {
      fetchData()
    }
  }

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case "view":
        return <Eye className="h-3 w-3" />
      case "comment":
        return <MessageSquare className="h-3 w-3" />
      case "edit":
        return <Edit className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  const getPermissionBadge = (level: string) => {
    const variants: Record<string, any> = {
      view: "secondary",
      comment: "default",
      edit: "default",
    }

    return (
      <Badge variant={variants[level] || "secondary"} className="gap-1">
        {getPermissionIcon(level)}
        {level}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/admin/case/${caseId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Share Case</h1>
            <p className="text-muted-foreground mt-1">
              {clientData?.full_name || "Unnamed Client"} - {clientData?.email}
            </p>
          </div>
        </div>

        {/* Share Case Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share with Advisor
            </CardTitle>
            <CardDescription>Grant access to other advisors for collaboration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Select Advisor</Label>
                <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an advisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {advisors.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No advisors available</div>
                    ) : (
                      advisors.map((advisor) => (
                        <SelectItem key={advisor.id} value={advisor.id}>
                          {advisor.full_name || advisor.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Permission Level</Label>
                <Select value={permissionLevel} onValueChange={setPermissionLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="comment">View & Comment</SelectItem>
                    <SelectItem value="edit">Full Edit Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Permission Levels:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5" />
                  <span>
                    <strong>View Only:</strong> Can see all case data but cannot make changes or add comments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <span>
                    <strong>View & Comment:</strong> Can view data and add expert comments and solutions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Edit className="h-4 w-4 mt-0.5" />
                  <span>
                    <strong>Full Edit Access:</strong> Can view, comment, and modify case status and notes
                  </span>
                </li>
              </ul>
            </div>

            <Button onClick={shareCase} disabled={saving || !selectedAdvisor}>
              <UserPlus className="mr-2 h-4 w-4" />
              {saving ? "Sharing..." : "Share Case"}
            </Button>
          </CardContent>
        </Card>

        {/* Active Shares */}
        <Card>
          <CardHeader>
            <CardTitle>Active Shares</CardTitle>
            <CardDescription>Advisors who currently have access to this case</CardDescription>
          </CardHeader>
          <CardContent>
            {shares.length === 0 ? (
              <p className="text-sm text-muted-foreground">This case has not been shared with any advisors yet</p>
            ) : (
              <div className="space-y-3">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{share.advisor_name || "Unknown Advisor"}</p>
                        {getPermissionBadge(share.permission_level)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{share.advisor_email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Shared on {new Date(share.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => revokeShare(share.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
