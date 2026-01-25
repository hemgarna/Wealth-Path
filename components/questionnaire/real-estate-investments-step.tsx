"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  data: any
  updateData: (data: any) => void
}

export default function RealEstateInvestmentsStep({ data, updateData }: Props) {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return ""
    return value.toString()
  }

  const parseCurrency = (value: string) => {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""))
    return isNaN(parsed) ? 0 : parsed
  }

  return (
    <div className="space-y-6">
      {/* Real Estate */}
      <Card>
        <CardHeader>
          <CardTitle>Real Estate Investments (USA)</CardTitle>
          <CardDescription>Personal home, rental properties, and land</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_personal_home"
                checked={data.has_personal_home || false}
                onCheckedChange={(checked) => updateData({ has_personal_home: checked })}
              />
              <Label htmlFor="has_personal_home" className="font-normal cursor-pointer">
                Personal Home Equity
              </Label>
            </div>
            {data.has_personal_home && (
              <div>
                <Label htmlFor="personal_home_equity">Home Equity Value</Label>
                <Input
                  id="personal_home_equity"
                  type="number"
                  value={formatCurrency(data.personal_home_equity)}
                  onChange={(e) => updateData({ personal_home_equity: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_rental_properties"
                checked={data.has_rental_properties || false}
                onCheckedChange={(checked) => updateData({ has_rental_properties: checked })}
              />
              <Label htmlFor="has_rental_properties" className="font-normal cursor-pointer">
                Rental Properties
              </Label>
            </div>
            {data.has_rental_properties && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rental_properties_value">Property Value</Label>
                  <Input
                    id="rental_properties_value"
                    type="number"
                    value={formatCurrency(data.rental_properties_value)}
                    onChange={(e) => updateData({ rental_properties_value: parseCurrency(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rental_income_monthly">Monthly Rental Income</Label>
                  <Input
                    id="rental_income_monthly"
                    type="number"
                    value={formatCurrency(data.rental_income_monthly)}
                    onChange={(e) => updateData({ rental_income_monthly: parseCurrency(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_land_parcels"
                checked={data.has_land_parcels || false}
                onCheckedChange={(checked) => updateData({ has_land_parcels: checked })}
              />
              <Label htmlFor="has_land_parcels" className="font-normal cursor-pointer">
                Land Parcels
              </Label>
            </div>
            {data.has_land_parcels && (
              <div>
                <Label htmlFor="land_value">Land Value</Label>
                <Input
                  id="land_value"
                  type="number"
                  value={formatCurrency(data.land_value)}
                  onChange={(e) => updateData({ land_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_usa_inheritance"
                checked={data.has_usa_inheritance || false}
                onCheckedChange={(checked) => updateData({ has_usa_inheritance: checked })}
              />
              <Label htmlFor="has_usa_inheritance" className="font-normal cursor-pointer">
                Inheritance in the USA
              </Label>
            </div>
            {data.has_usa_inheritance && (
              <div>
                <Label htmlFor="usa_inheritance_value">Inheritance Value</Label>
                <Input
                  id="usa_inheritance_value"
                  type="number"
                  value={formatCurrency(data.usa_inheritance_value)}
                  onChange={(e) => updateData({ usa_inheritance_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stocks & Business */}
      <Card>
        <CardHeader>
          <CardTitle>Stocks, Business & Income (USA)</CardTitle>
          <CardDescription>Investments outside of retirement accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_stocks_outside_401k"
                checked={data.has_stocks_outside_401k || false}
                onCheckedChange={(checked) => updateData({ has_stocks_outside_401k: checked })}
              />
              <Label htmlFor="has_stocks_outside_401k" className="font-normal cursor-pointer">
                Stocks / MFs / Bonds / ETFs (Outside of 401K)
              </Label>
            </div>
            {data.has_stocks_outside_401k && (
              <div>
                <Label htmlFor="stocks_value">Stocks Portfolio Value</Label>
                <Input
                  id="stocks_value"
                  type="number"
                  value={formatCurrency(data.stocks_value)}
                  onChange={(e) => updateData({ stocks_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="owns_business"
                checked={data.owns_business || false}
                onCheckedChange={(checked) => updateData({ owns_business: checked })}
              />
              <Label htmlFor="owns_business" className="font-normal cursor-pointer">
                Own a Business
              </Label>
            </div>
            {data.owns_business && (
              <div>
                <Label htmlFor="business_value">Business Value</Label>
                <Input
                  id="business_value"
                  type="number"
                  value={formatCurrency(data.business_value)}
                  onChange={(e) => updateData({ business_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_alternative_investments"
                checked={data.has_alternative_investments || false}
                onCheckedChange={(checked) => updateData({ has_alternative_investments: checked })}
              />
              <Label htmlFor="has_alternative_investments" className="font-normal cursor-pointer">
                Alternative Investments (Private Equity, Crowdfunding, etc.)
              </Label>
            </div>
            {data.has_alternative_investments && (
              <div>
                <Label htmlFor="alternative_investments_value">Alternative Investments Value</Label>
                <Input
                  id="alternative_investments_value"
                  type="number"
                  value={formatCurrency(data.alternative_investments_value)}
                  onChange={(e) => updateData({ alternative_investments_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_cds"
                checked={data.has_cds || false}
                onCheckedChange={(checked) => updateData({ has_cds: checked })}
              />
              <Label htmlFor="has_cds" className="font-normal cursor-pointer">
                Certificate of Deposits (Bank CDs)
              </Label>
            </div>
            {data.has_cds && (
              <div>
                <Label htmlFor="cds_value">CDs Value</Label>
                <Input
                  id="cds_value"
                  type="number"
                  value={formatCurrency(data.cds_value)}
                  onChange={(e) => updateData({ cds_value: parseCurrency(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cash & Emergency Fund */}
      <Card>
        <CardHeader>
          <CardTitle>Cash & Emergency Fund</CardTitle>
          <CardDescription>Liquid assets for emergencies and opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cash_in_bank">Cash in Bank</Label>
            <Input
              id="cash_in_bank"
              type="number"
              value={formatCurrency(data.cash_in_bank)}
              onChange={(e) => updateData({ cash_in_bank: parseCurrency(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="emergency_fund">Emergency Fund</Label>
            <Input
              id="emergency_fund"
              type="number"
              value={formatCurrency(data.emergency_fund)}
              onChange={(e) => updateData({ emergency_fund: parseCurrency(e.target.value) })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">Recommended: 6-12 months of expenses</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
