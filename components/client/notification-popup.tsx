"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MessageCircle } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export function NotificationPopup({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Fetch unread notifications
    fetchUnreadNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[v0] New notification received:", payload)
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev])
          setShowPopup(true)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function fetchUnreadNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!error && data && data.length > 0) {
      setNotifications(data)
      setShowPopup(true)
    }
  }

  async function markAsRead(notificationId: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  function closePopup() {
    setShowPopup(false)
  }

  if (!showPopup || notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2 border-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              New Message from Your Advisor
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={closePopup} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-3 bg-blue-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notification.message}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)} className="h-7 text-xs">
                  Mark as Read
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
