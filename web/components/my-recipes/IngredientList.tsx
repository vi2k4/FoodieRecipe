import { CookingPot } from "@phosphor-icons/react";
import { RecipeIngredient } from "@/types/recipe";

interface Props { ingredients?: RecipeIngredient[]; }

export default function IngredientList({ ingredients = [] }: Props) {
  const heading = <h2 className="text-2xl font-bold flex items-center gap-2"><CookingPot size={26} weight="duotone" className="text-orange-500" aria-hidden="true" /> Ingredients</h2>;
  return (
    <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm border border-orange-100">
      {heading}
      {!ingredients.length ? <p className="mt-4 text-gray-500">No ingredients listed.</p> : (
        <div className="mt-6 space-y-3">{ingredients.map((item) => (
          <label key={String(item.id)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
            <span className="font-medium">{item.ingredientName}</span>
            {item.quantity && <span className="text-gray-500 text-sm ml-auto">{String(item.quantity)} {item.unit || ""}</span>}
          </label>
        ))}</div>
      )}
    </section>
  );
}
