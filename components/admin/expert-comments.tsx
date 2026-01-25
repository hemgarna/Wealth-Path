"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Check } from "lucide-react"

interface Comment {
  id: string
  comment_text: string
  version: number
  created_at: string
  updated_at: string
  advisor_id: string
  sent_to_client: boolean
}

interface ExpertCommentsProps {
  caseId: string
  advisorId: string
}

export function ExpertComments({ caseId, advisorId }: ExpertCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchComments()
  }, [caseId])

  async function fetchComments() {
    setLoading(true)
    const { data, error } = await supabase
      .from("expert_comments")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setComments(data)
    }
    setLoading(false)
  }

  async function addComment() {
    if (!newComment.trim()) return

    setSaving(true)
    try {
      console.log("[v0] Adding comment - caseId:", caseId, "advisorId:", advisorId)
      
      // Use API route to bypass RLS
      const response = await fetch("/api/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          advisorId,
          commentText: newComment,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error("[v0] Error adding comment:", result.error)
        alert(result.error || "Failed to add comment")
      } else {
        console.log("[v0] Comment added successfully")
        setNewComment("")
        fetchComments()
      }
    } catch (err) {
      console.error("[v0] Error adding comment:", err)
      alert("Failed to add comment")
    }
    setSaving(false)
  }

  async function deleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return

    const { error } = await supabase.from("expert_comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment")
    } else {
      fetchComments()
    }
  }

  async function sendToClient(comment: Comment) {
    setSending(comment.id)

    try {
      console.log("[v0] Sending comment to client - caseId:", caseId, "commentId:", comment.id)

      // Use API route to bypass RLS
      const response = await fetch("/api/notifications/send-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId,
          advisorId,
          commentId: comment.id,
          commentText: comment.comment_text,
        }),
      })

      const result = await response.json()
      console.log("[v0] Send comment API response:", result)

      if (!response.ok) {
        console.error("[v0] Error sending notification:", result.error)
        alert(result.error || "Failed to send notification to client")
      } else {
        // Update comment as sent
        await supabase.from("expert_comments").update({ sent_to_client: true }).eq("id", comment.id)
        alert("Comment sent to client successfully!")
        fetchComments()
      }
    } catch (err) {
      console.error("[v0] Error sending to client:", err)
      alert("Failed to send to client")
    }

    setSending(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Expert Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">No expert comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{comment.advisor_id === advisorId ? "You" : "Advisor"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {comment.sent_to_client ? (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Check className="h-3 w-3" />
                        <span>Sent to client</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendToClient(comment)}
                        disabled={sending === comment.id}
                        className="h-7 text-xs"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {sending === comment.id ? "Sending..." : "Send to Client"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <p className="font-medium text-gray-900">Add Expert Comment</p>
          <Textarea
            placeholder="Enter your expert comments and recommendations..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button
            onClick={addComment}
            disabled={saving || !newComment.trim()}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {saving ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
