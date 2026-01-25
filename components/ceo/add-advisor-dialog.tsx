"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, Mail, Copy, Check } from "lucide-react"

interface AddAdvisorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddAdvisorDialog({ open, onOpenChange, onSuccess }: AddAdvisorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    zoomLink: "",
    autoGenerateId: true,
    status: "active",
  })
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [emailSentTo, setEmailSentTo] = useState<string>("") // Track where email was sent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setCredentials(null)
    setEmailSentTo("") // Reset email status

    try {
      const response = await fetch("/api/ceo/create-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create advisor")
      }

      setCredentials(data.credentials)
      setEmailSentTo(data.emailSentTo || "none") // Store where email was sent
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleComposeEmail = () => {
    if (!credentials) return

    const subject = encodeURIComponent("Your FNA APP Advisor Account")
    const body = encodeURIComponent(`Hello ${formData.fullName},

Your advisor account has been created. Here are your login credentials:

Email: ${credentials.email}
Temporary Password: ${credentials.password}
Login URL: ${window.location.origin}

Please log in and change your password after your first login.

Best regards,
FNA APP Team`)

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${credentials.email}&su=${subject}&body=${body}`,
      "_blank",
    )
  }

  const handleClose = () => {
    if (credentials) {
      onSuccess()
    }
    onOpenChange(false)
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      zoomLink: "",
      autoGenerateId: true,
      status: "active",
    })
    setCredentials(null)
    setError("")
    setEmailSentTo("") // Reset email status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {credentials ? "Advisor Created Successfully" : "Add New Advisor"}
          </DialogTitle>
          <DialogDescription>
            {credentials
              ? "Please share these credentials with the advisor manually"
              : "Create a new financial advisor account for the platform"}
          </DialogDescription>
        </DialogHeader>

        {credentials ? (
          <div className="space-y-4">
            {emailSentTo === "advisor" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-3">
                  ✓ Advisor account has been created and credentials have been sent to {credentials.email}
                </p>
                <p className="text-xs text-green-700">
                  The advisor should receive the login credentials in their email shortly. You can also share them
                  manually using the information below.
                </p>
              </div>
            )}

            {emailSentTo === "ceo" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 font-medium mb-3">
                  ⚠️ Advisor account created - Credentials sent to your email
                </p>
                <p className="text-xs text-orange-700">
                  The system couldn't send credentials directly to {credentials.email}. Check your email inbox for the
                  credentials, then forward them to the advisor.
                </p>
              </div>
            )}

            {emailSentTo === "none" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-3">
                  ⚠️ Email delivery failed - Share credentials manually
                </p>
                <p className="text-xs text-red-700">
                  Please copy and share these credentials with the advisor directly via phone, text, or in person.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-3">Advisor Login Credentials:</p>

              <div className="space-y-3">
                <div className="bg-white rounded border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">Email</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(credentials.email, "email")}
                      className="h-6 px-2"
                    >
                      {copiedField === "email" ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-mono font-semibold">{credentials.email}</p>
                </div>

                <div className="bg-white rounded border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">Temporary Password</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(credentials.password, "password")}
                      className="h-6 px-2"
                    >
                      {copiedField === "password" ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-mono font-semibold break-all">{credentials.password}</p>
                </div>

                <div className="bg-white rounded border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">Login URL</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(`${window.location.origin}`, "url")}
                      className="h-6 px-2"
                    >
                      {copiedField === "url" ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-mono text-blue-600">{window.location.origin}</p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleComposeEmail}
              className="w-full bg-white hover:bg-gray-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              Compose Email to Forward Credentials
            </Button>

            <Button onClick={handleClose} className="w-full bg-black hover:bg-gray-800">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoomLink">
                Schedule a meet here <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zoomLink"
                type="url"
                required
                value={formData.zoomLink}
                onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                placeholder="https://zoom.us/j/your-meeting-link"
              />
              <p className="text-xs text-muted-foreground">
                This meeting link will be shown to clients in their final report for scheduling consultations
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="autoGenerateId" className="text-sm font-medium">
                  Auto-generate Advisor ID
                </Label>
                <p className="text-xs text-muted-foreground">Generate ADV-YYYY-XXX format</p>
              </div>
              <Checkbox
                id="autoGenerateId"
                checked={formData.autoGenerateId}
                onCheckedChange={(checked) => setFormData({ ...formData, autoGenerateId: checked as boolean })}
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
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-black hover:bg-gray-800">
                {loading ? "Creating..." : "Create Advisor"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
