import { Ingredient } from "@/types/ai";

interface Props {
  ingredient: Ingredient;
}

export default function IngredientBadge({ ingredient }: Props) {
  return (
    <div
      className="
      rounded-full
      bg-orange-100
      px-4
      py-2
      text-orange-700
      font-medium
      "
    >
      {ingredient.name} • {ingredient.confidence}%
    </div>
  );
}
