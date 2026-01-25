"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBrowserClient } from "@/lib/supabase/client"
import { Copy, Check, ExternalLink, Trash2, RefreshCw, Search } from "lucide-react"
import Link from "next/link"

interface Invitation {
  id: string
  client_email: string
  client_name: string
  invitation_token: string
  status: "pending" | "accepted" | "expired"
  expires_at: string
  created_at: string
  accepted_at: string | null
}

export function InvitationsManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createBrowserClient()

  const loadInvitations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("client_invitations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading invitations:", error)
    } else {
      setInvitations(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  const getInvitationLink = (token: string) => {
    const link = `${window.location.origin}/auth/accept-invitation?token=${token}`
    return link
  }

  const copyToClipboard = async (token: string) => {
    const link = getInvitationLink(token)
    await navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const deleteInvitation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) return

    console.log("[v0] Attempting to delete invitation:", id)

    const { error } = await supabase.from("client_invitations").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting invitation:", error)
      alert(`Failed to delete invitation: ${error.message}`)
    } else {
      console.log("[v0] Successfully deleted invitation")
      alert("Invitation deleted successfully")
      loadInvitations()
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const filteredInvitations = invitations.filter(
    (inv) =>
      inv.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pendingCount = invitations.filter((inv) => inv.status === "pending" && !isExpired(inv.expires_at)).length
  const acceptedCount = invitations.filter((inv) => inv.status === "accepted").length
  const expiredCount = invitations.filter((inv) => isExpired(inv.expires_at) || inv.status === "expired").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Invitations</h1>
          <p className="text-muted-foreground mt-1">Manage and share invitation links with your clients</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInvitations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/clients/create">
            <Button size="sm">Create New Client</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending Invitations</div>
          <div className="text-2xl font-bold mt-1">{pendingCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Accepted</div>
          <div className="text-2xl font-bold mt-1">{acceptedCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Expired</div>
          <div className="text-2xl font-bold mt-1">{expiredCount}</div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Invitations List */}
      {loading ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">Loading invitations...</div>
        </Card>
      ) : filteredInvitations.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No invitations found matching your search."
                : "No invitations yet. Create your first client invitation."}
            </p>
            {!searchQuery && (
              <Link href="/admin/clients/create">
                <Button className="mt-4">Create First Invitation</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvitations.map((invitation) => {
            const expired = isExpired(invitation.expires_at)
            const invitationLink = getInvitationLink(invitation.invitation_token)

            return (
              <Card key={invitation.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-lg">{invitation.client_name}</h3>
                        <p className="text-muted-foreground">{invitation.client_email}</p>
                      </div>
                      {invitation.status === "accepted" && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Accepted
                        </span>
                      )}
                      {expired && invitation.status === "pending" && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-700 dark:text-red-400 text-xs rounded-full">
                          Expired
                        </span>
                      )}
                      {!expired && invitation.status === "pending" && (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Created: {new Date(invitation.created_at).toLocaleDateString()}</div>
                      <div>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</div>
                      {invitation.accepted_at && (
                        <div>Accepted: {new Date(invitation.accepted_at).toLocaleDateString()}</div>
                      )}
                    </div>

                    {/* Invitation Link */}
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Invitation Link:</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-background px-3 py-2 rounded border overflow-x-auto">
                          {invitationLink}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invitation.invitation_token)}
                          className="shrink-0"
                        >
                          {copiedToken === invitation.invitation_token ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invitationLink, "_blank")}
                          className="shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Gmail Compose Button */}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const subject = encodeURIComponent("Your Financial Planning Portal Invitation")
                          const body = encodeURIComponent(
                            `Hi ${invitation.client_name},\n\n` +
                              `You've been invited to access our Financial Planning Portal.\n\n` +
                              `Please click the link below to create your account and get started:\n\n` +
                              `${invitationLink}\n\n` +
                              `This invitation will expire on ${new Date(invitation.expires_at).toLocaleDateString()}.\n\n` +
                              `If you have any questions, feel free to reply to this email.\n\n` +
                              `Best regards,\n` +
                              `Your Financial Planning Team`,
                          )
                          window.open(
                            `https://mail.google.com/mail/?view=cm&fs=1&to=${invitation.client_email}&su=${subject}&body=${body}`,
                            "_blank",
                          )
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Gmail
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInvitation(invitation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
