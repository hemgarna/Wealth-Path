"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface AcceptInvitationFormProps {
  token: string
}

export default function AcceptInvitationForm({ token }: AcceptInvitationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [invitation, setInvitation] = useState<{
    id: string
    client_email: string
    client_name: string
    invitation_token: string
    status: string
    expires_at: string
  } | null>(null)

  useEffect(() => {
    async function verifyInvitation() {
      console.log("[v0] Verifying invitation with token:", token)
      try {
        const supabase = createBrowserClient()

        if (!supabase) {
          console.error("[v0] Supabase client not initialized")
          setError("System configuration error. Please try again later or contact your advisor.")
          setVerifying(false)
          return
        }

        console.log("[v0] Querying client_invitations table...")
        const { data, error } = await supabase
          .from("client_invitations")
          .select("*")
          .eq("invitation_token", token)
          .maybeSingle()

        console.log("[v0] Invitation query result:", { data, error })

        if (error) {
          console.error("[v0] Database error:", error)
          throw new Error(`Database error: ${error.message}`)
        }

        if (!data) {
          console.log("[v0] No invitation found for token")
          setError("Invalid invitation link. Please contact your advisor for a new invitation.")
          setVerifying(false)
          return
        }

        console.log("[v0] Invitation status:", data.status)
        console.log("[v0] Invitation expires at:", data.expires_at)

        if (data.status === "accepted") {
          console.log("[v0] Invitation already accepted, redirecting to login")
          router.push("/auth/login?message=This invitation has already been used. Please log in.")
          return
        }

        if (new Date(data.expires_at) < new Date()) {
          console.log("[v0] Invitation expired")
          setError("This invitation link has expired. Please contact your advisor for a new link.")
          setVerifying(false)
          return
        }

        console.log("[v0] Invitation verified successfully")
        setInvitation(data)
        setVerifying(false)
      } catch (err: any) {
        console.error("[v0] Error verifying invitation:", err)
        setError(
          err.message ||
            "Failed to verify invitation. This might be due to network issues. Please try refreshing the page or contact your advisor.",
        )
        setVerifying(false)
      }
    }

    verifyInvitation()
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    console.log("[v0] Submitting account creation for:", invitation!.client_email)

    try {
      // Create account via API
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()
      console.log("[v0] Account creation response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Auto-login after successful account creation
      console.log("[v0] Attempting auto-login...")
      const supabase = createBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation!.client_email,
        password: password,
      })

      if (signInError) {
        console.log("[v0] Auto-login failed, redirecting to login page:", signInError)
        // If auto-login fails, redirect to login page
        router.push("/auth/login?message=Account created successfully! Please log in.")
        return
      }

      console.log("[v0] Auto-login successful, redirecting to assessment")
      // Successfully logged in, redirect to assessment
      router.push("/assessment")
    } catch (err: any) {
      console.error("[v0] Error during account creation:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Verifying your invitation...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !invitation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Invitation Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Refresh Page
            </Button>
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!invitation) return null

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome to Financial Planning</CardTitle>
        <CardDescription>Create your password to complete your account setup</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Name:</strong> {invitation.client_name}
          </p>
          <p className="text-sm text-blue-900 mt-1">
            <strong>Email:</strong> {invitation.client_email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account & Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
