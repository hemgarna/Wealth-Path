"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Phone, MapPin, Briefcase, Users } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface OnboardingFormProps {
  initialData: any
  userId: string
}

export default function OnboardingForm({ initialData, userId }: OnboardingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: initialData?.full_name?.split(" ")[0] || "",
    lastName: initialData?.full_name?.split(" ").slice(1).join(" ") || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    occupation: initialData?.occupation || "",
    dependents: initialData?.dependents || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createBrowserClient()

      const fullName = `${formData.firstName} ${formData.lastName}`.trim()

      // Update profile with onboarding data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: formData.phone,
          address: formData.address,
          occupation: formData.occupation,
          dependents: Number.parseInt(formData.dependents) || 0,
          onboarding_completed: true,
        })
        .eq("id", userId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Redirect to home page
      router.push("/home")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide some basic information to help us personalize your financial assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="inline-block w-4 h-4 mr-2" />
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="inline-block w-4 h-4 mr-2" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              Address *
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main St, City, State, ZIP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">
              <Briefcase className="inline-block w-4 h-4 mr-2" />
              Occupation *
            </Label>
            <Input
              id="occupation"
              type="text"
              placeholder="Software Engineer"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependents">
              <Users className="inline-block w-4 h-4 mr-2" />
              Number of Dependents *
            </Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              placeholder="0"
              value={formData.dependents}
              onChange={(e) => setFormData({ ...formData, dependents: e.target.value })}
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500">Including children and other family members you support</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              "Complete Profile & Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
