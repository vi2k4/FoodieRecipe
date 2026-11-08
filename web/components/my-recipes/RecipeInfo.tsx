import VisibilityBadge from "../my-recipes/VisibilityBadge";

import { Clock, Fire, ChefHat, UsersThree } from "@phosphor-icons/react";

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
      ? "Dễ"
      : recipe.difficulty === "MEDIUM"
        ? "Trung bình"
        : recipe.difficulty === "HARD"
          ? "Khó"
          : recipe.difficulty || "Dễ";

  return (
    <section className="mt-8">
      <VisibilityBadge visibility={visibility} />

      <h1 className="mt-4 text-3xl md:text-4xl font-bold">
        {recipe.title || "Công thức chưa đặt tên"}
      </h1>

      {recipe.description && (
        <p className="mt-4 leading-relaxed text-gray-500 dark:text-stone-300">
          {recipe.description}
        </p>
      )}

      <div className="mt-8 grid gap-5 grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
          <Fire className="text-orange-500" size={22} weight="duotone" />
          <h3 className="mt-3 text-sm text-gray-500 dark:text-stone-400">Calo</h3>
          <p className="font-bold text-lg">{recipe.calories ?? "—"} kcal</p>
        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
          <Clock className="text-orange-500" size={22} weight="duotone" />
          <h3 className="mt-3 text-sm text-gray-500 dark:text-stone-400">Thời gian nấu</h3>
          <p className="text-lg font-bold">{recipe.cookTime ?? "—"} phút</p>
        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
          <ChefHat className="text-orange-500" size={22} weight="duotone" />
          <h3 className="mt-3 text-sm text-gray-500 dark:text-stone-400">Độ khó</h3>
          <p className="font-bold text-lg">{diffLabel}</p>
        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
          <UsersThree className="text-orange-500" size={22} weight="duotone" />
          <h3 className="mt-3 text-sm text-gray-500 dark:text-stone-400">Khẩu phần</h3>
          <p className="font-bold text-lg">{recipe.servings ?? 4} người</p>
        </div>
      </div>
    </section>
  );
}
