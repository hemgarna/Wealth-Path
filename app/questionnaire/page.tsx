import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import QuestionnaireClient from "@/components/questionnaire/questionnaire-client"

export default async function QuestionnairePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: existingAssessment } = await supabase
    .from("client_assessments")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return <QuestionnaireClient initialData={existingAssessment} userId={user.id} />
}
