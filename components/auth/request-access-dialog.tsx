"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Advisor {
  id: string
  email: string
  full_name: string
}

export function RequestAccessDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingAdvisors, setLoadingAdvisors] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("")
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [selfRegistrationEnabled, setSelfRegistrationEnabled] = useState<boolean | null>(null)

  // Check if self-registration is enabled on mount
  useEffect(() => {
    const checkSelfRegistration = async () => {
      try {
        const response = await fetch("/api/settings/self-registration")
        const data = await response.json()
        setSelfRegistrationEnabled(data.enabled)
      } catch (err) {
        setSelfRegistrationEnabled(false)
      }
    }
    checkSelfRegistration()
  }, [])

  // Fetch advisors when dialog opens (only for self-registration mode)
  useEffect(() => {
    if (open && selfRegistrationEnabled && advisors.length === 0) {
      fetchAdvisors()
    }
  }, [open, selfRegistrationEnabled])

  const fetchAdvisors = async () => {
    setLoadingAdvisors(true)
    try {
      const response = await fetch("/api/advisors/list")
      const data = await response.json()
      if (response.ok && data.advisors) {
        setAdvisors(data.advisors)
      }
    } catch (err) {
      console.error("Failed to fetch advisors:", err)
    } finally {
      setLoadingAdvisors(false)
    }
  }

  // Handle self-registration (auto-create account)
  const handleSelfRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!selectedAdvisorId) {
      setError("Please select an advisor")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name,
          advisorId: selectedAdvisorId,
          autoCreate: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        if (data.credentials) {
          setCredentials(data.credentials)
        }
      } else {
        setError(data.error || "Failed to create account")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle access request (submit for admin review)
  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name,
          message,
          autoCreate: false
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(data.error || "Failed to submit request")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setSubmitted(false)
      setCredentials(null)
      setEmail("")
      setName("")
      setMessage("")
      setSelectedAdvisorId("")
      setError("")
    }, 200)
  }

  // Still loading the setting
  if (selfRegistrationEnabled === null) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) handleClose()
    }}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-blue-600 hover:text-blue-700 font-semibold p-0 h-auto">
          Request Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          selfRegistrationEnabled ? (
            // Self-registration mode (workshops) - auto-create account
            <>
              <DialogHeader>
                <DialogTitle>Create Client Account</DialogTitle>
                <DialogDescription>Select your advisor and create your account to get started.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSelfRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Your Advisor *</Label>
                  <Select value={selectedAdvisorId} onValueChange={setSelectedAdvisorId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingAdvisors ? "Loading advisors..." : "Select an advisor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {advisors.map((advisor) => (
                        <SelectItem key={advisor.id} value={advisor.id}>
                          {advisor.full_name || advisor.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the financial advisor you want to work with
                  </p>
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading || !email || !name || !selectedAdvisorId}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create My Account"
                  )}
                </Button>
              </form>
            </>
          ) : (
            // Request access mode (default) - submit for admin review
            <>
              <DialogHeader>
                <DialogTitle>Request Access to FNA App</DialogTitle>
                <DialogDescription>Submit your request and our Admin team will review it shortly.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAccessRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us why you need access..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading || !email || !name || !message}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </>
          )
        ) : (
          // Success state
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {selfRegistrationEnabled && credentials ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Created!</h3>
                <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-3">Your login credentials:</p>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Email:</strong> {credentials.email}</p>
                    <p className="text-sm"><strong>Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-red-600">{credentials.password}</code></p>
                  </div>
                  <p className="text-xs text-amber-600 mt-3">Please save these credentials and change your password after logging in.</p>
                </div>
              </>
            ) : selfRegistrationEnabled ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Created!</h3>
                <p className="text-sm text-gray-600 mb-4">Your login credentials have been sent to your email.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-sm text-gray-600 mb-4">You'll receive an email once your request is reviewed and approved.</p>
              </>
            )}
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
