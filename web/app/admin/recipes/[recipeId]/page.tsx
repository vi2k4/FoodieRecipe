"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Users,
  ChefHat,
  Star,
  Heart,
  Bookmark,
  ArrowLeft,
  Flame,
  Tag,
  MessageCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { deleteAdminRecipe } from "@/lib/admin-api";
import { toast } from "sonner";
import { AdminHeader } from "@/components/layout/AdminHeader";

type Recipe = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  cookTime?: number;
  servings?: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  calories?: number;
  averageRating: number;
  likeCount: string;
  favoriteCount: string;
  viewCount: string;
  isPublic: boolean;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  ingredients: {
    id: string;
    ingredientName: string;
    quantity?: number;
    unit?: string;
    displayOrder: number;
  }[];
  steps: {
    id: string;
    stepNumber: number;
    content: string;
  }[];
  tags?: { id: string; name: string }[];
  _count: {
    comments: number;
    likes: number;
    favorites: number;
  };
};

const difficultyConfig = {
  EASY: { label: "Dễ", color: "#16a34a", bg: "#dcfce7" },
  MEDIUM: { label: "Trung bình", color: "#d97706", bg: "#fef3c7" },
  HARD: { label: "Khó", color: "#dc2626", bg: "#fee2e2" },
};

export default function AdminRecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params?.recipeId as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    apiClient
      .get(`/recipes/${recipeId}`)
      .then((res) => setRecipe(res.data))
      .catch((e) => setError(e.message || "Không thể tải công thức"))
      .finally(() => setLoading(false));
  }, [recipeId]);

  const handleToggleVisibility = async () => {
    if (!recipe) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/recipes/${recipe.id}`, { isPublic: !recipe.isPublic });
      toast.success(recipe.isPublic ? `Đã ẩn công thức "${recipe.title}"` : `Đã hiện công thức "${recipe.title}"`);
      setRecipe((prev) => (prev ? { ...prev, isPublic: !prev.isPublic } : null));
    } catch {
      toast.error("Không thể thay đổi trạng thái công thức");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !confirm(`Bạn có chắc muốn xóa công thức "${recipe.title}"?`)) return;
    setActionLoading(true);
    try {
      await deleteAdminRecipe(recipe.id);
      toast.success(`Đã xóa công thức "${recipe.title}"`);
      router.push("/admin/recipes");
    } catch {
      toast.error("Không thể xóa công thức");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Chi tiết công thức" subtitle="Đang tải..." />
        <div className="p-6">
          <div className="h-72 w-full animate-pulse rounded-2xl" style={{ backgroundColor: "#e7e5e4" }} />
          <div className="mx-auto max-w-4xl py-8 space-y-6">
            {[200, 100, 300, 250].map((w, i) => (
              <div key={i} className="h-6 animate-pulse rounded-xl" style={{ backgroundColor: "#e7e5e4", maxWidth: `${w}px` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div>
        <AdminHeader title="Chi tiết công thức" subtitle="Lỗi" />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <AlertCircle className="h-16 w-16" style={{ color: "var(--danger)" }} />
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {error || "Không tìm thấy công thức"}
          </h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const diff = difficultyConfig[recipe.difficulty] || { label: recipe.difficulty, color: "#78716c", bg: "#f5f5f4" };

  return (
    <div>
      <AdminHeader 
        title="Chi tiết công thức" 
        subtitle={`Quản lý công thức: ${recipe.title}`} 
      />
      
      {/* Admin Action Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Trở về danh sách
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleVisibility}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
            style={
              recipe.isPublic
                ? { backgroundColor: "#fff7ed", color: "var(--primary)", border: "1px solid #fed7aa" }
                : { backgroundColor: "#ecfdf5", color: "#16a34a", border: "1px solid #bbf7d0" }
            }
          >
            {recipe.isPublic ? (
              <><EyeOff className="h-4 w-4" /> Ẩn công thức</>
            ) : (
              <><Eye className="h-4 w-4" /> Hiện công thức</>
            )}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
          >
            <Trash2 className="h-4 w-4" /> Xóa công thức
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Hero Image */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl mb-8">
          {recipe.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.thumbnail}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: "var(--surface-muted)" }}>
              <ChefHat className="h-20 w-20" style={{ color: "var(--border)" }} />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status overlay */}
          {!recipe.isPublic && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white/90 px-6 py-2 text-sm font-bold text-gray-700 shadow-lg">
                CÔNG THỨC ĐANG BỊ ẨN
              </span>
            </div>
          )}

          {/* Title overlaid */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {recipe.category && (
              <span
                className="mb-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "var(--primary)", color: "white" }}
              >
                {recipe.category.name}
              </span>
            )}
            <h1 className="text-2xl font-bold text-white sm:text-4xl">{recipe.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {recipe.description && (
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {recipe.description}
                </p>
              </div>
            )}

            {/* Ingredients */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                  🥕
                </span>
                Nguyên liệu
                {recipe.servings && (
                  <span className="ml-auto text-sm font-normal" style={{ color: "var(--text-secondary)" }}>
                    {recipe.servings} khẩu phần
                  </span>
                )}
              </h2>

              {recipe.ingredients.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>Chưa có nguyên liệu</p>
              ) : (
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing) => (
                    <li
                      key={ing.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                      style={{ backgroundColor: "var(--surface-muted)" }}
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                      <span className="flex-1 font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {ing.ingredientName}
                      </span>
                      {(ing.quantity || ing.unit) && (
                        <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                          {ing.quantity} {ing.unit}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Steps */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                  👨‍🍳
                </span>
                Các bước thực hiện
              </h2>

              {recipe.steps.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>Chưa có hướng dẫn các bước</p>
              ) : (
                <ol className="space-y-5">
                  {recipe.steps.map((step) => (
                    <li key={step.id} className="flex gap-4">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white mt-0.5"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        {step.stepNumber}
                      </div>
                      <div
                        className="flex-1 rounded-xl p-4"
                        style={{ backgroundColor: "var(--surface-muted)" }}
                      >
                        <p className="leading-relaxed text-sm" style={{ color: "var(--text-primary)" }}>
                          {step.content}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Stats */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Thông tin nhanh</h3>

              <div className="grid grid-cols-2 gap-3">
                {recipe.cookTime && (
                  <div className="flex flex-col items-center rounded-xl py-3 px-2 gap-1" style={{ backgroundColor: "var(--surface-muted)" }}>
                    <Clock className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{recipe.cookTime} phút</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Thời gian</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex flex-col items-center rounded-xl py-3 px-2 gap-1" style={{ backgroundColor: "var(--surface-muted)" }}>
                    <Users className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{recipe.servings}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Khẩu phần</span>
                  </div>
                )}
                <div className="flex flex-col items-center rounded-xl py-3 px-2 gap-1" style={{ backgroundColor: "var(--surface-muted)" }}>
                  <ChefHat className="h-5 w-5" style={{ color: diff.color }} />
                  <span className="text-sm font-bold" style={{ color: diff.color }}>{diff.label}</span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Độ khó</span>
                </div>
                {recipe.calories && (
                  <div className="flex flex-col items-center rounded-xl py-3 px-2 gap-1" style={{ backgroundColor: "var(--surface-muted)" }}>
                    <Flame className="h-5 w-5" style={{ color: "#f97316" }} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{recipe.calories}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Calories</span>
                  </div>
                )}
              </div>

              {/* Engagement stats */}
              <div className="flex items-center justify-around pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Heart className="h-4 w-4" style={{ color: "#ec4899" }} />
                  <span>{recipe.likeCount}</span>
                </div>
                <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Bookmark className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  <span>{recipe.favoriteCount}</span>
                </div>
                <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <MessageCircle className="h-4 w-4" style={{ color: "#3b82f6" }} />
                  <span>{recipe._count?.comments ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Eye className="h-4 w-4" />
                  <span>{recipe.viewCount}</span>
                </div>
              </div>

              {/* Rating */}
              {recipe.averageRating > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {Number(recipe.averageRating).toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>/ 5.0</span>
                </div>
              )}
            </div>

            {/* Author */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3 className="mb-3 font-bold" style={{ color: "var(--text-primary)" }}>Tác giả</h3>
              <div className="flex items-center gap-3">
                {recipe.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.author.avatarUrl}
                    alt={recipe.author.username}
                    className="h-12 w-12 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--primary)" }}
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {recipe.author.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {recipe.author.username}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    ID: {recipe.author.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h3 className="mb-3 font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Tag className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: "var(--surface-muted)", color: "var(--primary)", border: "1px solid var(--border)" }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
