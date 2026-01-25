"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { TrendingUp, Lock, Mail } from "lucide-react"
import { RequestAccessDialog } from "@/components/auth/request-access-dialog"

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[100%] animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* Logo at top */}
      <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">FNA APP</span>
      </div>

      {/* Centered Card with enhanced styling */}
      <div className="relative z-10 w-full max-w-lg px-6">
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 overflow-hidden">
          {/* Shimmer effect on card */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-shimmer-slow"></div>

          <CardHeader className="space-y-1 pb-4 pt-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Accounts Created by Invitation Only
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Access to FNA APP is exclusive to clients created by our Admin team
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm">How to Get Started</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Your account must be created by our Admin team. Once created, you'll receive
                    an email with your login credentials. Please check your inbox for an email from FNA APP.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 text-center">
                Already have your Credentials? Sign in below.
              </p>

              <Link href="/auth/login" className="block">
                <Button className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-600">Need help? </span>
              <RequestAccessDialog />
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-300 mt-4">
          <p>
            FNA APP provides personalized financial planning exclusively through our network of certified advisors.
          </p>
        </div>
      </div>

      {/* Floating elements for depth */}
      <div className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
    </div>
  )
}
