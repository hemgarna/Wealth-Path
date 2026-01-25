"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Check, TrendingUp, ChevronDown } from "lucide-react"
import { trackEvent } from "@/lib/tracking"

export default function HomePage() {
  useEffect(() => {
    trackEvent("landing_page_view")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-0 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50 animate-fade-in-down shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                FNA APP
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 transition-all"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl text-balance animate-fade-in-up">
              Know Your Gaps. Build Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Future.
              </span>
            </h1>

            <p className="mb-10 text-xl text-gray-600 text-balance animate-fade-in-up animation-delay-200">
              Your Roadmap to Financial Freedom Starts Here
            </p>

            <div className="flex flex-col items-center gap-6 animate-fade-in-up animation-delay-300">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white gap-2 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 animate-fade-in animation-delay-400 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Comprehensive assessment</span>
                </div>
                <div className="flex items-center gap-2 animate-fade-in animation-delay-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Free analysis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="py-20 sm:py-24 relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-16 animate-fade-in-up">
            What You&apos;ll Discover
          </h2>

          <div className="grid gap-8 sm:grid-cols-2">
            {[
              {
                number: "1",
                title: "Retirement Gap Analysis",
                description: "Will you run out of money? When? How much short?",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
              },
              {
                number: "2",
                title: "College Funding Calculator",
                description: "Can you afford your kids' education debt-free?",
                color: "from-green-500 to-emerald-600",
                bgColor: "from-green-50 to-green-100",
              },
              {
                number: "3",
                title: "Insurance Protection Review",
                description: "Is your family financially protected?",
                color: "from-orange-500 to-amber-600",
                bgColor: "from-orange-50 to-orange-100",
              },
              {
                number: "4",
                title: "Budget Optimization (30/30/20/20)",
                description: "Where's your money going? Where should it go?",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
              },
              {
                number: "5",
                title: "Tax Efficiency Check",
                description: "Are you overpaying taxes by thousands?",
                color: "from-pink-500 to-rose-600",
                bgColor: "from-pink-50 to-pink-100",
              },
            ].map((item, index) => (
              <div
                key={item.number}
                className={`relative group animate-slide-in-left animation-delay-${(index + 1) * 100}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm`}
                />
                <div className="relative flex gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:scale-105">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white font-bold shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110`}
                    >
                      {item.number}
                    </div>
                  </div>
                  <div className="border-l-4 border-transparent group-hover:border-current pl-4 transition-all">
                    <h3
                      className={`text-xl font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center animate-fade-in animation-delay-500">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
              >
                Start Your Free Assessment
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How This Tool Will Help You - Video Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-white/50 to-blue-50/50 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-12 animate-fade-in-up">
            How This Tool Will Help You
          </h2>

          <div className="relative aspect-video bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl overflow-hidden shadow-2xl animate-scale-in animation-delay-200 group border-4 border-white/50">
            {/* Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <button className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl transition-all hover:scale-110 group-hover:shadow-3xl group-hover:from-gray-800 group-hover:to-gray-700">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-gray-600 animate-fade-in animation-delay-300">
            Watch how our tool helps you identify financial gaps and build a secure future
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            What Our Clients Say
          </h2>
          <p className="text-center text-gray-600 mb-12 animate-fade-in animation-delay-200">
            Join thousands of satisfied clients who have transformed their financial future
          </p>
          <div className="grid gap-6 md:grid-cols-3 animate-fade-in-up animation-delay-300">
            {[
              {
                name: "Sarah Mitchell",
                role: "Tech Executive",
                gradient: "from-blue-400 to-blue-600",
                text: "This platform helped me identify $50,000 in retirement savings gaps I didn't know existed. The personalized insights were invaluable.",
              },
              {
                name: "James Rodriguez",
                role: "Small Business Owner",
                gradient: "from-green-400 to-emerald-600",
                text: "Finally, a tool that speaks my language. No jargon, just clear action steps to secure my family's future.",
              },
              {
                name: "Emily Chen",
                role: "Marketing Director",
                gradient: "from-purple-400 to-purple-600",
                text: "The interactive assessment made financial planning actually enjoyable. I now have a roadmap I understand and can follow.",
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`h-12 w-12 rounded-full bg-gradient-to-br ${testimonial.gradient} shadow-md group-hover:shadow-lg transition-all group-hover:scale-110`}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <blockquote className="text-gray-600 leading-relaxed">{testimonial.text}</blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-24 relative z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-16 animate-fade-in-up">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              { q: "How long does it take?", a: "The assessment takes about 10-15 minutes to complete." },
              { q: "Is it really free?", a: "Yes, the assessment and basic analysis are completely free." },
              { q: "Is my data secure?", a: "Absolutely. We use bank-level encryption to protect your information." },
              {
                q: "Do I have to book a consultation?",
                a: "No, consultations are optional. You'll get your analysis immediately after completing the assessment.",
              },
            ].map((item, index) => (
              <details
                key={index}
                className={`group border border-gray-200 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all animate-fade-in-up animation-delay-${(index + 1) * 100}`}
              >
                <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-gray-900 list-none">
                  <span className="group-hover:text-blue-600 transition-colors">Q: {item.q}</span>
                  <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform group-hover:text-blue-600" />
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center animate-fade-in animation-delay-500">
            <p className="text-gray-600">
              More Questions?{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
              >
                Contact Us →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/70 backdrop-blur-xl py-12 animate-fade-in relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-md">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">© 2025 FNA APP. All rights reserved.</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
