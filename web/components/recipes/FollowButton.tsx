"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { socialApi } from "@/lib/social-api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: number | string;
  targetUsername?: string;
  className?: string;
  showText?: boolean;
}

export function FollowButton({
  targetUserId,
  targetUsername = "tác giả",
  className = "",
  showText = true,
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  const isLoggedIn = user.role !== "GUEST" && Boolean(user.id);
  const isSelf = isLoggedIn && String(user.id) === String(targetUserId);

  const [overrideFollowing, setOverrideFollowing] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Query user's following list
  const { data: myFollowing } = useQuery({
    queryKey: ["myFollowing"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      try {
        const res = await socialApi.getMyFollowing();
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });

  const isFollowingFromQuery = isLoggedIn && Array.isArray(myFollowing)
    ? myFollowing.some((u: any) => String(u.id) === String(targetUserId))
    : false;

  useEffect(() => {
    setOverrideFollowing(null);
  }, [myFollowing, targetUserId]);

  const isFollowing = overrideFollowing !== null ? overrideFollowing : isFollowingFromQuery;

  const toggleMutation = useMutation({
    mutationFn: async (currentlyFollowing: boolean) => {
      await socialApi.toggleFollow(targetUserId, currentlyFollowing);
      return currentlyFollowing;
    },
    onSuccess: (currentlyFollowing) => {
      setOverrideFollowing(null);
      queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
      if (!currentlyFollowing) {
        toast.success(`Đã theo dõi ${targetUsername}! 🎉`);
      } else {
        toast.info(`Đã hủy theo dõi ${targetUsername}`);
      }
    },
    onError: (err: any, currentlyFollowing) => {
      setOverrideFollowing(currentlyFollowing);
      toast.error(err?.message || "Có lỗi xảy ra khi cập nhật theo dõi");
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để theo dõi đầu bếp!");
      router.push("/login");
      return;
    }

    if (isSelf) {
      toast.info("Bạn không thể tự theo dõi chính mình");
      return;
    }

    if (toggleMutation.isPending) return;

    const nextState = !isFollowing;
    setOverrideFollowing(nextState);
    toggleMutation.mutate(isFollowing);
  };

  if (isSelf) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={toggleMutation.isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-200 shrink-0 ${
        toggleMutation.isPending ? "opacity-60 pointer-events-none" : ""
      } ${
        isFollowing
          ? isHovered
            ? "bg-red-50 text-red-600 border border-red-200/80 shadow-sm"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm"
          : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 active:scale-95"
      } ${className}`}
      title={isFollowing ? `Hủy theo dõi ${targetUsername}` : `Theo dõi ${targetUsername}`}
    >
      {isFollowing ? (
        isHovered ? (
          <>
            <UserMinus className="w-3.5 h-3.5" />
            {showText && <span>Hủy theo dõi</span>}
          </>
        ) : (
          <>
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            {showText && <span>Đang theo dõi</span>}
          </>
        )
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5 text-white" />
          {showText && <span>Theo dõi</span>}
        </>
      )}
    </button>
  );
}
