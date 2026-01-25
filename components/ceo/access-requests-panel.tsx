"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock, Mail, User, ChevronDown, ChevronUp, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AccessRequest {
  id: string
  client_email: string
  client_name: string | null
  message: string | null
  status: "PENDING" | "APPROVED" | "DENIED"
  requested_at: string
  reviewed_at: string | null
  review_notes: string | null
  requested_role: string | null
}

export function AccessRequestsPanel() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({})
  const [showHistory, setShowHistory] = useState(false)
  const [sendingCredentials, setSendingCredentials] = useState<{ [key: string]: boolean }>({})
  const supabase = createClient()

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("requested_at", { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("access_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "access_requests",
        },
        () => {
          fetchRequests()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleReview = async (requestId: string, status: "APPROVED" | "DENIED") => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("access_requests")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes: reviewNotes[requestId] || null,
      })
      .eq("id", requestId)

    if (!error) {
      fetchRequests()
      setReviewNotes({ ...reviewNotes, [requestId]: "" })
    }
  }

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  const handleSendCredentials = async (request: AccessRequest) => {
    setSendingCredentials({ ...sendingCredentials, [request.id]: true })

    const tempPassword = generatePassword()

    try {
      const response = await fetch("/api/ceo/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: request.client_email,
          name: request.client_name || request.client_email,
          tempPassword: tempPassword,
          requestedRole: request.requested_role || "client",
        }),
      })

      if (response.ok) {
        alert(`Credentials sent successfully to ${request.client_email}`)
      } else {
        alert("Failed to send credentials. Please try again.")
      }
    } catch (error) {
      console.error("Error sending credentials:", error)
      alert("Error sending credentials. Please try again.")
    } finally {
      setSendingCredentials({ ...sendingCredentials, [request.id]: false })
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING")
  const reviewedRequests = requests.filter((r) => r.status !== "PENDING")

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading access requests...</div>
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Access Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Review and approve or deny client access requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3 bg-orange-50/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{request.client_name || "Name not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {request.client_email}
                    </div>
                    <div className="text-xs text-gray-500">
                      Requested: {new Date(request.requested_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    Pending
                  </Badge>
                </div>

                {request.message && (
                  <div className="bg-white rounded p-3 text-sm text-gray-700">
                    <strong>Message:</strong> {request.message}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`notes-${request.id}`} className="text-sm">
                    Review Notes (Optional)
                  </Label>
                  <Textarea
                    id={`notes-${request.id}`}
                    placeholder="Add notes about your decision..."
                    value={reviewNotes[request.id] || ""}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [request.id]: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReview(request.id, "APPROVED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReview(request.id, "DENIED")}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowHistory(!showHistory)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">Request History ({reviewedRequests.length})</CardTitle>
                <CardDescription>Previously reviewed access requests</CardDescription>
              </div>
              {showHistory ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent className="space-y-3">
              {reviewedRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{request.client_name || request.client_email}</div>
                      <div className="text-xs text-gray-500">{request.client_email}</div>
                      <div className="text-xs text-gray-500">
                        Reviewed: {request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                    <Badge
                      variant={request.status === "APPROVED" ? "default" : "destructive"}
                      className={request.status === "APPROVED" ? "bg-green-600" : ""}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  {request.review_notes && (
                    <div className="text-xs text-gray-600 bg-white rounded p-2">
                      <strong>Notes:</strong> {request.review_notes}
                    </div>
                  )}
                  {request.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendCredentials(request)}
                      disabled={sendingCredentials[request.id]}
                      className="w-full mt-2"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingCredentials[request.id] ? "Sending..." : "Send Credentials via Email"}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">No access requests yet</CardContent>
        </Card>
      )}
    </div>
  )
}
