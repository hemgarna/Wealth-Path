"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, FileText, Bell, Check, Trash2 } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  advisor_id: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadNotifications() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (!user || error) {
          router.push("/auth/login")
          return
        }

        setUserId(user.id)

        const { data, error: notifError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!notifError && data) {
          setNotifications(data)
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [router, supabase])

  async function markAsRead(notificationId: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  async function markAllAsRead() {
    if (!userId) return

    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function deleteNotification(notificationId: string) {
    await supabase.from("notifications").delete().eq("id", notificationId)

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-600" />
      case "report":
        return <FileText className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-sm text-slate-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="gap-2 bg-transparent">
              <Check className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">When your advisor sends you updates, they'll appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-0 shadow-md hover:shadow-lg transition-all ${notification.read ? "bg-white" : "bg-blue-50"}`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.read ? "bg-gray-100" : "bg-blue-100"}`}
                      >
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Badge variant="default" className="bg-blue-600">
                              New
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
