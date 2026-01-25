"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
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
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Privacy Policy</h1>
            <p className="text-slate-400">
              Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 rounded-2xl bg-white/5 p-8 text-slate-300 backdrop-blur-sm md:p-12">
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">1. Introduction</h2>
              <p className="leading-relaxed">
                FNA App ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our financial planning
                platform and services.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">2. Information We Collect</h2>
              <h3 className="mb-3 text-xl font-medium text-white">2.1 Personal Information</h3>
              <p className="mb-4 leading-relaxed">We collect information that you provide directly to us, including:</p>
              <ul className="mb-4 list-inside list-disc space-y-2 pl-4">
                <li>Name, email address, and contact information</li>
                <li>Financial information (income, assets, liabilities, investment accounts)</li>
                <li>Demographic information (age, marital status, number of dependents)</li>
                <li>Financial goals and retirement planning details</li>
                <li>Insurance and healthcare information</li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-white">2.2 Automatically Collected Information</h3>
              <p className="leading-relaxed">
                When you access our platform, we automatically collect certain information, including IP address,
                browser type, device information, and usage data through cookies and similar technologies.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">3. How We Use Your Information</h2>
              <p className="mb-4 leading-relaxed">We use the information we collect to:</p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>Provide, maintain, and improve our financial planning services</li>
                <li>Create and analyze personalized financial reports and recommendations</li>
                <li>Communicate with you about your account and services</li>
                <li>Connect you with your assigned financial advisor</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations and regulatory requirements</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">4. Information Sharing and Disclosure</h2>
              <h3 className="mb-3 text-xl font-medium text-white">4.1 With Your Financial Advisor</h3>
              <p className="mb-4 leading-relaxed">
                Your financial information is shared with your assigned financial advisor to enable them to provide
                personalized financial planning services.
              </p>

              <h3 className="mb-3 text-xl font-medium text-white">4.2 Service Providers</h3>
              <p className="mb-4 leading-relaxed">
                We may share your information with third-party service providers who perform services on our behalf,
                such as data hosting, email delivery, and analytics. These providers are contractually obligated to
                protect your information.
              </p>

              <h3 className="mb-3 text-xl font-medium text-white">4.3 Legal Requirements</h3>
              <p className="leading-relaxed">
                We may disclose your information if required by law, legal process, or to protect the rights, property,
                or safety of FNA App, our users, or others.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption,
                secure data storage, access controls, and regular security audits. However, no method of transmission
                over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">6. Your Rights and Choices</h2>
              <p className="mb-4 leading-relaxed">You have the right to:</p>
              <ul className="list-inside list-disc space-y-2 pl-4">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information (subject to legal obligations)</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">7. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as necessary to provide our services, comply with legal
                obligations, resolve disputes, and enforce our agreements. Financial records may be retained for
                extended periods as required by financial regulations.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">8. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal
                information from children.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">9. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">10. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us
                at:
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
