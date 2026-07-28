import VisibilityBadge from "../my-recipes/VisibilityBadge";

import { Clock3, Flame, Users, ChefHat } from "lucide-react";

interface Props {
  recipe: {
    title?: string;
    description?: string;
    visibility?: "PUBLIC" | "PRIVATE";
    isPublic?: boolean;
    calories?: number;
    cookTime?: number;
    difficulty?: string;
    servings?: number;
  };
}

export default function RecipeInfo({ recipe }: Props) {
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
          : recipe.difficulty || "Easy";

  return (
    <section className="mt-8">
      <VisibilityBadge visibility={visibility} />

      <h1 className="mt-4 text-3xl md:text-4xl font-bold">
        {recipe.title || "Untitled Recipe"}
      </h1>

      {recipe.description && (
        <p className="mt-4 text-gray-500 leading-relaxed">
          {recipe.description}
        </p>
      )}

      <div className="mt-8 grid gap-5 grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-orange-100">
          <Flame className="text-orange-500" size={22} />
          <h3 className="mt-3 text-sm text-gray-500">Calories</h3>
          <p className="font-bold text-lg">{recipe.calories ?? "—"} kcal</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-orange-100">
          <Clock3 className="text-orange-500" size={22} />
          <h3 className="mt-3 text-sm text-gray-500">Cooking</h3>
          <p className="font-bold text-lg">{recipe.cookTime ?? "—"} mins</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-orange-100">
          <ChefHat className="text-orange-500" size={22} />
          <h3 className="mt-3 text-sm text-gray-500">Difficulty</h3>
          <p className="font-bold text-lg">{diffLabel}</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-orange-100">
          <Users className="text-orange-500" size={22} />
          <h3 className="mt-3 text-sm text-gray-500">Servings</h3>
          <p className="font-bold text-lg">{recipe.servings ?? 4} people</p>
        </div>
      </div>
    </section>
  );
}
