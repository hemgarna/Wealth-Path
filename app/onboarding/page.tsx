import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OnboardingForm from "@/components/onboarding/onboarding-form"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If onboarding already completed, redirect to home
  if (profile?.onboarding_completed) {
    redirect("/home")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Wealth Path!</h1>
          <p className="text-gray-600 text-lg">Let's start by completing your profile</p>
        </div>
        <OnboardingForm initialData={profile} userId={user.id} />
      </div>
    </div>
  )
}
