/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { BowlFood } from "@phosphor-icons/react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { RecipeSection } from "@/components/home/RecipeSection";
import { RecipeGridSkeleton } from "@/components/ui/loading-skeletons";

export default function PublicHomePage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resRecipes = await api.recipes
          .list({ isPublic: true, page: 1, limit: 24 })
          .catch(() => []);
        setRecipes(
          Array.isArray(resRecipes) ? resRecipes : resRecipes?.data || [],
        );
      } catch (e) {
        console.error("Failed to load homepage data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const mostViewed = [...recipes]
    .sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0))
    .slice(0, 8);
  const mostLiked = [...recipes]
    .sort(
      (a, b) =>
        Number(b.likeCount || b._count?.likes || 0) -
        Number(a.likeCount || a._count?.likes || 0),
    )
    .slice(0, 8);
  const topRated = [...recipes]
    .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
    .slice(0, 8);
  const hotRecipes = [...recipes]
    .sort((a, b) => {
      const viewDifference =
        Number(b.viewCount || 0) - Number(a.viewCount || 0);
      if (viewDifference !== 0) return viewDifference;
      const likeDifference =
        Number(b.likeCount || b._count?.likes || 0) -
        Number(a.likeCount || a._count?.likes || 0);
      if (likeDifference !== 0) return likeDifference;
      return Number(b.averageRating || 0) - Number(a.averageRating || 0);
    })
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-12 pb-16">
      <HeroSlider />
      <RecipeSection
        title="Công thức hot"
        description="Những món ăn đang được cộng đồng quan tâm nhất"
        recipes={hotRecipes}
        hot
        sortBy="hot"
      />

      <section>
        {loading ? (
          <RecipeGridSkeleton />
        ) : recipes.length === 0 ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-12 text-center text-neutral-500">
            <BowlFood
              size={52}
              weight="duotone"
              className="mx-auto mb-2 text-orange-400"
              aria-label="No image"
            />
            <p>Chưa có công thức nào. Hãy đóng góp công thức đầu tiên!</p>
          </div>
        ) : (
          <RecipeSection
            title="Công thức mới nhất"
            description="Các công thức tươi ngon cập nhật từ cộng đồng"
            recipes={recipes.slice(0, 8)}
            sortBy="newest"
          />
        )}
      </section>

      <RecipeSection
        title="Xem nhiều nhất"
        description="Những công thức đang được cộng đồng quan tâm"
        recipes={mostViewed}
        sortBy="popular"
      />
      <RecipeSection
        title="Được yêu thích"
        description="Các món ăn nhận nhiều lượt thích"
        recipes={mostLiked}
        sortBy="liked"
      />
      <RecipeSection
        title="Đánh giá cao"
        description="Những công thức được đánh giá tốt"
        recipes={topRated}
        sortBy="rated"
      />
    </div>
  );
}
