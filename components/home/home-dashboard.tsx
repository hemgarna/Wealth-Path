"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"
import {
  TrendingUp,
  Shield,
  FileText,
  Bell,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Target,
  Wallet,
  Users,
  Briefcase,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface HomeDashboardProps {
  profile: any
  assessment: {
    financialGoals: any
    growthStrategy: any
    defenseStrategy: any
    savingsVsSpending: any
  } | null
}

export default function HomeDashboard({ profile, assessment }: HomeDashboardProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  const financialGoalsComplete = assessment?.financialGoals?.completed || false
  const growthStrategyComplete = assessment?.growthStrategy?.completed || false
  const defenseStrategyComplete = assessment?.defenseStrategy?.completed || false
  const savingsVsSpendingComplete = assessment?.savingsVsSpending?.completed || false
  const allSectionsComplete =
    financialGoalsComplete && growthStrategyComplete && defenseStrategyComplete && savingsVsSpendingComplete

  const completedSections = [
    financialGoalsComplete,
    growthStrategyComplete,
    defenseStrategyComplete,
    savingsVsSpendingComplete,
  ].filter(Boolean).length

  const handleSignOut = async () => {
    setShowFeedbackDialog(true)
  }

  const completeSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const quickStats = [
    {
      label: "Sections Completed",
      value: `${completedSections}/4`,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Action Items",
      value: completedSections === 4 ? "5" : "1",
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      label: "Goals Set",
      value: assessment?.financialGoals?.college_planning_for_children ? "3+" : "0",
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ]

  const tools = [
    {
      icon: Target,
      title: "Section 1: Financial Goals",
      description: "College planning, retirement goals, medical/LTC, and legacy planning",
      href: "/financial-goals/form",
      resultsHref: "/financial-goals/results",
      status: financialGoalsComplete ? "completed" : "available",
      category: "independent",
    },
    {
      icon: TrendingUp,
      title: "Section 2: Current Growth Strategy (Offensive)",
      description: "Retirement accounts, investments, real estate, and Social Security",
      href: "/growth-strategy/form",
      resultsHref: "/growth-strategy/results",
      status: growthStrategyComplete ? "completed" : "available",
      category: "independent",
    },
    {
      icon: Shield,
      title: "Section 3: Current Defense Strategy (Defensive)",
      description: "Life insurance, disability, emergency fund, and estate planning",
      href: "/defense-strategy/form",
      resultsHref: "/defense-strategy/results",
      status: defenseStrategyComplete ? "completed" : "available",
      category: "independent",
    },
    {
      icon: Wallet,
      title: "Section 4: Savings vs Spending Analysis",
      description: "30/30/20/20 rule analysis, budget optimization, and scenario modeling",
      href: "/savings-vs-spending/form",
      resultsHref: "/savings-vs-spending/results",
      status: savingsVsSpendingComplete ? "completed" : "available",
      category: "independent",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-gradient-x">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Planning Hub</h1>
              <p className="text-sm text-slate-600">Welcome back, {profile?.full_name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Making bell icon navigate to notifications page */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => router.push("/notifications")}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {quickStats.map((stat, index) => (
            <Card
              key={stat.label}
              className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="relative">
                    <div
                      className={`absolute inset-0 ${stat.color.replace("text-", "bg-")} opacity-10 rounded-full blur-xl`}
                    ></div>
                    <stat.icon className={`w-10 h-10 ${stat.color} relative z-10`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final Report CTA when all sections complete */}
        {allSectionsComplete && (
          <Card className="mb-10 border-0 shadow-xl bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                    <h3 className="text-2xl font-bold text-white drop-shadow-sm">All Sections Complete!</h3>
                  </div>
                  <p className="text-green-50 text-base mb-6 max-w-2xl">
                    Congratulations! You've completed all four sections. Generate your comprehensive financial report to
                    see your complete analysis and personalized recommendations.
                  </p>
                  <Button
                    asChild
                    className="bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Link href="/final-report">
                      Generate Final Report
                      <FileText className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                <CheckCircle2 className="w-32 h-32 text-white/20 hidden lg:block" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {!allSectionsComplete && (
          <Card className="mb-10 border-0 shadow-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">
                    Complete Your Financial Assessment
                  </h3>
                  <p className="text-blue-50 text-base mb-6 max-w-2xl">
                    Each section provides independent analysis and recommendations. Start with any section that
                    interests you most.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Link href="/financial-goals/form">
                        Start Financial Goals
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                    >
                      <Link href="/growth-strategy/form">Growth Strategy</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                    >
                      <Link href="/defense-strategy/form">Defense Strategy</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                    >
                      <Link href="/savings-vs-spending/form">Savings vs Spending Analysis</Link>
                    </Button>
                  </div>
                </div>
                <FileText className="w-32 h-32 text-white/20 hidden lg:block" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">
            {allSectionsComplete ? "Your Completed Sections" : "Your Financial Planning Journey"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tools.map((tool, index) => (
              <ToolCard key={tool.title} tool={tool} sectionNumber={index + 1} />
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                Schedule a Consultation
              </CardTitle>
              <CardDescription className="text-base">
                Book a free 30-minute consultation with our financial advisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                <Link href="https://scheduler.zoom.us/anand-pq9c9z/1-1-with-anand" target="_blank">
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                Resources & Guides
              </CardTitle>
              <CardDescription className="text-base">
                Learn more about financial planning strategies and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-2 hover:bg-slate-50 transition-all bg-transparent">
                View Resources
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} onSubmit={completeSignOut} />
    </div>
  )
}

function ToolCard({ tool, sectionNumber }: { tool: any; sectionNumber: number }) {
  const statusColors = {
    completed: "bg-green-100 text-green-800 border-green-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
    "not-started": "bg-slate-100 text-slate-800 border-slate-200",
    available: "bg-green-100 text-green-800 border-green-200",
    locked: "bg-orange-100 text-orange-800 border-orange-200",
  }

  const isLocked = tool.status === "locked"
  const isCompleted = tool.status === "completed"

  return (
    <Card
      className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm ${isLocked ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            <span className="text-2xl font-bold text-white drop-shadow-sm">{sectionNumber}</span>
          </div>
          {tool.status && (
            <Badge variant="outline" className={`${statusColors[tool.status]} font-semibold px-3 py-1`}>
              {tool.status === "not-started" && "Start"}
              {tool.status === "in-progress" && "In Progress"}
              {tool.status === "completed" && "✓ Complete"}
              {tool.status === "available" && "Available"}
              {tool.status === "locked" && "🔒 Locked"}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl leading-tight mb-2">{tool.title}</CardTitle>
        <CardDescription className="text-base">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {tool.progress !== undefined && tool.progress > 0 && (
          <div className="mb-4">
            <Progress value={tool.progress} className="h-2.5" />
            <p className="text-xs text-slate-600 mt-2 font-medium">{Math.round(tool.progress)}% complete</p>
          </div>
        )}
        {isCompleted ? (
          <Button
            asChild
            variant="outline"
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 bg-transparent"
          >
            <Link href={tool.href} className="flex items-center justify-center">
              Edit Section
              <Settings className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild={!isLocked}
            variant={isLocked ? "ghost" : "default"}
            className={`w-full ${!isLocked ? "bg-slate-900 text-white hover:bg-blue-600 shadow-md hover:shadow-lg" : ""} transition-all duration-300`}
            disabled={isLocked}
          >
            {isLocked ? (
              <span>Complete Previous Section</span>
            ) : (
              <Link href={tool.href} className="flex items-center justify-center">
                Start Assessment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
