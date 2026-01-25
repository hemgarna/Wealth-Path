"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { AssessmentData } from "@/app/assessment/page"
import { Plus, X } from "lucide-react"

type Props = {
  data: Partial<AssessmentData>
  updateData: (data: Partial<AssessmentData>) => void
}

export function PersonalInfoStep({ data, updateData }: Props) {
  const addChild = () => {
    const currentAges = data.children_ages || []
    updateData({
      number_of_children: (data.number_of_children || 0) + 1,
      children_ages: [...currentAges, 0],
    })
  }

  const removeChild = (index: number) => {
    const currentAges = data.children_ages || []
    updateData({
      number_of_children: (data.number_of_children || 0) - 1,
      children_ages: currentAges.filter((_, i) => i !== index),
    })
  }

  const updateChildAge = (index: number, age: number) => {
    const currentAges = [...(data.children_ages || [])]
    currentAges[index] = age
    updateData({ children_ages: currentAges })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Personal Information</h3>
        <p className="text-muted-foreground mb-6">Tell us about yourself and your family.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            type="text"
            value={data.full_name || ""}
            onChange={(e) => updateData({ full_name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ""}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ""}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            type="text"
            value={data.occupation || ""}
            onChange={(e) => updateData({ occupation: e.target.value })}
            placeholder="Your occupation"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dependents">Number of Dependents</Label>
          <Input
            id="dependents"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.dependents || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "")
              updateData({ dependents: value ? Number.parseInt(value) : 0 })
            }}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="occupation">Your Profession/Occupation</Label>
          <Input
            id="occupation"
            type="text"
            value={data.occupation || ""}
            onChange={(e) => updateData({ occupation: e.target.value })}
            placeholder="Software Engineer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spouse_occupation">Spouse Profession/Occupation</Label>
          <Input
            id="spouse_occupation"
            type="text"
            value={data.spouse_occupation || ""}
            onChange={(e) => updateData({ spouse_occupation: e.target.value })}
            placeholder="Teacher"
          />
          <p className="text-xs text-muted-foreground">Leave blank if not applicable</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={data.date_of_birth || ""}
            onChange={(e) => updateData({ date_of_birth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retirement_age">Planned Retirement Age</Label>
          <Input
            id="retirement_age"
            type="number"
            value={data.retirement_age || ""}
            onChange={(e) => updateData({ retirement_age: Number.parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <Label>Marital Status</Label>
        <RadioGroup
          value={data.marital_status || "single"}
          onValueChange={(value) => updateData({ marital_status: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <label htmlFor="single" className="text-sm font-medium">
              Single
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="married" id="married" />
            <label htmlFor="married" className="text-sm font-medium">
              Married
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="divorced" id="divorced" />
            <label htmlFor="divorced" className="text-sm font-medium">
              Divorced
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="widowed" id="widowed" />
            <label htmlFor="widowed" className="text-sm font-medium">
              Widowed
            </label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label>Children</Label>
          <Button type="button" variant="outline" size="sm" onClick={addChild} className="gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Child
          </Button>
        </div>

        {(data.children_ages || []).map((age, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                value={age}
                onChange={(e) => updateChildAge(index, Number.parseInt(e.target.value) || 0)}
                placeholder="Child's age"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeChild(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {(!data.children_ages || data.children_ages.length === 0) && (
          <p className="text-sm text-muted-foreground italic">No children added yet</p>
        )}
      </div>
    </div>
  )
}
