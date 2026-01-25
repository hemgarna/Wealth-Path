import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription className="text-base">We sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    Check your inbox for an email from <strong>noreply@mail.app.supabase.io</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    Click the confirmation link in the email to activate your account
                  </p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    Once confirmed, you can sign in and start your financial planning journey
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-medium mb-1">Did not receive the email?</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email address</li>
                      <li>Wait a few minutes and refresh your inbox</li>
                      <li>.edu emails may have strict filtering - try a personal email</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 border-blue-200 hover:bg-blue-50 bg-transparent"
                >
                  <Link href="/auth/resend-confirmation">Resend Confirmation Email</Link>
                </Button>

                <Button
                  asChild
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Link href="/auth/login">Return to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
