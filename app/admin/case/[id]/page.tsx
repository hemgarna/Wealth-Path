import { CaseDetailView } from "@/components/admin/case-detail-view"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ viewAsAdvisor?: string }>
}) {
  const { id } = await params
  const search = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const isCeoView = profile?.role === "ceo"
  const advisorId = user.id

  return <CaseDetailView caseId={id} advisorId={advisorId} viewAsAdvisorId={search?.viewAsAdvisor} isCeoView={isCeoView} />
}
