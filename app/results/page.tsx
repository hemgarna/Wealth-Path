import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ResultsClient from "@/components/results/results-client"

export default async function ResultsPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("[v0] Auth error on results page:", authError)
      redirect("/auth/login")
    }

    if (!user) {
      redirect("/auth/login")
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from("client_assessments")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (assessmentError) {
      console.error("[v0] Assessment fetch error:", assessmentError)
      redirect("/questionnaire")
    }

    if (!assessment) {
      redirect("/questionnaire")
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Profile fetch error:", profileError)
    }

    return <ResultsClient assessment={assessment} profile={profile} />
  } catch (error) {
    console.error("[v0] Results page error:", error)
    redirect("/auth/login")
  }
}
