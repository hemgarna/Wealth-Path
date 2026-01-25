"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function DefensiveStrategyStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Which protective measures do you have in place? (Select all that apply)
        </Label>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-3">Insurance Coverage</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="life-insurance"
                  checked={data.has_life_insurance || false}
                  onCheckedChange={(checked) => updateData({ has_life_insurance: checked })}
                />
                <Label htmlFor="life-insurance" className="font-normal cursor-pointer">
                  Life Insurance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disability-insurance"
                  checked={data.has_disability_insurance || false}
                  onCheckedChange={(checked) => updateData({ has_disability_insurance: checked })}
                />
                <Label htmlFor="disability-insurance" className="font-normal cursor-pointer">
                  Disability Insurance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="health-insurance"
                  checked={data.has_health_insurance || false}
                  onCheckedChange={(checked) => updateData({ has_health_insurance: checked })}
                />
                <Label htmlFor="health-insurance" className="font-normal cursor-pointer">
                  Health Insurance
                </Label>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="font-medium mb-3">Financial Safety Net</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergency-fund"
                  checked={data.has_emergency_fund || false}
                  onCheckedChange={(checked) => updateData({ has_emergency_fund: checked })}
                />
                <Label htmlFor="emergency-fund" className="font-normal cursor-pointer">
                  Emergency Fund (3-6 months expenses)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="estate-plan"
                  checked={data.has_estate_plan || false}
                  onCheckedChange={(checked) => updateData({ has_estate_plan: checked })}
                />
                <Label htmlFor="estate-plan" className="font-normal cursor-pointer">
                  Estate Plan (Will, Trust, Power of Attorney)
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="defensive-details" className="text-base font-semibold">
          Additional details (Optional)
        </Label>
        <Textarea
          id="defensive-details"
          placeholder="Share any additional information about your protection strategy..."
          value={data.defensive_details || ""}
          onChange={(e) => updateData({ defensive_details: e.target.value })}
          className="mt-2 min-h-24"
        />
      </div>
    </div>
  )
}
