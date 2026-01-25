"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function OffensiveStrategyStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Which accounts do you currently have? (Select all that apply)
        </Label>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-3">Retirement Accounts</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="401k"
                  checked={data.has_401k || false}
                  onCheckedChange={(checked) => updateData({ has_401k: checked })}
                />
                <Label htmlFor="401k" className="font-normal cursor-pointer">
                  401(k) or 403(b)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ira"
                  checked={data.has_ira || false}
                  onCheckedChange={(checked) => updateData({ has_ira: checked })}
                />
                <Label htmlFor="ira" className="font-normal cursor-pointer">
                  Traditional IRA
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="roth-ira"
                  checked={data.has_roth_ira || false}
                  onCheckedChange={(checked) => updateData({ has_roth_ira: checked })}
                />
                <Label htmlFor="roth-ira" className="font-normal cursor-pointer">
                  Roth IRA
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hsa"
                  checked={data.has_hsa || false}
                  onCheckedChange={(checked) => updateData({ has_hsa: checked })}
                />
                <Label htmlFor="hsa" className="font-normal cursor-pointer">
                  HSA (Health Savings Account)
                </Label>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="font-medium mb-3">Investment Assets</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="real-estate"
                  checked={data.has_real_estate || false}
                  onCheckedChange={(checked) => updateData({ has_real_estate: checked })}
                />
                <Label htmlFor="real-estate" className="font-normal cursor-pointer">
                  Real Estate (beyond primary residence)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="investment-accounts"
                  checked={data.has_investment_accounts || false}
                  onCheckedChange={(checked) => updateData({ has_investment_accounts: checked })}
                />
                <Label htmlFor="investment-accounts" className="font-normal cursor-pointer">
                  Taxable Investment Accounts (Brokerage)
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="offensive-details" className="text-base font-semibold">
          Additional details (Optional)
        </Label>
        <Textarea
          id="offensive-details"
          placeholder="Share any additional information about your investment strategy..."
          value={data.offensive_details || ""}
          onChange={(e) => updateData({ offensive_details: e.target.value })}
          className="mt-2 min-h-24"
        />
      </div>
    </div>
  )
}
