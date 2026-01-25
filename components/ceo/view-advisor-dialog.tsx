"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Mail, Phone } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface ViewAdvisorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advisor: any
}

export function ViewAdvisorDialog({ open, onOpenChange, advisor }: ViewAdvisorDialogProps) {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    if (advisor && open) {
      fetchAdvisorClients()
    }
  }, [advisor, open])

  async function fetchAdvisorClients() {
    setLoading(true)

    const { data } = await supabase.from("profiles").select("*").eq("advisor_id", advisor.id).eq("role", "client")

    setClients(data || [])
    setLoading(false)
  }

  if (!advisor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Advisor Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{advisor.full_name || "Unnamed Advisor"}</h3>
                  <p className="text-sm text-muted-foreground">{advisor.advisor_code || "N/A"}</p>
                </div>
                <Badge className={advisor.advisor_status === "active" ? "bg-emerald-100 text-emerald-700" : ""}>
                  {advisor.advisor_status || "active"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{advisor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{advisor.phone || "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
                  <p className="text-2xl font-bold">{advisor.total_clients || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Cases</p>
                  <p className="text-2xl font-bold">{advisor.active_cases || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Advisor's Clients</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading clients...</p>
            ) : clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients assigned yet</p>
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <Card key={client.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{client.full_name || "Unnamed Client"}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <Badge variant="secondary">Client</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
