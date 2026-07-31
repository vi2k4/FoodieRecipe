"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/admin-api";
import { format } from "date-fns";

type Props = {
  title: string;
  subtitle?: string;
};

const typeColors: Record<string, string> = {
  REPORT: "bg-red-100 text-red-700",
  LIKE: "bg-orange-100 text-orange-700",
  COMMENT: "bg-blue-100 text-blue-700",
  FOLLOW: "bg-green-100 text-green-700",
  SYSTEM: "bg-gray-100 text-gray-700",
  AI_GENERATION: "bg-purple-100 text-purple-700",
};

const typeLabels: Record<string, string> = {
  REPORT: "Báo cáo",
  LIKE: "Thích",
  COMMENT: "Bình luận",
  FOLLOW: "Theo dõi",
  SYSTEM: "Hệ thống",
  AI_GENERATION: "AI",
};

export function AdminHeader({ title, subtitle }: Props) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    getNotifications()
      .then((data) => setNotifications(data))
      .catch(() => {});
  }, [setNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markRead(id);
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      markAllRead();
    } catch {}
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div>
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          id="notif-bell-btn"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-orange-50"
          style={{ border: "1px solid var(--border)" }}
        >
          <Bell className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl shadow-2xl"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  Thông báo
                  {unreadCount > 0 && (
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "var(--primary)" }}
                  >
                    <CheckCheck className="h-3 w-3" />
                    Đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto mb-2 h-8 w-8" style={{ color: "var(--border)" }} />
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Chưa có thông báo nào
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className="flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-orange-50"
                      style={{
                        backgroundColor: n.isRead ? "transparent" : "#fff7ed",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${
                          typeColors[n.type] || typeColors.SYSTEM
                        }`}
                      >
                        {typeLabels[n.type] || n.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-medium leading-snug"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {n.title}
                        </p>
                        <p
                          className="mt-0.5 text-xs leading-snug line-clamp-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {n.content}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--border)" }}>
                          {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div
                          className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: "var(--primary)" }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
