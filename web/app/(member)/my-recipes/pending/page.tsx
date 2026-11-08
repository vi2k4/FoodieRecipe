"use client";

import { useEffect, useState } from "react";
import { Clock3, Inbox } from "lucide-react";
import { api } from "@/lib/api-client";
import { Recipe } from "@/types/recipe";
import RecipeCard from "@/components/my-recipes/RecipeCard";

export default function PendingRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"pending" | "rejected" | "approved">("pending");

  useEffect(() => {
    api.recipes.mine({ page: 1, limit: 50 })
      .then((response) => {
        const data = Array.isArray(response) ? response : response?.data || [];
        setRecipes(data as Recipe[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = recipes.filter((recipe) => !recipe.isPublic && (recipe as Recipe & { source?: string }).source !== "USER_REJECTED");
  const rejected = recipes.filter((recipe) => (recipe as Recipe & { source?: string }).source === "USER_REJECTED");
  const approved = recipes.filter((recipe) => recipe.isPublic);
  const section = (title: string, items: Recipe[], empty: string) => <section className="mb-10"><h2 className="mb-4 text-xl font-bold text-stone-900 dark:text-stone-100">{title} <span className="text-sm font-medium text-stone-500 dark:text-stone-400">({items.length})</span></h2>{items.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{items.map((recipe) => <RecipeCard key={String(recipe.id)} recipe={recipe} />)}</div> : <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-stone-500 dark:border-orange-900 dark:bg-[#29211d] dark:text-stone-300">{empty}</div>}</section>;

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8 dark:bg-[#171311]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-950/60"><Clock3 className="size-6" /></div>
          <div><h1 className="text-3xl font-black text-stone-900 dark:text-stone-100">Công thức chờ duyệt</h1><p className="mt-1 text-sm text-stone-500 dark:text-stone-300">Theo dõi trạng thái và chỉnh sửa công thức trước khi gửi lại.</p></div>
        </div>
        {loading ? <div className="py-20 text-center text-stone-500 dark:text-stone-300">Đang tải công thức...</div> : <><ul className="mb-8 flex gap-2 overflow-x-auto border-b border-orange-100 dark:border-orange-900" role="tablist">{([{ key: "pending", label: "Chờ duyệt", count: pending.length }, { key: "rejected", label: "Từ chối", count: rejected.length }, { key: "approved", label: "Đã được duyệt", count: approved.length }] as const).map((tab) => <li key={tab.key}><button type="button" role="tab" aria-selected={activeSection === tab.key} onClick={() => setActiveSection(tab.key)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeSection === tab.key ? "border-orange-500 text-orange-600" : "border-transparent text-stone-500 hover:text-orange-600"}`}>{tab.label} <span className="ml-1 text-xs">({tab.count})</span></button></li>)}</ul>{activeSection === "pending" && section("Chờ duyệt", pending, "Không có công thức đang chờ duyệt.")}{activeSection === "rejected" && section("Từ chối", rejected, "Chưa có công thức bị từ chối.")}{activeSection === "approved" && section("Đã được duyệt", approved, "Chưa có công thức được duyệt.")}</>}
      </div>
    </main>
  );
}
