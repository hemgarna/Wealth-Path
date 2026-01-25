"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, FileText, TrendingUp, CheckCircle2 } from "lucide-react"

interface CeoStatsProps {
  stats: {
    totalAdvisors: number
    activeAdvisors: number
    totalClients: number
    newCasesThisMonth: number
    completedCases: number
  }
  loading: boolean
}

export function CeoStats({ stats, loading }: CeoStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-card border-white/20 dark:border-slate-700/50 animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Financial Advisors",
      value: stats.totalAdvisors,
      subtitle: `${stats.activeAdvisors} active`,
      icon: Users,
      lightGradient: "from-blue-50 via-cyan-50 to-indigo-50",
      darkGradient: "dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      textGradient: "from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400",
      borderColor: "before:bg-gradient-to-r before:from-blue-500 before:to-cyan-500",
    },
    {
      label: "Total Clients",
      value: stats.totalClients,
      subtitle: "Across platform",
      icon: UserCheck,
      lightGradient: "from-emerald-50 via-green-50 to-teal-50",
      darkGradient: "dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      textGradient: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
      borderColor: "before:bg-gradient-to-r before:from-emerald-500 before:to-teal-500",
    },
    {
      label: "New Cases This Month",
      value: stats.newCasesThisMonth,
      subtitle: "Recent signups",
      icon: TrendingUp,
      lightGradient: "from-orange-50 via-amber-50 to-yellow-50",
      darkGradient: "dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      textGradient: "from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400",
      borderColor: "before:bg-gradient-to-r before:from-orange-500 before:to-amber-500",
    },
    {
      label: "Completed Cases",
      value: stats.completedCases,
      subtitle: "Successfully closed",
      icon: CheckCircle2,
      lightGradient: "from-purple-50 via-violet-50 to-fuchsia-50",
      darkGradient: "dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      textGradient: "from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400",
      borderColor: "before:bg-gradient-to-r before:from-purple-500 before:to-fuchsia-500",
    },
    {
      label: "Average per Advisor",
      value: stats.totalAdvisors > 0 ? Math.round(stats.totalClients / stats.totalAdvisors) : 0,
      subtitle: "Clients/advisor",
      icon: FileText,
      lightGradient: "from-slate-50 via-pink-50/30 to-rose-50/20",
      darkGradient: "dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50",
      iconBg: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400",
      textGradient: "from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400",
      borderColor: "before:bg-gradient-to-r before:from-pink-500 before:to-rose-500",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {statCards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className={`glass-card border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative bg-gradient-to-br ${card.lightGradient} ${card.darkGradient} ${card.borderColor} before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-left`}
          >
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">{card.label}</p>
                  <p
                    className={`text-4xl font-bold bg-gradient-to-r ${card.textGradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200 inline-block`}
                  >
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{card.subtitle}</p>
                </div>
                <div
                  className={`rounded-xl ${card.iconBg} p-3 group-hover:scale-110 transition-all duration-200 shadow-lg backdrop-blur-sm`}
                >
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
