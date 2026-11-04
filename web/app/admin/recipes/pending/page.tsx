"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock3, XCircle } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getPendingAdminRecipes, reviewAdminRecipe } from "@/lib/admin-api";
import { toast } from "sonner";

type PendingRecipe = { id: string | number; title: string; description?: string | null; createdAt: string; author?: { username?: string; email?: string } };

export default function PendingRecipesPage() {
  const [recipes, setRecipes] = useState<PendingRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | number | null>(null);

  async function load() {
    try { setLoading(true); setRecipes(await getPendingAdminRecipes()); }
    catch { toast.error("Không thể tải danh sách chờ duyệt"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function review(recipe: PendingRecipe, approved: boolean) {
    if (!approved && !confirm(`Từ chối công thức "${recipe.title}"?`)) return;
    setActionId(recipe.id);
    try {
      await reviewAdminRecipe(String(recipe.id), approved);
      setRecipes((items) => items.filter((item) => item.id !== recipe.id));
      toast.success(approved ? "Đã phê duyệt công thức" : "Đã từ chối công thức");
    } catch { toast.error("Không thể xử lý công thức"); }
    finally { setActionId(null); }
  }

  return <div><AdminHeader title="Phê duyệt công thức" subtitle="Kiểm tra và quyết định các công thức người dùng gửi lên" /><div className="space-y-4 p-6">{loading ? <div className="py-16 text-center">Đang tải...</div> : recipes.length === 0 ? <div className="rounded-2xl border p-12 text-center"><CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-500" /><p>Không có công thức nào đang chờ duyệt.</p></div> : recipes.map((recipe) => <article key={recipe.id} className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs text-amber-600"><Clock3 className="h-4 w-4" /> Chờ duyệt</div><h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{recipe.title}</h2><p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Tác giả: {recipe.author?.username || recipe.author?.email || "Không rõ"}</p><p className="mt-3 max-w-3xl text-sm" style={{ color: "var(--text-secondary)" }}>{recipe.description || "Không có mô tả."}</p></div><div className="flex shrink-0 gap-2"><button disabled={actionId === recipe.id} onClick={() => review(recipe, true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle className="h-4 w-4" /> Duyệt</button><button disabled={actionId === recipe.id} onClick={() => review(recipe, false)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"><XCircle className="h-4 w-4" /> Từ chối</button></div></div></article>)}</div></div>;
}
