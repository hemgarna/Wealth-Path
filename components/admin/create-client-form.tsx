"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Mail,
  User,
  CheckCircle,
  Copy,
  Key,
  Info,
  Send,
} from "lucide-react"

export default function CreateClientForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
  })

  // -----------------------------------
  // FIXED SUBMIT HANDLER
  // -----------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    setCredentials(null)

    try {
      const response = await fetch("/api/advisor/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.clientName,
          email: formData.clientEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create client")
      }

      setSuccess(true)
      setCredentials(data.credentials)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------
  // HELPERS
  // -----------------------------------
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getEmailTemplate = () => {
    if (!credentials) return ""
    return `Hi ${formData.clientName},

I've created an account for you to complete your financial assessment.

Login details:

Email: ${credentials.email}
Temporary Password: ${credentials.password}
Login URL: ${window.location.origin}

Please log in and change your password after your first login.

Best regards`
  }

  const openGmailCompose = () => {
    const subject = encodeURIComponent(
      "Your Financial Assessment Login Credentials"
    )
    const body = encodeURIComponent(getEmailTemplate())
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${formData.clientEmail}&su=${subject}&body=${body}`,
      "_blank"
    )
  }

  const resetForm = () => {
    setFormData({ clientName: "", clientEmail: "" })
    setSuccess(false)
    setCredentials(null)
  }

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Client Account</CardTitle>
        <CardDescription>
          {success
            ? "Client account created successfully."
            : "Enter the client's details to create their account."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">
                <User className="inline-block w-4 h-4 mr-2" />
                Client Name
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">
                <Mail className="inline-block w-4 h-4 mr-2" />
                Client Email
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Create Client
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Client account created successfully for{" "}
                <strong>{formData.clientEmail}</strong>.
              </AlertDescription>
            </Alert>

            {credentials && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span>Email</span>
                  <code>{credentials.email}</code>
                  <Copy
                    className="h-4 w-4 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(credentials.email, "email")
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>Password</span>
                  <code>{credentials.password}</code>
                  <Copy
                    className="h-4 w-4 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(credentials.password, "password")
                    }
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openGmailCompose}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Compose Email in Gmail
                </Button>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={resetForm} className="flex-1">
                Create Another Client
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
