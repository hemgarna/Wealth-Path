import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CaseDetailView } from "@/components/admin/case-detail-view"

export default async function CeoCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "ceo") {
    redirect("/home")
  }

  return <CaseDetailView caseId={id} advisorId="ceo" viewAsAdvisorId={undefined} isCeoView={true} />
}
