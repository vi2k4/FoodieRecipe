"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Clock3,
  Flame,
  CalendarDays,
  ArrowRight,
  ChefHat,
  Users,
  UserRound,
} from "lucide-react";
import { BowlFood } from "@phosphor-icons/react";

import { Recipe } from "@/types/recipe";
import VisibilityBadge from "./VisibilityBadge";

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const imageUrl = recipe.thumbnail || recipe.image;
  const cookTime = recipe.cookTime || recipe.cookingTime;

  const visibility: "PUBLIC" | "PRIVATE" =
    recipe.visibility === "PRIVATE"
      ? "PRIVATE"
      : recipe.isPublic === false
        ? "PRIVATE"
        : "PUBLIC";

  const diffLabel =
    recipe.difficulty === "EASY"
      ? "Easy"
      : recipe.difficulty === "MEDIUM"
        ? "Medium"
        : recipe.difficulty === "HARD"
          ? "Hard"
          : "";

  return (
    <article
      className="
      group
      overflow-hidden
      rounded-2xl
      border border-orange-100
      bg-white
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl hover:shadow-orange-500/10
      "
    >
      {/* Image */}

      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            unoptimized
            className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BowlFood size={56} weight="duotone" className="text-orange-400" aria-hidden="true" />
          </div>
        )}

        {/* My Recipe Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
          <UserRound className="size-3.5" aria-hidden="true" /> My Recipe
        </div>

        {/* Visibility */}
        <div className="absolute top-3 right-3">
          <VisibilityBadge visibility={visibility} />
        </div>
      </div>

      {/* Body */}

      <div className="p-5">
        <h2
          className="
          line-clamp-2
          text-xl
          font-bold
          text-gray-800
          group-hover:text-orange-600
          transition-colors
          "
        >
          {recipe.title}
        </h2>

        {recipe.description && (
          <p
            className="
            mt-2
            line-clamp-2
            text-sm
            text-gray-500
            "
          >
            {recipe.description}
          </p>
        )}

        {/* Information */}

        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock3 size={17} className="text-orange-400" />
            <span>{cookTime ?? "—"} mins</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Flame size={17} className="text-orange-400" />
            <span>{recipe.calories ?? "—"} kcal</span>
          </div>

          {diffLabel && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ChefHat size={17} className="text-orange-400" />
              <span>{diffLabel}</span>
            </div>
          )}

          {recipe.servings && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={17} className="text-orange-400" />
              <span>{recipe.servings} people</span>
            </div>
          )}

          {recipe.createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={17} className="text-orange-400" />
              <span>{recipe.createdAt}</span>
            </div>
          )}
        </div>

        {/* Button */}

        <Link
          href={`/my-recipes/${recipe.id}`}
          className="
          mt-6
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-orange-500
          py-3
          font-medium
          text-white
          transition
          hover:bg-orange-600
          hover:shadow-md hover:shadow-orange-500/25
          "
        >
          View Detail
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}
