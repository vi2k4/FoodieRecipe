"use client";

import Link from "next/link";
import type { SavedRecipe } from "@/types/ai";

interface Props {
  recipe: SavedRecipe;
}

export default function ResultCard({ recipe }: Props) {
  return (
    <div
      className="
        mt-6
        rounded-3xl
        bg-green-50
        p-5
      "
    >
      <h2 className="text-green-700 font-bold text-lg">🎉 Đã tạo công thức:</h2>

      <p className="mt-2 font-semibold">{recipe.title}</p>

      {recipe.description && (
        <p className="text-gray-600 mt-2 text-sm line-clamp-3">
          {recipe.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
        {recipe.nutrition?.calories != null && (
          <span>{recipe.nutrition.calories} kcal</span>
        )}
        {recipe.cookTime > 0 && <span>{recipe.cookTime} phút</span>}
        {recipe.servings > 0 && <span>{recipe.servings} khẩu phần</span>}
        {recipe.difficulty && <span>Độ khó: {recipe.difficulty}</span>}
      </div>

      <Link
        href={`/recipes/${recipe.id}`}
        className="
          mt-5
          inline-flex
          rounded-full
          bg-green-600
          px-6
          py-3
          text-white
          hover:bg-green-700
          transition
        "
      >
        Xem công thức đầy đủ
      </Link>
    </div>
  );
}
