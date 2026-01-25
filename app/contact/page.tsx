"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, ArrowLeft, Mail, Send, Check } from "lucide-react"

export default function ContactPage() {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields are filled
    if (!email || !subject || !description) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, description }),
      })

      if (response.ok) {
        setSuccess(true)
        setEmail("")
        setSubject("")
        setDescription("")

        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to send message")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Wealth Path
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contact Form */}
      <main className="relative z-10 py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-2xl border-gray-200">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Message sent successfully!</p>
                  <p className="text-sm text-green-700">We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-gray-700 font-medium">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  required
                  className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={6}
                  className="mt-2 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all group"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-gray-500 mt-6">
            All fields marked with <span className="text-red-500">*</span> are required
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/70 backdrop-blur-xl py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-600">© 2025 Wealth Path. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
