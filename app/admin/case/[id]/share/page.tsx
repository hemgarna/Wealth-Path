import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CaseSharing } from "@/components/admin/case-sharing"

export default async function CaseSharingPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin/advisor
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "advisor") {
    redirect("/home")
  }

  return <CaseSharing caseId={params.id} advisorId={user.id} />
}
