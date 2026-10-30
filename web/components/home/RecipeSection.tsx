import Link from "next/link";
import { Eye, Flame, Clock, ArrowRight } from "lucide-react";
import { LikeButton } from "@/components/recipes/LikeButton";

type Recipe = any;

export function RecipeSection({
  title,
  description,
  recipes,
}: {
  title: string;
  description: string;
  recipes: Recipe[];
}) {
  if (!recipes.length) return null;

  return (
    <section className="container mx-auto px-4">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
        <Link href="/recipes" className="shrink-0 text-sm font-medium text-orange-500 hover:text-orange-600">
          Xem tất cả <ArrowRight className="ml-1 inline h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link href={`/recipes/${recipe.id}`} key={String(recipe.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5">
            <div className="relative h-32 overflow-hidden bg-neutral-100 sm:h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={recipe.thumbnail || "/file.svg"} alt={recipe.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-orange-600 backdrop-blur-sm">
                {recipe.difficulty === "EASY" ? "Dễ" : recipe.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-5">
              <h3 className="mb-2 line-clamp-2 text-sm font-bold text-neutral-900 transition-colors group-hover:text-orange-500 sm:text-lg">{recipe.title}</h3>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 sm:gap-3 sm:text-xs">
                <span><Flame className="mr-1 inline h-3.5 w-3.5 text-orange-500" />{recipe.calories || "—"} kcal</span>
                <span><Clock className="mr-1 inline h-3.5 w-3.5 text-neutral-400" />{recipe.cookTime || "—"} phút</span>
                <span><Eye className="mr-1 inline h-3.5 w-3.5 text-neutral-400" />{Number(recipe.viewCount || 0)}</span>
                <LikeButton recipeId={recipe.id} initialCount={Number(recipe.likeCount ?? recipe._count?.likes ?? 0)} />
              </div>
              <div className="mt-auto flex items-center gap-2 border-t border-neutral-100 pt-3 sm:pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={recipe.author?.avatarUrl || "/file.svg"} alt={recipe.author?.username || "Ẩn danh"} className="h-6 w-6 rounded-full border border-neutral-200 object-cover" />
                <span className="truncate text-xs font-medium text-neutral-700 sm:text-sm">{recipe.author?.username || "Ẩn danh"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
