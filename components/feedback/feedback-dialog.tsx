"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { MessageSquare, Bug, Lightbulb, Sparkles, X } from "lucide-react"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function FeedbackDialog({ open, onOpenChange, onSubmit }: FeedbackDialogProps) {
  const [type, setType] = useState<string>("suggestion")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Please enter your feedback")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion_type: type,
          subject: subject.trim() || "No subject",
          message: message.trim(),
        }),
      })

      if (response.ok) {
        // Reset form
        setType("suggestion")
        setSubject("")
        setMessage("")
        onOpenChange(false)
        onSubmit()
      } else {
        const error = await response.json()
        alert(`Failed to submit feedback: ${error.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[v0] Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onOpenChange(false)
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Before you go...
          </DialogTitle>
          <DialogDescription className="text-base">
            Help us improve! Do you have any suggestions or did you encounter any bugs?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label htmlFor="feedback-type">Type of Feedback</Label>
            <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
                <Label
                  htmlFor="bug"
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-200 p-3 cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <Bug className="h-4 w-4" />
                  Bug Report
                </Label>
              </div>
              <div>
                <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                <Label
                  htmlFor="suggestion"
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-200 p-3 cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <Lightbulb className="h-4 w-4" />
                  Suggestion
                </Label>
              </div>
              <div>
                <RadioGroupItem value="improvement" id="improvement" className="peer sr-only" />
                <Label
                  htmlFor="improvement"
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-200 p-3 cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Improvement
                </Label>
              </div>
              <div>
                <RadioGroupItem value="other" id="other" className="peer sr-only" />
                <Label
                  htmlFor="other"
                  className="flex items-center gap-2 rounded-lg border-2 border-gray-200 p-3 cursor-pointer hover:border-blue-300 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder="Brief description..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Feedback *</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think, what issues you encountered, or how we can improve..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">{message.length}/1000 characters</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSkip} variant="outline" className="flex-1 bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
