import { Recipe } from "@/types/recipe";
import RecipeCard from "./RecipeCard";

interface Props {
  recipes: Recipe[];
}

export default function RecipeGrid({ recipes }: Props) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center">
        <h2 className="text-xl font-semibold">No recipes found</h2>

        <p className="mt-2 text-gray-500">Try changing your search filters.</p>
      </div>
    );
  }

  return (
    <div
      className="
      grid
      grid-cols-1
      gap-6
      md:grid-cols-2
      xl:grid-cols-3
      "
    >
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
