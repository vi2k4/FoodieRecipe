"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2, Eye, EyeOff, Clock, ChefHat } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminRecipes, deleteAdminRecipe } from "@/lib/admin-api";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

type Recipe = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  isPublic: boolean;
  cookTime?: number;
  difficulty: string;
  likeCount: string;
  averageRating: string;
  createdAt: string;
  author: { id: string; username: string; email: string };
  category?: { id: string; name: string } | null;
};


const difficultyLabel: Record<string, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};
const difficultyColor: Record<string, string> = {
  EASY: "#16a34a",
  MEDIUM: "#eab308",
  HARD: "#dc2626",
};

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminRecipes({ search: search || undefined, page, limit: 10 });
      setRecipes(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Không thể tải danh sách công thức");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleToggleVisibility = async (recipe: Recipe) => {
    setActionId(recipe.id);
    try {
      await apiClient.patch(`/admin/recipes/${recipe.id}`, { isPublic: !recipe.isPublic });
      toast.success(recipe.isPublic ? `Đã ẩn công thức "${recipe.title}"` : `Đã hiện công thức "${recipe.title}"`);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? { ...r, isPublic: !r.isPublic } : r))
      );
    } catch {
      toast.error("Không thể thay đổi trạng thái công thức");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (recipe: Recipe) => {
    if (!confirm(`Bạn có chắc muốn xóa công thức "${recipe.title}"?`)) return;
    setActionId(recipe.id);
    try {
      await deleteAdminRecipe(recipe.id);
      toast.success(`Đã xóa công thức "${recipe.title}"`);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } catch {
      toast.error("Không thể xóa công thức");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Quản lý công thức"
        subtitle={`${total.toLocaleString("vi-VN")} công thức trong hệ thống`}
      />
      <div className="p-6 space-y-4">

        {/* Search */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
          <input
            id="recipe-search-input"
            type="text"
            placeholder="Tìm kiếm theo tên công thức..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl" style={{ backgroundColor: "#f5f5f4" }} />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ChefHat className="h-12 w-12 mb-3" style={{ color: "var(--border)" }} />
            <p style={{ color: "var(--text-secondary)" }}>Không tìm thấy công thức nào</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group overflow-hidden rounded-2xl transition-shadow duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  opacity: recipe.isPublic ? 1 : 0.75,
                }}
              >
                {/* Thumbnail */}
                <Link href={`/admin/recipes/${recipe.id}`} className="block relative h-40 overflow-hidden bg-stone-100 cursor-pointer">
                  {recipe.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={recipe.thumbnail}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ChefHat className="h-10 w-10 text-stone-300" />
                    </div>
                  )}
                  {!recipe.isPublic && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
                        Đã ẩn
                      </span>
                    </div>
                  )}
                  <span
                    className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: difficultyColor[recipe.difficulty] || "#78716c" }}
                  >
                    {difficultyLabel[recipe.difficulty] || recipe.difficulty}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-1 line-clamp-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                    <Link href={`/admin/recipes/${recipe.id}`} className="hover:underline">
                      {recipe.title}
                    </Link>
                  </h3>

                  <p className="mb-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    bởi {recipe.author?.username}
                    {recipe.cookTime && (
                      <span className="ml-2 inline-flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {recipe.cookTime} phút
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      id={`visibility-btn-${recipe.id}`}
                      onClick={() => handleToggleVisibility(recipe)}
                      disabled={actionId === recipe.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all disabled:opacity-50"
                      style={
                        recipe.isPublic
                          ? { backgroundColor: "#fff7ed", color: "var(--primary)", border: "1px solid #fed7aa" }
                          : { backgroundColor: "#ecfdf5", color: "#16a34a", border: "1px solid #bbf7d0" }
                      }
                    >
                      {recipe.isPublic ? (
                        <><EyeOff className="h-3.5 w-3.5" /> Ẩn</>
                      ) : (
                        <><Eye className="h-3.5 w-3.5" /> Hiện</>
                      )}
                    </button>
                    <button
                      id={`delete-recipe-btn-${recipe.id}`}
                      onClick={() => handleDelete(recipe)}
                      disabled={actionId === recipe.id}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Trước
            </button>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
