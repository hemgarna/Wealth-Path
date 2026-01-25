"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, Calendar, Shield } from "lucide-react"

export default function DefenseStrategyResults({ data }: { data: any }) {
  const router = useRouter()

  // Calculate protection score
  const protectionItems = [
    data.has_life_insurance_self,
    data.has_life_insurance_spouse,
    data.has_disability_insurance_self,
    data.has_disability_insurance_spouse,
    data.has_ltc_insurance_self,
    data.has_ltc_insurance_spouse,
    data.has_umbrella_insurance,
    data.has_health_insurance,
    data.has_will,
    data.has_trust,
    data.has_poa,
    data.has_healthcare_directive,
  ]

  const protectionScore = Math.round((protectionItems.filter(Boolean).length / protectionItems.length) * 100)

  const criticalGaps = []
  if (!data.has_life_insurance_self) criticalGaps.push("Life Insurance (Self)")
  if (!data.has_disability_insurance_self) criticalGaps.push("Disability Insurance (Self)")
  if (!data.has_will) criticalGaps.push("Will")
  if (!data.has_health_insurance) criticalGaps.push("Health Insurance")

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Defense Strategy Assessment</h1>
          <p className="text-slate-600">Your protective coverage analysis</p>
        </div>

        {/* Protection Score */}
        <Card className="mb-8 border-red-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
            <CardTitle className="text-2xl">Your Protection Score</CardTitle>
            <CardDescription className="text-red-100">Coverage completeness assessment</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl font-bold text-red-600">{protectionScore}%</span>
              <Shield className="w-16 h-16 text-red-500" />
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all"
                style={{ width: `${protectionScore}%` }}
              />
            </div>
            <p className="text-slate-600 mt-4">
              {protectionScore >= 75
                ? "Strong protection coverage across most areas"
                : protectionScore >= 50
                  ? "Good foundation, but critical gaps remain"
                  : "Significant protection gaps require immediate attention"}
            </p>
          </CardContent>
        </Card>

        {/* Critical Gaps Alert */}
        {criticalGaps.length > 0 && (
          <Card className="mb-8 border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-6 h-6" />
                Critical Protection Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">The following critical protections are missing:</p>
              <ul className="space-y-2">
                {criticalGaps.map((gap) => (
                  <li key={gap} className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    {gap}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Coverage Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Life Insurance */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle>Life Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Self</span>
                    {data.has_life_insurance_self ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {data.has_life_insurance_self ? (
                    <div>
                      <p className="text-sm text-slate-600">
                        Coverage: ${data.life_insurance_coverage_self?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-slate-600">Type: {data.life_insurance_type_self || "N/A"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No coverage</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Spouse</span>
                    {data.has_life_insurance_spouse ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  {data.has_life_insurance_spouse ? (
                    <div>
                      <p className="text-sm text-slate-600">
                        Coverage: ${data.life_insurance_coverage_spouse?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-slate-600">Type: {data.life_insurance_type_spouse || "N/A"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-orange-600">No coverage</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disability Insurance */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle>Disability Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Self</span>
                    {data.has_disability_insurance_self ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {data.has_disability_insurance_self ? (
                    <p className="text-sm text-slate-600">
                      Monthly Benefit: ${data.disability_coverage_monthly_self?.toLocaleString() || 0}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">No coverage</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Spouse</span>
                    {data.has_disability_insurance_spouse ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  {data.has_disability_insurance_spouse ? (
                    <p className="text-sm text-slate-600">
                      Monthly Benefit: ${data.disability_coverage_monthly_spouse?.toLocaleString() || 0}
                    </p>
                  ) : (
                    <p className="text-sm text-orange-600">No coverage</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Long-term Care */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle>Long-term Care Insurance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Self</span>
                    {data.has_ltc_insurance_self ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  {data.has_ltc_insurance_self ? (
                    <p className="text-sm text-slate-600">
                      Daily Benefit: ${data.ltc_daily_benefit_self?.toLocaleString() || 0}
                    </p>
                  ) : (
                    <p className="text-sm text-orange-600">No coverage</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Spouse</span>
                    {data.has_ltc_insurance_spouse ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  {data.has_ltc_insurance_spouse ? (
                    <p className="text-sm text-slate-600">
                      Daily Benefit: ${data.ltc_daily_benefit_spouse?.toLocaleString() || 0}
                    </p>
                  ) : (
                    <p className="text-sm text-orange-600">No coverage</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Coverage */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle>Additional Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Umbrella Insurance</span>
                  {data.has_umbrella_insurance ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                {data.has_umbrella_insurance && (
                  <p className="text-sm text-slate-600">Coverage: ${data.umbrella_coverage?.toLocaleString() || 0}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Health Insurance</span>
                  {data.has_health_insurance ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                {data.has_health_insurance && (
                  <div>
                    <p className="text-sm text-slate-600">
                      Deductible: ${data.health_insurance_deductible?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-slate-600">
                      OOP Max: ${data.health_insurance_oop_max?.toLocaleString() || 0}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estate Planning */}
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle>Estate Planning Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {data.has_will ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm">Will</span>
              </div>
              <div className="flex items-center gap-2">
                {data.has_trust ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
                <span className="text-sm">Trust</span>
              </div>
              <div className="flex items-center gap-2">
                {data.has_poa ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
                <span className="text-sm">Power of Attorney</span>
              </div>
              <div className="flex items-center gap-2">
                {data.has_healthcare_directive ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
                <span className="text-sm">Healthcare Directive</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-red-300 shadow-xl bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Professional Guidance Required for Defense Strategy
              </h3>
              <p className="text-slate-600 mb-6">
                Protection planning requires expert analysis. Schedule a free consultation with our licensed advisors to
                address your gaps and optimize your coverage.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/defense-strategy/form")}>
                  Edit Assessment
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-600 to-rose-600"
                  onClick={() => window.open("https://scheduler.zoom.us/anand-pq9c9z/1-1-with-anand", "_blank")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Free Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
