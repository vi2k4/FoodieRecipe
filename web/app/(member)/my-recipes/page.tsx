"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import SearchFilter from "@/components/my-recipes/SearchFilter";
import RecipeGrid from "@/components/my-recipes/RecipeGrid";
import Pagination from "@/components/my-recipes/Pagination";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Recipe, RecipeCategory } from "@/types/recipe";

interface FilterValues {
  keyword: string;
  categoryId: string;
  visibility: string;
  minCalories: string;
  maxCalories: string;
  minCookTime: string;
  maxCookTime: string;
  sortBy: string;
}

const defaultFilters: FilterValues = {
  keyword: "",
  categoryId: "",
  visibility: "",
  minCalories: "",
  maxCalories: "",
  minCookTime: "",
  maxCookTime: "",
  sortBy: "newest",
};

export default function MyRecipesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  const PAGE_SIZE = 6;

  const fetchRecipes = useCallback(
    async (targetPage: number, activeFilters?: FilterValues) => {
      setLoading(true);
      setError(null);
      try {
        const f = activeFilters || filters;
        const reqParams: Record<string, string | number | boolean> = {
          page: targetPage,
          limit: PAGE_SIZE,
        };

        if (f.keyword.trim()) reqParams.search = f.keyword.trim();
        if (f.categoryId) reqParams.categoryId = Number(f.categoryId);
        if (f.visibility === "PUBLIC") reqParams.isPublic = true;
        if (f.visibility === "PRIVATE") reqParams.isPublic = false;

        const res = await api.recipes.mine(reqParams);

        let rawList: Recipe[] = [];
        let totalCount = 0;

        if (Array.isArray(res)) {
          rawList = res as unknown as Recipe[];
          totalCount = rawList.length;
        } else if (res && typeof res === "object") {
          const resObj = res as Record<string, unknown>;
          if (Array.isArray(resObj.data)) {
            rawList = resObj.data as unknown as Recipe[];
            totalCount =
              typeof resObj.total === "number" ? resObj.total : rawList.length;
          }
        }

        let list = [...rawList];

        if (f.minCalories) {
          list = list.filter(
            (r: Recipe) =>
              r.calories === null ||
              r.calories === undefined ||
              Number(r.calories) >= Number(f.minCalories),
          );
        }
        if (f.maxCalories) {
          list = list.filter(
            (r: Recipe) =>
              r.calories === null ||
              r.calories === undefined ||
              Number(r.calories) <= Number(f.maxCalories),
          );
        }
        if (f.minCookTime) {
          list = list.filter(
            (r: Recipe) =>
              r.cookTime === null ||
              r.cookTime === undefined ||
              Number(r.cookTime) >= Number(f.minCookTime),
          );
        }
        if (f.maxCookTime) {
          list = list.filter(
            (r: Recipe) =>
              r.cookTime === null ||
              r.cookTime === undefined ||
              Number(r.cookTime) <= Number(f.maxCookTime),
          );
        }

        if (f.sortBy === "oldest") {
          list.sort(
            (a: Recipe, b: Recipe) =>
              new Date(a.createdAt || 0).getTime() -
              new Date(b.createdAt || 0).getTime(),
          );
        } else if (f.sortBy === "cookTime") {
          list.sort(
            (a: Recipe, b: Recipe) => (a.cookTime || 0) - (b.cookTime || 0),
          );
        } else if (f.sortBy === "calories") {
          list.sort(
            (a: Recipe, b: Recipe) => (a.calories || 0) - (b.calories || 0),
          );
        } else if (f.sortBy === "name") {
          list.sort((a: Recipe, b: Recipe) =>
            (a.title || "").localeCompare(b.title || ""),
          );
        } else {
          list.sort(
            (a: Recipe, b: Recipe) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );
        }

        setRecipes(list);
        setTotal(totalCount);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to load recipes. Please try again.";
        console.error("Failed to fetch my recipes:", err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    if (!user?.id) return;
    void Promise.resolve().then(() => fetchRecipes(page));
  }, [page, fetchRecipes, user?.id]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.categories.list();
        setCategories(Array.isArray(cats) ? (cats as RecipeCategory[]) : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleSearch = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-bold">
              <span>📖</span>
              My Recipe Collection
            </h1>

            <p className="mt-2 text-gray-500">
              Manage all your personal recipes in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/recipes/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
          >
            <span>➕</span>
            Create Recipe
          </button>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Filter */}
          <aside className="xl:col-span-3">
            <SearchFilter
              onSearch={handleSearch}
              onReset={handleReset}
              categories={categories}
              historyEnabled={Boolean(user?.id)}
            />
          </aside>

          {/* Recipes */}
          <section className="xl:col-span-9">
            {loading ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-orange-100 bg-white p-12 text-center">
                <div className="mb-4 animate-bounce text-4xl">⏳</div>

                <p className="font-medium text-gray-600">
                  Loading your recipes...
                </p>
              </div>
            ) : error ? (
              <div className="space-y-4 rounded-3xl border border-orange-100 bg-white p-16 text-center">
                <div className="text-5xl">😵</div>

                <h3 className="text-xl font-bold text-gray-800">
                  Failed to load recipes
                </h3>

                <p className="mx-auto max-w-md text-sm text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchRecipes(page)}
                  className="rounded-xl bg-orange-50 px-5 py-2.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
                >
                  🔄 Try Again
                </button>
              </div>
            ) : recipes.length === 0 ? (
              <div className="space-y-4 rounded-3xl border border-orange-100 bg-white p-16 text-center">
                <div className="text-5xl">🍲</div>

                <h3 className="text-xl font-bold text-gray-800">
                  No recipes found
                </h3>

                <p className="mx-auto max-w-md text-sm text-gray-500">
                  {filters.keyword || filters.categoryId || filters.visibility
                    ? "Try changing your search filters to find more recipes."
                    : "You haven't created any recipes yet. Click Create Recipe to get started!"}
                </p>

                {(filters.keyword ||
                  filters.categoryId ||
                  filters.visibility ||
                  filters.minCalories ||
                  filters.maxCalories ||
                  filters.minCookTime ||
                  filters.maxCookTime) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl bg-orange-50 px-5 py-2.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
                  >
                    🗑️ Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm font-medium text-gray-600">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {recipes.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-gray-900">
                    {Math.min(page * PAGE_SIZE, total)}
                  </span>{" "}
                  of <span className="font-bold text-orange-600">{total}</span>{" "}
                  recipes
                </div>

                <RecipeGrid recipes={recipes} />

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
