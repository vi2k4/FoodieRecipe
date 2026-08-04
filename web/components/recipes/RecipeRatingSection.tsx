"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socialApi } from "@/lib/social-api";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RecipeRatingSectionProps {
  recipeId: number | string;
  initialAverageRating?: number;
  onRatingSubmitted?: () => void;
}

export function RecipeRatingSection({
  recipeId,
  initialAverageRating = 5.0,
  onRatingSubmitted,
}: RecipeRatingSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const session = auth.getSession();
  const isLoggedIn = !!session?.accessToken;

  // Query live rating stats from DB
  const { data: ratingStats, refetch } = useQuery({
    queryKey: ["recipeRatingStats", String(recipeId)],
    queryFn: async () => {
      try {
        return await socialApi.getRatingStats(recipeId);
      } catch {
        return null;
      }
    },
  });

  const avgRating = ratingStats?.averageRating
    ? Number(ratingStats.averageRating)
    : Number(initialAverageRating) || 5.0;

  const totalRatings = ratingStats?.totalRatings ?? 0;

  useEffect(() => {
    if (ratingStats?.userRating) {
      setSelectedRating(Number(ratingStats.userRating));
    }
  }, [ratingStats]);

  const handleRate = async (starValue: number) => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đánh giá món ăn!");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await socialApi.submitRating(recipeId, starValue);
      setSelectedRating(starValue);
      toast.success(`Cảm ơn bạn đã đánh giá ${starValue} sao ⭐!`);

      // Refetch live stats & invalidate queries
      queryClient.invalidateQueries({ queryKey: ["recipeRatingStats", String(recipeId)] });
      refetch();

      if (onRatingSubmitted) onRatingSubmitted();
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi đánh giá, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 border border-amber-200/60 rounded-3xl p-6 sm:p-8 my-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Stats */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center shadow-md font-bold shrink-0">
            <span className="text-2xl leading-none">{avgRating ? avgRating.toFixed(1) : "5.0"}</span>
            <span className="text-[10px] opacity-90 tracking-wider uppercase">trên 5</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              Đánh giá món ăn
              {totalRatings > 0 && (
                <span className="text-xs font-normal text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {totalRatings} lượt đánh giá
                </span>
              )}
            </h3>
            <p className="text-neutral-500 text-xs mt-0.5">
              Hãy cho đầu bếp biết cảm nhận của bạn về công thức này
            </p>
          </div>
        </div>

        {/* Right Interactive Stars */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="flex items-center gap-1.5 bg-white px-4 py-2.5 rounded-full border border-amber-200/80 shadow-sm">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || selectedRating);
              return (
                <button
                  key={star}
                  type="button"
                  disabled={loading}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform duration-150 focus:outline-none disabled:opacity-50"
                  title={`Đánh giá ${star} sao`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      active ? "fill-amber-400 text-amber-400" : "text-neutral-300 fill-none"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {selectedRating > 0
              ? `Bạn đã chọn ${selectedRating} sao`
              : hoverRating > 0
              ? `Đánh giá ${hoverRating} sao`
              : "Bấm vào sao để bình chọn"}
          </span>
        </div>
      </div>
    </div>
  );
}
