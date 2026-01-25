"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, MessageSquare, Bug, Lightbulb, Sparkles, CheckCircle2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export function WebsiteSuggestionsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions()
    }
  }, [isOpen])

  const fetchSuggestions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("website_suggestions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching suggestions:", error)
    } else {
      setSuggestions(data || [])
    }
    setLoading(false)
  }

  const markAsResolved = async (id: string) => {
    const { error } = await supabase
      .from("website_suggestions")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", id)

    if (!error) {
      fetchSuggestions()
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-600" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case "improvement":
        return <Sparkles className="h-4 w-4 text-blue-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      bug: "bg-red-100 text-red-800",
      suggestion: "bg-yellow-100 text-yellow-800",
      improvement: "bg-blue-100 text-blue-800",
      other: "bg-gray-100 text-gray-800",
    }
    return <Badge className={colors[type] || colors.other}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
  }

  const unreadCount = suggestions.filter((s) => !s.read).length
  const unresolvedCount = suggestions.filter((s) => !s.resolved).length

  return (
    <Card className="glass-card border border-gray-200/50">
      <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-2 shadow-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Suggestions for Website Improvement</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Feedback from advisors and clients
                {unresolvedCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unresolvedCount} unresolved
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No feedback submitted yet</p>
          ) : (
            suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suggestion.suggestion_type)}
                      {getTypeBadge(suggestion.suggestion_type)}
                      {suggestion.resolved && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{new Date(suggestion.created_at).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-sm">{suggestion.subject}</p>
                    <p className="text-sm text-gray-700 mt-1">{suggestion.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{suggestion.user_name || "Anonymous"}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{suggestion.user_role}</span>
                      <span className="mx-2">•</span>
                      <span>{suggestion.user_email}</span>
                    </div>
                    {!suggestion.resolved && (
                      <Button size="sm" variant="outline" onClick={() => markAsResolved(suggestion.id)}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      )}
    </Card>
  )
}
