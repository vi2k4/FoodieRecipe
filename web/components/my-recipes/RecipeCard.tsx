"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Clock3,
  Flame,
  CalendarDays,
  Users,
  Eye,
} from "lucide-react";
import { BowlFood } from "@phosphor-icons/react";

import { Recipe } from "@/types/recipe";
import { LikeButton } from "@/components/recipes/LikeButton";
import { DifficultyDot } from "@/components/recipes/DifficultyDot";
import VisibilityBadge from "./VisibilityBadge";

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const router = useRouter();
  const imageUrl = recipe.thumbnail || recipe.image;
  const cookTime = recipe.cookTime || recipe.cookingTime;
  const createdDate = recipe.createdAt
    ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(recipe.createdAt))
    : "Chưa rõ ngày tạo";

  const visibility: "PUBLIC" | "PRIVATE" =
    recipe.visibility === "PRIVATE"
      ? "PRIVATE"
      : recipe.isPublic === false
        ? "PRIVATE"
        : "PUBLIC";

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        router.push(`/my-recipes/${recipe.id}`);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/my-recipes/${recipe.id}`);
        }
      }}
      className="group flex h-[350px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 sm:h-[370px] dark:border-orange-900 dark:bg-[#29211d] dark:hover:border-orange-700"
    >
      {/* Image */}

      <div className="relative h-36 shrink-0 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 sm:h-40 dark:from-orange-950/60 dark:to-stone-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BowlFood size={56} weight="duotone" className="text-orange-400" aria-hidden="true" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <VisibilityBadge visibility={visibility} />
          <DifficultyDot difficulty={recipe.difficulty} />
        </div>
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[11px] font-medium text-white drop-shadow">
          <CalendarDays className="size-3" aria-hidden="true" />
          {createdDate}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <h2 className="line-clamp-2 h-10 text-base font-bold leading-5 text-gray-800 transition-colors group-hover:text-orange-600 dark:text-stone-100">
          {recipe.title}
        </h2>

        <div className="mt-3 flex min-h-8 flex-wrap content-start gap-1.5 text-[11px] font-medium text-gray-600 dark:text-stone-300">
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 dark:bg-orange-950/50">
            <Clock3 className="size-3 text-orange-500" />
            {cookTime ?? "—"} phút
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 dark:bg-orange-950/50">
            <Flame className="size-3 text-orange-500" />
            {recipe.calories ?? "—"} kcal
          </span>
        </div>

        <div className="mt-auto flex h-8 items-center justify-between border-t border-orange-100 pt-2 text-[11px] dark:border-orange-900">
          <div className="flex items-center gap-2 text-gray-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {Number(recipe.viewCount || 0)}
            </span>
            {recipe.servings && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" />
                {recipe.servings}
              </span>
            )}
          </div>
          <LikeButton
            recipeId={recipe.id}
            initialCount={Number(recipe.likeCount ?? recipe._count?.likes ?? 0)}
            showText
          />
        </div>

      </div>
    </article>
  );
}
