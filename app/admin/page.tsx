import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminClientList } from "@/components/admin/admin-client-list"
import { Suspense } from "react"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ viewAsAdvisor?: string }>
}) {
  const params = await searchParams

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin/advisor or CEO
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "advisor" && profile.role !== "ceo")) {
    redirect("/home")
  }

  const viewAsAdvisor = params.viewAsAdvisor
  const isCeoViewingAdvisor = profile.role === "ceo" && viewAsAdvisor

  // If CEO is viewing advisor dashboard, fetch advisor info
  let advisorInfo = null
  if (isCeoViewingAdvisor) {
    const { data: advisor } = await supabase
      .from("profiles")
      .select("full_name, email, advisor_code")
      .eq("id", viewAsAdvisor)
      .eq("role", "advisor")
      .single()
    advisorInfo = advisor
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AdminClientList viewAsAdvisorId={isCeoViewingAdvisor ? viewAsAdvisor : undefined} advisorInfo={advisorInfo} />
    </Suspense>
  )
}
