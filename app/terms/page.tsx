"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Terms of Service</h1>
            <p className="text-slate-400">
              Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 rounded-2xl bg-white/5 p-8 text-slate-300 backdrop-blur-sm md:p-12">
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using FNA App's financial planning platform and services ("Services"), you agree to
                be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our
                Services.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">2. Description of Services</h2>
              <p className="mb-4 leading-relaxed">
                FNA App provides a comprehensive financial planning platform that connects clients with certified
                financial advisors. Our Services include:
              </p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>Financial assessment and goal-setting tools</li>
                <li>Personalized financial analysis and recommendations</li>
                <li>Connection with licensed financial advisors</li>
                <li>Financial planning reports and projections</li>
                <li>Educational resources and calculators</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">3. User Accounts</h2>
              <h3 className="mb-3 text-xl font-medium text-white">3.1 Account Creation</h3>
              <p className="mb-4 leading-relaxed">
                Access to FNA App is by invitation only. Accounts are created by authorized financial advisors or
                administrators. You are responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h3 className="mb-3 text-xl font-medium text-white">3.2 Account Security</h3>
              <p className="mb-4 leading-relaxed">
                You agree to notify us immediately of any unauthorized use of your account. We are not liable for any
                loss or damage arising from your failure to protect your account credentials.
              </p>

              <h3 className="mb-3 text-xl font-medium text-white">3.3 Account Termination</h3>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in
                fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">4. User Responsibilities</h2>
              <p className="mb-4 leading-relaxed">You agree to:</p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>Provide accurate, complete, and truthful information</li>
                <li>Update your information promptly when it changes</li>
                <li>Use the Services only for lawful purposes</li>
                <li>Not share your account with others</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Not interfere with or disrupt the Services</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">5. Financial Advice Disclaimer</h2>
              <p className="mb-4 leading-relaxed">
                FNA App provides a platform connecting you with financial advisors. The financial advice,
                recommendations, and analysis provided through our platform are for informational purposes only and do
                not constitute:
              </p>
              <ul className="mb-4 list-inside list-disc space-y-2 pl-4">
                <li>Investment advice or recommendations to buy or sell securities</li>
                <li>Legal, tax, or accounting advice</li>
                <li>Guarantees of financial outcomes or returns</li>
              </ul>
              <p className="leading-relaxed">
                You should consult with qualified professionals before making financial decisions. Past performance does
                not guarantee future results.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">6. Intellectual Property</h2>
              <p className="mb-4 leading-relaxed">
                All content, features, and functionality of the Services, including but not limited to text, graphics,
                logos, software, and analysis tools, are owned by FNA App and are protected by copyright, trademark,
                and other intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You may not copy, modify, distribute, sell, or exploit any content without our express written
                permission.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">7. Privacy and Data Protection</h2>
              <p className="leading-relaxed">
                Your use of the Services is also governed by our Privacy Policy. We collect, use, and protect your
                information as described in the Privacy Policy. By using our Services, you consent to our data
                practices.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">8. Payment Terms</h2>
              <p className="mb-4 leading-relaxed">
                Fees for our Services are determined by your financial advisor and communicated to you separately. You
                agree to pay all applicable fees in accordance with the payment terms provided by your advisor.
              </p>
              <p className="leading-relaxed">
                All fees are non-refundable unless otherwise stated in your agreement with your financial advisor.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">9. Limitation of Liability</h2>
              <p className="mb-4 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEALTHPATH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="leading-relaxed">
                Our total liability to you for all claims arising from your use of the Services shall not exceed the
                amount you paid to us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">10. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless FNA App and its officers, directors, employees, and
                agents from any claims, liabilities, damages, losses, and expenses arising from your use of the Services
                or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">11. Modifications to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by
                posting the updated Terms on our platform and updating the "Last Updated" date. Your continued use of
                the Services after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">12. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of [Your
                Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">13. Contact Information</h2>
              <p className="leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 rounded-lg bg-white/5 p-4">
                <p className="text-white">Email: nithyavananda8@gmail.com</p>
                <p className="text-white">Address: Frisco, Texas</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} FNA App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
