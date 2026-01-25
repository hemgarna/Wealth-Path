"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Edit } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface EditAdvisorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advisor: any
  onSuccess: () => void
}

export function EditAdvisorDialog({ open, onOpenChange, advisor, onSuccess }: EditAdvisorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "active",
  })
  const [error, setError] = useState("")

  const supabase = createBrowserClient()

  useEffect(() => {
    if (advisor) {
      setFormData({
        fullName: advisor.full_name || "",
        email: advisor.email || "",
        phone: advisor.phone || "",
        status: advisor.advisor_status || "active",
      })
    }
  }, [advisor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          advisor_status: formData.status,
        })
        .eq("id", advisor.id)

      if (updateError) throw updateError

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Advisor
          </DialogTitle>
          <DialogDescription>Update advisor information and status</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <p className="text-xs text-muted-foreground">Set advisor as active or inactive</p>
            </div>
            <Switch
              id="status"
              checked={formData.status === "active"}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "inactive" })}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-black hover:bg-gray-800">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
