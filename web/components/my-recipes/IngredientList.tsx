import { CookingPot } from "@phosphor-icons/react";
import { RecipeIngredient } from "@/types/recipe";

interface Props { ingredients?: RecipeIngredient[]; }

export default function IngredientList({ ingredients = [] }: Props) {
  const heading = <h2 className="text-2xl font-bold flex items-center gap-2"><CookingPot size={26} weight="duotone" className="text-orange-500" aria-hidden="true" /> Nguyên liệu</h2>;
  return (
    <section className="mt-10 rounded-2xl border border-orange-100 bg-white p-8 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
      {heading}
      {!ingredients.length ? <p className="mt-4 text-gray-500">Chưa có nguyên liệu.</p> : (
        <div className="mt-6 space-y-3">{ingredients.map((item) => (
          <label key={String(item.id)} className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-orange-50 dark:hover:bg-stone-800">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-800" />
            <span className="font-medium">{item.ingredientName}</span>
            {item.quantity && <span className="ml-auto text-sm text-gray-500 dark:text-stone-400">{String(item.quantity)} {item.unit || ""}</span>}
          </label>
        ))}</div>
      )}
    </section>
  );
}
