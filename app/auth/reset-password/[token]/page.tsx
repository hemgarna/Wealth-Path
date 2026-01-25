"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"

export default function ResetPasswordWithTokenPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()
        setIsValidToken(data.valid)

        if (!data.valid) {
          setError(data.error || "Invalid or expired reset token")
        }
      } catch (error) {
        console.error("[v0] Error verifying token:", error)
        setIsValidToken(false)
        setError("Failed to verify reset token")
      }
    }

    if (token) {
      verifyToken()
    }
  }, [token])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reset-password-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setPasswordUpdated(true)

      // Redirect to landing page after 3 seconds
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">FNA App</span>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 overflow-hidden">
          <CardHeader className="space-y-1 pb-4 pt-6">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {passwordUpdated ? "Password Updated!" : isValidToken === false ? "Invalid Link" : "Create New Password"}
            </CardTitle>
            <CardDescription className="text-sm text-center text-slate-600">
              {passwordUpdated
                ? "Your password has been successfully updated"
                : isValidToken === false
                  ? "This reset link is invalid or has expired"
                  : "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {passwordUpdated ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-sm text-slate-600 text-center">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                  <p className="text-xs text-slate-500 text-center">Redirecting you to the home page...</p>
                </div>
                <Link href="/" className="block">
                  <Button className="w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    Go to Home
                  </Button>
                </Link>
              </div>
            ) : isValidToken === false ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-sm text-slate-600 text-center">{error}</p>
                </div>
                <Link href="/auth/reset-password" className="block">
                  <Button className="w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    Request New Reset Link
                  </Button>
                </Link>
              </div>
            ) : isValidToken === null ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword}>
                <div className="flex flex-col gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                      New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
