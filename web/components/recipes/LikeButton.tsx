"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import { socialApi } from "@/lib/social-api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  recipeId: number | string;
  initialCount?: number;
  initialLiked?: boolean;
  className?: string;
  showText?: boolean;
}

export function LikeButton({
  recipeId,
  initialCount = 0,
  initialLiked = false,
  className = "",
  showText = false,
}: LikeButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  const isLoggedIn = user.role !== "GUEST" && Boolean(user.id);

  // Local count for optimistic UI updates
  const [count, setCount] = useState<number>(Number(initialCount || 0));
  const [overrideLiked, setOverrideLiked] = useState<boolean | null>(null);

  // Sync initial props when changed
  useEffect(() => {
    setCount(Number(initialCount || 0));
  }, [initialCount]);

  // Query user's liked recipe IDs from server
  const { data: myLikes } = useQuery({
    queryKey: ["myLikes"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      try {
        const res = await socialApi.getMyLikes();
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });

  // Calculate actual liked state from server query or initial prop
  const isLikedFromQuery = isLoggedIn && Array.isArray(myLikes)
    ? myLikes.some((id: string | number) => String(id) === String(recipeId))
    : initialLiked;

  // Reset override whenever myLikes or recipeId changes
  useEffect(() => {
    setOverrideLiked(null);
  }, [myLikes, recipeId]);

  const liked = overrideLiked !== null ? overrideLiked : isLikedFromQuery;

  const toggleMutation = useMutation({
    mutationFn: async (targetLikedState: boolean) => {
      await socialApi.toggleLike(recipeId, targetLikedState);
      return targetLikedState;
    },
    onSuccess: (targetLikedState) => {
      setOverrideLiked(null);
      queryClient.invalidateQueries({ queryKey: ["myLikes"] });
      if (targetLikedState) {
        toast.success("Đã thích công thức! 👍");
      } else {
        toast.info("Đã bỏ thích công thức");
      }
    },
    onError: (err: any, targetLikedState) => {
      // Revert optimistic state
      setOverrideLiked(!targetLikedState);
      setCount((prev) => (targetLikedState ? Math.max(0, prev - 1) : prev + 1));
      toast.error(err?.message || "Có lỗi xảy ra khi cập nhật lượt thích");
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thích công thức!");
      router.push("/login");
      return;
    }

    if (toggleMutation.isPending) return;

    const nextState = !liked;
    // Optimistic UI update
    setOverrideLiked(nextState);
    setCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    toggleMutation.mutate(nextState);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as any);
        }
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer select-none transition-all duration-200 shrink-0 ${
        toggleMutation.isPending ? "opacity-60 pointer-events-none" : ""
      } ${
        liked
          ? "bg-blue-600 text-white border border-blue-600 shadow-md shadow-blue-500/20 hover:bg-blue-700"
          : "bg-neutral-100/90 text-neutral-600 hover:bg-blue-50 hover:text-blue-600 border border-neutral-200/60"
      } ${className}`}
      title={liked ? "Bỏ thích công thức" : "Thích công thức"}
    >
      <ThumbsUp
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          liked ? "fill-white text-white scale-110" : "text-neutral-500 group-hover:text-blue-600"
        }`}
      />
      <span>{count}</span>
      {showText && <span>{liked ? "Đã thích" : "Thích"}</span>}
    </span>
  );
}
