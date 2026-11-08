"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, ChevronDown, Clock3, FileText, XCircle } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getPendingAdminRecipes, reviewAdminRecipe } from "@/lib/admin-api";
import { toast } from "sonner";

type Recipe = { id: string | number; title: string; description?: string | null; isPublic: boolean; source?: string | null; author?: { id?: string | number; username?: string; email?: string } };
type Section = "pending" | "rejected" | "approved";

export default function PendingRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [active, setActive] = useState<Section>("pending");
  const [expanded, setExpanded] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | number | null>(null);

  useEffect(() => { getPendingAdminRecipes().then(setRecipes).catch(() => toast.error("Không thể tải hàng đợi phê duyệt")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => recipes.filter((r) => active === "pending" ? !r.isPublic && r.source !== "USER_REJECTED" : active === "rejected" ? r.source === "USER_REJECTED" : r.isPublic), [recipes, active]);
  const users = useMemo(() => { const map = new Map<string, { id: string | number; username: string; email: string; recipes: Recipe[] }>(); filtered.forEach((r) => { const id = r.author?.id ?? "unknown"; const user = map.get(String(id)) || { id, username: r.author?.username || "Người dùng", email: r.author?.email || "", recipes: [] }; user.recipes.push(r); map.set(String(id), user); }); return Array.from(map.values()); }, [filtered]);
  const count = (key: Section) => recipes.filter((r) => key === "pending" ? !r.isPublic && r.source !== "USER_REJECTED" : key === "rejected" ? r.source === "USER_REJECTED" : r.isPublic).length;

  async function review(recipe: Recipe, approved: boolean) {
    if (!approved && !confirm(`Từ chối công thức "${recipe.title}"?`)) return;
    setActionId(recipe.id);
    try { await reviewAdminRecipe(String(recipe.id), approved); setRecipes((items) => items.filter((item) => item.id !== recipe.id)); toast.success(approved ? "Đã phê duyệt và gửi thông báo" : "Đã từ chối và gửi thông báo"); } catch { toast.error("Không thể xử lý công thức"); } finally { setActionId(null); }
  }

  const tabs: { key: Section; label: string; icon: typeof Clock3 }[] = [{ key: "pending", label: "Chờ duyệt", icon: Clock3 }, { key: "rejected", label: "Từ chối", icon: XCircle }, { key: "approved", label: "Đã duyệt", icon: CheckCircle }];
  return <div><AdminHeader title="Phê duyệt công thức" subtitle="Quản lý yêu cầu đăng công thức từ cộng đồng" /><div className="space-y-6 p-6"><div className="flex gap-2 overflow-x-auto border-b" style={{ borderColor: "var(--border)" }}>{tabs.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => { setActive(key); setExpanded(null); }} className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${active === key ? "border-orange-500 text-orange-600" : "border-transparent text-stone-500 hover:text-orange-600"}`}><Icon className="h-4 w-4" />{label}<span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">{count(key)}</span></button>)}</div>{loading ? <div className="rounded-2xl border p-12 text-center">Đang tải...</div> : users.length === 0 ? <div className="rounded-2xl border p-16 text-center" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}><FileText className="mx-auto mb-3 h-10 w-10 text-stone-400" /><p style={{ color: "var(--text-secondary)" }}>Không có dữ liệu trong mục này.</p></div> : <div className="space-y-3">{users.map((user) => <div key={String(user.id)} className="overflow-hidden rounded-2xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}><button type="button" onClick={() => setExpanded(expanded === user.id ? null : user.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-orange-50/50"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">{user.username.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-bold" style={{ color: "var(--text-primary)" }}>{user.username}</p><p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p></div></div><span className="flex shrink-0 items-center gap-3"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{user.recipes.length} công thức</span><ChevronDown className={`h-5 w-5 transition-transform ${expanded === user.id ? "rotate-180" : ""}`} /></span></button>{expanded === user.id && <div className="space-y-3 border-t p-4" style={{ borderColor: "var(--border)" }}>{user.recipes.map((recipe) => <div key={String(recipe.id)} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border)" }}><div><p className="font-semibold" style={{ color: "var(--text-primary)" }}>{recipe.title}</p><p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--text-secondary)" }}>{recipe.description || "Không có mô tả"}</p></div>{active === "pending" && <div className="flex shrink-0 gap-2"><button type="button" disabled={actionId === recipe.id} onClick={() => review(recipe, true)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle className="h-4 w-4" /> Duyệt</button><button type="button" disabled={actionId === recipe.id} onClick={() => review(recipe, false)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"><XCircle className="h-4 w-4" /> Từ chối</button></div>}</div>)}</div>}</div>)}</div>}</div></div>;
}
