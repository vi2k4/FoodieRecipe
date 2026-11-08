import Link from "next/link";
import { Eye, Flame, Clock, ArrowRight } from "lucide-react";
import { LikeButton } from "@/components/recipes/LikeButton";

type Recipe = any;

export function RecipeSection({
  title,
  description,
  recipes,
  hot = false,
  sortBy = "newest",
}: {
  title: string;
  description: string;
  recipes: Recipe[];
  hot?: boolean;
  sortBy?: "newest" | "oldest" | "popular" | "liked" | "rated" | "hot";
}) {
  if (!recipes.length) return null;

  return (
    <section className="container mx-auto px-4">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            {hot && <Flame className="h-6 w-6 animate-pulse text-orange-600" fill="currentColor" aria-label="Công thức hot" />}
            {title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>
        <Link href={`/recipes?sortBy=${sortBy}`} className="shrink-0 text-sm font-medium text-orange-500 hover:text-orange-600">
          Xem tất cả <ArrowRight className="ml-1 inline h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe) => (
          <Link href={`/recipes/${recipe.id}`} key={String(recipe.id)} className={`group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${hot ? "border-orange-200 hover:shadow-orange-500/20" : "border-neutral-100 hover:shadow-orange-500/5"}`}>
            <div className="relative h-32 overflow-hidden bg-neutral-100 sm:h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={recipe.thumbnail || "/file.svg"} alt={recipe.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-orange-600 backdrop-blur-sm">
                {recipe.difficulty === "EASY" ? "Dễ" : recipe.difficulty === "MEDIUM" ? "Trung bình" : "Khó"}
              </div>
              {hot && (
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-700 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-orange-900/20">
                  <Flame className="h-3.5 w-3.5 animate-bounce" fill="currentColor" aria-hidden="true" />
                  HOT
                </div>
              )}
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
