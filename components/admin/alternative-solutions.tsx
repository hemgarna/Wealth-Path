"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, FileText, Download } from "lucide-react"

interface Solution {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  estimated_cost: number | null
  expected_benefit: string | null
  created_at: string
  advisor_id: string
}

interface AlternativeSolutionsProps {
  caseId: string
  advisorId: string
}

export function AlternativeSolutions({ caseId, advisorId }: AlternativeSolutionsProps) {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pros, setPros] = useState("")
  const [cons, setCons] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [expectedBenefit, setExpectedBenefit] = useState("")

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchSolutions()
  }, [caseId])

  async function fetchSolutions() {
    setLoading(true)
    const { data, error } = await supabase
      .from("alternative_solutions")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setSolutions(data)
    }
    setLoading(false)
  }

  async function addSolution() {
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required")
      return
    }

    setSaving(true)

    const prosArray = pros.split("\n").filter((p) => p.trim())
    const consArray = cons.split("\n").filter((c) => c.trim())

    const { error } = await supabase.from("alternative_solutions").insert({
      case_id: caseId,
      advisor_id: advisorId,
      title,
      description,
      pros: prosArray,
      cons: consArray,
      estimated_cost: estimatedCost ? Number.parseFloat(estimatedCost) : null,
      expected_benefit: expectedBenefit || null,
    })

    if (error) {
      console.error("Error adding solution:", error)
      alert("Failed to add solution")
    } else {
      resetForm()
      setDialogOpen(false)
      fetchSolutions()
    }
    setSaving(false)
  }

  async function deleteSolution(solutionId: string) {
    if (!confirm("Are you sure you want to delete this solution?")) return

    const { error } = await supabase.from("alternative_solutions").delete().eq("id", solutionId)

    if (error) {
      console.error("Error deleting solution:", error)
      alert("Failed to delete solution")
    } else {
      fetchSolutions()
    }
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setPros("")
    setCons("")
    setEstimatedCost("")
    setExpectedBenefit("")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Alternative Solutions Reports</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gray-900 hover:bg-gray-800 gap-2">
              <Plus className="h-4 w-4" />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Alternative Solution Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Solution Title</Label>
                <Input
                  placeholder="e.g., Roth Conversion Strategy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the solution in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Pros (one per line)</Label>
                <Textarea
                  placeholder="Lower tax burden in retirement&#10;More flexibility&#10;Tax-free growth"
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Cons (one per line)</Label>
                <Textarea
                  placeholder="Upfront tax cost&#10;Complex calculations&#10;Requires careful planning"
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estimated Cost ($)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Benefit</Label>
                  <Input
                    placeholder="e.g., $50k tax savings"
                    value={expectedBenefit}
                    onChange={(e) => setExpectedBenefit(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addSolution} disabled={saving}>
                  {saving ? "Adding..." : "Add Report"}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Solutions List */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading reports...</p>
        ) : solutions.length === 0 ? (
          <p className="text-sm text-gray-500">No alternative solutions reports yet</p>
        ) : (
          solutions.map((solution) => (
            <div key={solution.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{solution.title}</p>
                <p className="text-sm text-gray-600 mt-1">{solution.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Uploaded by {solution.advisor_id === advisorId ? "You" : "Advisor"}</span>
                  <span>•</span>
                  <span>{new Date(solution.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
