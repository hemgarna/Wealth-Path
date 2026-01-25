"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TrendingUp, CheckCircle2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface RequestUpgradeButtonProps {
  advisorId: string
  advisorName: string
  existingRequest?: {
    id: string
    status: string
    message: string
    requested_at: string
  } | null
}

export function RequestUpgradeButton({ advisorId, advisorName, existingRequest }: RequestUpgradeButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserClient()

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Please provide a reason for the upgrade request")
      return
    }

    setLoading(true)

    try {
      // Create upgrade request
      const { data: request, error: requestError } = await supabase
        .from("upgrade_requests")
        .insert({
          advisor_id: advisorId,
          request_type: "organization_upgrade",
          status: "PENDING",
          message: message.trim(),
        })
        .select()
        .single()

      if (requestError) throw requestError

      // Create notification for CEO
      const { data: ceos } = await supabase.from("profiles").select("id").eq("role", "ceo")

      if (ceos && ceos.length > 0) {
        const notifications = ceos.map((ceo) => ({
          user_id: ceo.id,
          type: "upgrade_request",
          title: "New Upgrade Request",
          message: `${advisorName} has requested an organization upgrade`,
          read: false,
        }))

        await supabase.from("notifications").insert(notifications)
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setMessage("")
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error creating upgrade request:", error)
      alert("Failed to submit upgrade request: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (existingRequest) {
    return (
      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white/50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">Upgrade Request Status:</span>
            <span
              className={`text-sm font-bold ${
                existingRequest.status === "PENDING"
                  ? "text-orange-600"
                  : existingRequest.status === "APPROVED"
                    ? "text-green-600"
                    : "text-red-600"
              }`}
            >
              {existingRequest.status}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Requested on {new Date(existingRequest.requested_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:scale-105 transition-all"
      >
        <TrendingUp className="h-4 w-4" />
        Request Organization Upgrade
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Organization Upgrade</DialogTitle>
            <DialogDescription>
              Submit a request to upgrade your organization account. The CEO will review and respond to your request.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold text-green-700">Request Submitted Successfully!</p>
              <p className="text-sm text-gray-600">The CEO has been notified and will review your request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Reason for Upgrade Request *</Label>
                <Textarea
                  id="message"
                  placeholder="Please explain why you need an organization upgrade (e.g., growing client base, need for additional features, etc.)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !message.trim()}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
