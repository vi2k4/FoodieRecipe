"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Sparkles, 
  CheckCheck,
  Trash2,
  ChevronRight,
  Clock
} from "lucide-react";

interface NotificationItem {
  id: number;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "AI_GENERATION";
  content: string;
  time: string;
  isRead: boolean;
  sender: {
    name: string;
    avatarUrl: string | null;
  } | null;
  recipeId?: number;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "LIKE",
    content: "member_lan đã thích công thức Bánh Flan Truyền Thống Caramels của bạn.",
    time: "5 phút trước",
    isRead: false,
    sender: {
      name: "member_lan",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    },
    recipeId: 1
  },
  {
    id: 2,
    type: "COMMENT",
    content: "member_lan đã bình luận: 'Bí quyết nước dùng ngon quá ạ!...' trên công thức Phở Bò Hà Nội Cổ Truyền.",
    time: "2 giờ trước",
    isRead: false,
    sender: {
      name: "member_lan",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    },
    recipeId: 2
  },
  {
    id: 3,
    type: "FOLLOW",
    content: "chef_nguyen đã bắt đầu theo dõi bạn.",
    time: "Hôm qua",
    isRead: true,
    sender: {
      name: "chef_nguyen",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80",
    }
  },
  {
    id: 4,
    type: "AI_GENERATION",
    content: "Công thức AI 'Gà Nướng Mật Ong Tỏi' đã được tạo thành công từ ảnh nguyên liệu của bạn.",
    time: "3 ngày trước",
    isRead: true,
    sender: null
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDeleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "LIKE":
        return (
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        );
      case "COMMENT":
        return (
          <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
        );
      case "FOLLOW":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
        );
      case "AI_GENERATION":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-neutral-500 items-center gap-2">
          <Link href="/" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium">Thông báo</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
              Thông báo của bạn
            </h1>
            <p className="text-neutral-500 text-sm">
              Cập nhật các hoạt động tương tác, yêu thích và công thức AI mới nhất.
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/80 px-4 py-2.5 rounded-full transition-all border border-orange-100"
            >
              <CheckCheck className="w-4 h-4" />
              Đọc tất cả
            </button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <div className="w-16 h-16 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Hộp thư thông báo trống</h3>
            <p className="text-neutral-500 max-w-xs mx-auto mb-6">
              Bạn không có thông báo mới nào tại thời điểm này.
            </p>
            <Link 
              href="/recipes"
              className="inline-flex items-center justify-center bg-orange-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Khám phá món ăn
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <Card
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`group rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden ${
                  item.isRead ? "border-neutral-100" : "border-orange-100 bg-orange-50/10"
                }`}
              >
                <CardContent className="p-0 flex items-start gap-4 w-full">
                  {/* Unread indicator */}
                  {!item.isRead && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600"></div>
                  )}

                  {/* Left Icon / Avatar */}
                  {item.sender?.avatarUrl ? (
                    <Avatar className="w-10 h-10 border border-neutral-100 flex-shrink-0">
                      <AvatarImage src={item.sender.avatarUrl} className="object-cover" />
                      <AvatarFallback>{item.sender.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    getNotificationIcon(item.type)
                  )}

                  {/* Main content info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-neutral-800 mb-2 leading-relaxed ${!item.isRead ? "font-semibold" : "font-normal"}`}>
                      {item.content}
                    </p>
                    
                    {/* Time metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-center">
                    {item.recipeId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="hidden sm:inline-flex text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors h-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/recipes/${item.recipeId}`}>
                          Xem món
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteNotification(item.id, e)}
                      className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-0 rounded-full transition-all h-9 w-9"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
