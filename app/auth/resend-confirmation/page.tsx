import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Resend Confirmation Email",
  description: "Resend your email confirmation link",
}

export default function ResendConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Resend Confirmation</CardTitle>
            </div>
            <CardDescription>Enter your email to receive a new confirmation link</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/auth/resend-confirmation/submit" method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11" size="lg">
                Resend Confirmation Email
              </Button>

              <div className="text-center space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">Don't forget to check your spam folder</p>
                <Link
                  href="/auth/login"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-sm text-yellow-900 mb-2">Email Not Arriving?</h3>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Emails from: noreply@mail.app.supabase.io</li>
            <li>• .edu email addresses may have strict filters</li>
            <li>• Try using a Gmail or personal email instead</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
