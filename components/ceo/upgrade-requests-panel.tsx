"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react"

interface UpgradeRequest {
  id: string
  advisor_id: string
  status: string
  message: string
  requested_at: string
  reviewed_at: string | null
  review_notes: string | null
  advisor: {
    full_name: string
    email: string
    advisor_code: string
  }
}

export function UpgradeRequestsPanel({ ceoId }: { ceoId: string }) {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchRequests()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("upgrade_requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "upgrade_requests" }, () => {
        fetchRequests()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchRequests() {
    setLoading(true)

    const { data, error } = await supabase
      .from("upgrade_requests")
      .select(
        `
        *,
        advisor:profiles!advisor_id(full_name, email, advisor_code)
      `,
      )
      .order("requested_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching upgrade requests:", error)
    } else {
      setRequests((data as any) || [])
    }

    setLoading(false)
  }

  async function handleReview(requestId: string, status: "APPROVED" | "DENIED") {
    if (!reviewNotes.trim() && status === "DENIED") {
      alert("Please provide a reason for denial")
      return
    }

    setProcessing(true)

    try {
      // Update request
      const { error: updateError } = await supabase
        .from("upgrade_requests")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: ceoId,
          review_notes: reviewNotes.trim() || null,
        })
        .eq("id", requestId)

      if (updateError) throw updateError

      // Notify advisor
      const request = requests.find((r) => r.id === requestId)
      if (request) {
        await supabase.from("notifications").insert({
          user_id: request.advisor_id,
          type: "upgrade_request_response",
          title: `Upgrade Request ${status}`,
          message: `Your organization upgrade request has been ${status.toLowerCase()}${reviewNotes ? `: ${reviewNotes}` : ""}`,
          read: false,
        })
      }

      alert(`Request ${status.toLowerCase()} successfully`)
      setSelectedRequest(null)
      setReviewNotes("")
      fetchRequests()
    } catch (error: any) {
      console.error("[v0] Error reviewing request:", error)
      alert("Failed to process request: " + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Upgrade Requests
              </CardTitle>
              <CardDescription>Review and manage advisor upgrade requests</CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-orange-100 text-orange-700 text-lg px-3 py-1">{pendingCount} Pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No upgrade requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{request.advisor.full_name}</span>
                          <span className="text-sm text-gray-500">({request.advisor.advisor_code})</span>
                          {request.status === "PENDING" ? (
                            <Badge className="bg-orange-100 text-orange-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          ) : request.status === "APPROVED" ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Denied
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{request.message}</p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(request.requested_at).toLocaleString()}
                        </p>
                        {request.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            Reviewed: {new Date(request.reviewed_at).toLocaleString()}
                          </p>
                        )}
                        {request.review_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <span className="font-semibold">Review Notes:</span> {request.review_notes}
                          </div>
                        )}
                      </div>
                      {request.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
                            onClick={() => {
                              setSelectedRequest(request)
                              setReviewNotes("")
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                            onClick={() => {
                              setSelectedRequest(request)
                              setReviewNotes("")
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Upgrade Request</DialogTitle>
            <DialogDescription>
              From: {selectedRequest?.advisor.full_name} ({selectedRequest?.advisor.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <Label className="text-xs text-gray-600">Request Message:</Label>
              <p className="text-sm mt-1">{selectedRequest?.message}</p>
            </div>

            <div>
              <Label htmlFor="review-notes">Review Notes (optional for approval, required for denial)</Label>
              <Textarea
                id="review-notes"
                placeholder="Add any notes or comments..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedRequest(null)} disabled={processing}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => selectedRequest && handleReview(selectedRequest.id, "DENIED")}
                disabled={processing}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Deny
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => selectedRequest && handleReview(selectedRequest.id, "APPROVED")}
                disabled={processing}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
