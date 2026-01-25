"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TrendingUp } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      // Route based on role
      if (profile?.role === "ceo") {
        router.push("/ceo")
      } else if (profile?.role === "advisor") {
        router.push("/admin")
      } else {
        router.push("/home")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[100%] animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Logo at top */}
      <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">FNA APP</span>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 overflow-hidden">
          {/* Shimmer effect on card */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-shimmer-slow"></div>

          <CardHeader className="space-y-1 pb-4 pt-6">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-center text-slate-600">
              Sign in to access your financial dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                      Password
                    </Label>
                    <Link
                      href="/auth/reset-password"
                      className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-3 mt-4">
          <p className="text-sm text-emerald-100 text-center">🔒 Your data is encrypted and secure</p>
        </div>
      </div>
      {/* </CHANGE> */}

      {/* Floating elements for depth */}
      <div className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-emerald-600/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
    </div>
  )
}
