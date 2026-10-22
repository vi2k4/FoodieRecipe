"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { socialApi } from "@/lib/social-api";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { LoginRequiredDialog } from "@/components/auth/LoginRequiredDialog";

interface FavoriteButtonProps {
  recipeId: number | string;
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({
  recipeId,
  className = "",
  showText = false,
}: FavoriteButtonProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const session = auth.getSession();
  const isLoggedIn = !!session?.accessToken;

  // Query user's favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["myFavorites"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      return socialApi.getMyFavorites();
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const isFavorited = favorites.some(
    (fav: any) => String(fav.id) === String(recipeId),
  );

  const toggleMutation = useMutation({
    mutationFn: async () => {
      await socialApi.toggleFavorite(recipeId, !isFavorited);
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ["myFavorites"] });
      if (!isFavorited) {
        toast.success("Đã lưu công thức vào danh sách yêu thích ❤️");
      } else {
        toast.info("Đã bỏ công thức khỏi danh sách yêu thích");
      }
    },
    onError: (err: any) => {
      setLoading(false);
      toast.error(err?.message || "Có lỗi xảy ra khi cập nhật yêu thích");
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setLoginPromptOpen(true);
      return;
    }

    if (loading) return;
    toggleMutation.mutate();
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick(e as any);
          }
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all duration-200 shrink-0 ${
          loading ? "opacity-50 pointer-events-none" : ""
        } ${
          isFavorited
            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            : "bg-neutral-100/90 hover:bg-red-50 text-neutral-600 hover:text-red-500 border border-neutral-200/60"
        } ${className}`}
        title={isFavorited ? "Bỏ lưu công thức" : "Lưu công thức"}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 ${
            isFavorited
              ? "fill-red-500 text-red-500 scale-110"
              : "text-neutral-500 group-hover:text-red-500"
          }`}
        />
        {showText && (
          <span>
            {loading
              ? "Đang cập nhật..."
              : isFavorited
                ? "Đã lưu"
                : "Lưu công thức"}
          </span>
        )}
      </span>
      <LoginRequiredDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        action="lưu công thức yêu thích"
      />
    </>
  );
}
