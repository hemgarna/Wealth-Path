"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read: boolean
  advisor_id: string
}

interface NotificationPopupProps {
  userId: string
}

export function NotificationPopup({ userId }: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchNotifications()

    // Subscribe to new notifications in real-time
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
          // Add new notification to the list
          setNotifications((prev) => [payload.new as Notification, ...prev])
          setUnreadCount((prev) => prev + 1)
          // Auto-show dialog for new notification
          setShowDialog(true)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function fetchNotifications() {
    setLoading(true)
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error && data) {
      setNotifications(data)
      const unread = data.filter((n) => !n.read).length
      setUnreadCount(unread)

      // Auto-show dialog if there are unread notifications
      if (unread > 0) {
        setShowDialog(true)
      }
    }
    setLoading(false)
  }

  async function markAsRead(notificationId: string) {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    if (!error) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)

    if (unreadIds.length === 0) return

    const { error } = await supabase.from("notifications").update({ read: true }).in("id", unreadIds)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <Button variant="outline" size="sm" className="relative gap-2 bg-transparent" onClick={() => setShowDialog(true)}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-8">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`relative ${!notification.read ? "border-blue-200 bg-blue-50/50" : "bg-white"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
