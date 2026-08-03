"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import RecipeHeader from "@/components/my-recipes/RecipeHeader";
import RecipeInfo from "@/components/my-recipes/RecipeInfo";
import IngredientList from "@/components/my-recipes/IngredientList";
import InstructionList from "@/components/my-recipes/InstructionList";
import NutritionCard from "@/components/my-recipes/NutritionCard";
import UpdateButton from "@/components/my-recipes/UpdateButton";
import { api } from "@/lib/api-client";
import { Recipe } from "@/types/recipe";

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchRecipe() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.recipes.get(id);
        setRecipe(data as Recipe);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load recipe.";
        console.error("Failed to fetch recipe:", err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-6 h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded-3xl">
            <div className="relative aspect-video animate-pulse bg-gray-200" />
          </div>
          <div className="mt-8 space-y-4">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-8 grid gap-5 grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
          <div className="mt-10 h-48 animate-pulse rounded-2xl bg-gray-200" />
          <div className="mt-10 h-64 animate-pulse rounded-2xl bg-gray-200" />
          <div className="mt-10 h-32 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="p-16 text-center bg-white rounded-3xl border border-orange-100 space-y-4">
            <div className="text-5xl">!</div>
            <h3 className="text-xl font-bold text-gray-800">
              Failed to load recipe
            </h3>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="p-16 text-center bg-white rounded-3xl border border-orange-100 space-y-4">
            <div className="text-5xl">?</div>
            <h3 className="text-xl font-bold text-gray-800">
              Recipe not found
            </h3>
          </div>
        </div>
      </main>
    );
  }

  const thumbnail = recipe.thumbnail || recipe.image;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <RecipeHeader image={thumbnail} title={recipe.title} />
        <RecipeInfo recipe={recipe} />
        <IngredientList ingredients={recipe.ingredients} />
        <InstructionList steps={recipe.steps} />
        <NutritionCard calories={recipe.calories} />
        <UpdateButton recipeId={recipe.id} />
      </div>
    </main>
  );
}
