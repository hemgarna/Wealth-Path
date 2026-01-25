"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, MessageSquare, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Assessment = {
  id: string
  user_id: string
  status: string
  profiles: {
    full_name: string
    email: string
  }
  [key: string]: any
}

type Note = {
  id: string
  note_text: string
  is_private: boolean
  created_at: string
}

export function ClientDetailModal({
  assessment,
  advisorId,
  onClose,
  onUpdate,
}: {
  assessment: Assessment
  advisorId: string
  onClose: () => void
  onUpdate: () => void
}) {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load notes
  useEffect(() => {
    async function loadNotes() {
      const { data } = await supabase
        .from("advisor_notes")
        .select("*")
        .eq("client_id", assessment.user_id)
        .order("created_at", { ascending: false })

      if (data) {
        setNotes(data)
      }
    }
    loadNotes()
  }, [assessment.user_id, supabase])

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("advisor_notes").insert({
        advisor_id: advisorId,
        client_id: assessment.user_id,
        assessment_id: assessment.id,
        note_text: newNote,
        is_private: isPrivate,
      })

      if (!error) {
        setNewNote("")
        setIsPrivate(false)
        // Reload notes
        const { data } = await supabase
          .from("advisor_notes")
          .select("*")
          .eq("client_id", assessment.user_id)
          .order("created_at", { ascending: false })
        if (data) setNotes(data)
      }
    } catch (error) {
      console.error("[v0] Error adding note:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkAsReviewed = async () => {
    setIsSaving(true)
    try {
      await supabase.from("client_assessments").update({ status: "reviewed" }).eq("id", assessment.id)
      onUpdate()
      onClose()
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "$0"
    return `$${value.toLocaleString()}`
  }

  const totalAssets =
    (assessment.checking_balance || 0) +
    (assessment.cash_savings || 0) +
    (assessment.investment_accounts || 0) +
    (assessment.retirement_401k || 0) +
    (assessment.retirement_ira || 0) +
    (assessment.home_value || 0) +
    (assessment.other_assets || 0)

  const totalLiabilities =
    (assessment.mortgage_balance || 0) +
    (assessment.student_loans || 0) +
    (assessment.auto_loans || 0) +
    (assessment.credit_card_debt || 0) +
    (assessment.other_debts || 0)

  const netWorth = totalAssets - totalLiabilities

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{assessment.profiles.full_name || "Client Details"}</span>
            <Badge variant={assessment.status === "reviewed" ? "secondary" : "default"}>{assessment.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Full Details</TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Assets:</span>
                  <span className="font-medium">{formatCurrency(totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Liabilities:</span>
                  <span className="font-medium">{formatCurrency(totalLiabilities)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold">Net Worth:</span>
                  <span className={`font-bold ${netWorth >= 0 ? "text-foreground" : "text-destructive"}`}>
                    {formatCurrency(netWorth)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3">Income</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Income:</span>
                    <span className="font-medium">{formatCurrency(assessment.annual_income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spouse Income:</span>
                    <span className="font-medium">{formatCurrency(assessment.spouse_annual_income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Expenses:</span>
                    <span className="font-medium">{formatCurrency(assessment.monthly_expenses)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3">Goals</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retirement Age:</span>
                    <span className="font-medium">{assessment.retirement_age || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retirement Income:</span>
                    <span className="font-medium">{formatCurrency(assessment.desired_retirement_income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Tolerance:</span>
                    <span className="font-medium capitalize">{assessment.risk_tolerance || "N/A"}</span>
                  </div>
                </div>
              </Card>
            </div>

            {assessment.status === "submitted" && (
              <Button onClick={handleMarkAsReviewed} className="w-full gap-2" disabled={isSaving}>
                <CheckCircle2 className="h-4 w-4" />
                Mark as Reviewed
              </Button>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold text-foreground mb-2 text-xs">Data Verification</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Fields in assessment: {Object.keys(assessment).length}</p>
                  <p>
                    Fields with values:{" "}
                    {Object.values(assessment).filter((v) => v !== null && v !== undefined && v !== "").length}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer hover:text-foreground">View all data keys</summary>
                    <pre className="mt-2 p-2 bg-background rounded text-[10px] max-h-40 overflow-auto">
                      {JSON.stringify(Object.keys(assessment).sort(), null, 2)}
                    </pre>
                  </details>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3">Personal Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">{assessment.date_of_birth || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marital Status:</span>
                    <span className="font-medium capitalize">{assessment.marital_status || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Children:</span>
                    <span className="font-medium">{assessment.number_of_children || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3">Assets</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checking:</span>
                    <span className="font-medium">{formatCurrency(assessment.checking_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Savings:</span>
                    <span className="font-medium">{formatCurrency(assessment.cash_savings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investments:</span>
                    <span className="font-medium">{formatCurrency(assessment.investment_accounts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">401(k):</span>
                    <span className="font-medium">{formatCurrency(assessment.retirement_401k)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IRA:</span>
                    <span className="font-medium">{formatCurrency(assessment.retirement_ira)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Home Value:</span>
                    <span className="font-medium">{formatCurrency(assessment.home_value)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-foreground mb-3">Liabilities</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mortgage:</span>
                    <span className="font-medium">{formatCurrency(assessment.mortgage_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student Loans:</span>
                    <span className="font-medium">{formatCurrency(assessment.student_loans)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto Loans:</span>
                    <span className="font-medium">{formatCurrency(assessment.auto_loans)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit Cards:</span>
                    <span className="font-medium">{formatCurrency(assessment.credit_card_debt)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Add Note</Label>
                  <Textarea
                    id="note"
                    placeholder="Enter your notes about this client..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                  />
                  <label htmlFor="private" className="text-sm font-medium">
                    Private note (not visible to client)
                  </label>
                </div>
                <Button onClick={handleAddNote} disabled={isSaving || !newNote.trim()} className="gap-2">
                  <Save className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </Card>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notes yet</p>
                </Card>
              ) : (
                notes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {note.is_private && <Badge variant="outline">Private</Badge>}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note.note_text}</p>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
