"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2, Heart, MessageSquare, UserPlus, Sparkles, ChefHat } from "lucide-react";
import { socialApi } from "@/lib/social-api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "REPORT" | "AI_GENERATION" | "SYSTEM";
  isRead: boolean;
  referenceId?: string | null;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isLoggedIn = user.role !== "GUEST" && Boolean(user.id);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      try {
        const res = await socialApi.getNotifications();
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    enabled: isLoggedIn,
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await socialApi.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    },
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await socialApi.markNotificationRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await socialApi.deleteNotification(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info("Đã xóa thông báo");
    },
  });

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markReadMutation.mutate(n.id);
    }
    setIsOpen(false);

    if (n.referenceId) {
      router.push(`/recipes/${n.referenceId}`);
    }
  };

  if (!isLoggedIn) return null;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-4 h-4 text-blue-500 fill-blue-500/20" />;
      case "COMMENT":
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case "FOLLOW":
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case "AI_GENERATION":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <ChefHat className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Vừa xong";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    return `${Math.floor(diffSec / 86400)} ngày trước`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-neutral-600 hover:text-orange-600 hover:bg-orange-50 transition-colors focus:outline-none"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-neutral-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/80 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-800 text-sm">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold text-orange-600 bg-orange-100/80 rounded-full">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                title="Đánh dấu tất cả là đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                    n.isRead ? "bg-white hover:bg-neutral-50/80" : "bg-orange-50/40 hover:bg-orange-50/80"
                  }`}
                >
                  {/* Icon */}
                  <div className="p-2 rounded-xl bg-white shadow-sm border border-neutral-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-xs ${!n.isRead ? "font-bold text-neutral-900" : "font-semibold text-neutral-700"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.content}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(n.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-red-500 rounded-md transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unread Indicator Dot */}
                  {!n.isRead && (
                    <span className="absolute top-4 right-3 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
