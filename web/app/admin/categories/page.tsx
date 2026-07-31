"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Layers, X, Check } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/admin-api";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt: string;
};

type FormState = {
  name: string;
  description: string;
  icon: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", description: "", icon: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Không thể tải danh mục"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", description: "", icon: "" });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "" });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Tên danh mục không được để trống"); return; }
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateCategory(editId, {
          name: form.name,
          description: form.description || undefined,
          icon: form.icon || undefined,
        });
        setCategories((prev) => prev.map((c) => (c.id === editId ? updated : c)));
        toast.success("Đã cập nhật danh mục");
      } else {
        const created = await createCategory({
          name: form.name,
          description: form.description || undefined,
          icon: form.icon || undefined,
        });
        setCategories((prev) => [...prev, created]);
        toast.success("Đã thêm danh mục mới");
      }
      closeForm();
    } catch (e: any) {
      toast.error(e.message || "Không thể lưu danh mục");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success(`Đã xóa danh mục "${cat.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Không thể xóa danh mục");
    }
  };

  return (
    <div>
      <AdminHeader title="Quản lý danh mục" subtitle={`${categories.length} danh mục`} />
      <div className="p-6 space-y-4">

        {/* Add button */}
        <div className="flex justify-end">
          <button
            id="add-category-btn"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{ backgroundColor: "var(--surface)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                  {editId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                </h3>
                <button onClick={closeForm}><X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    Tên danh mục *
                  </label>
                  <input
                    id="category-name-input"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Món chính"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    Mô tả
                  </label>
                  <textarea
                    id="category-desc-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả ngắn về danh mục..."
                    rows={3}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                    style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    Icon (tên Lucide icon)
                  </label>
                  <input
                    id="category-icon-input"
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Ví dụ: Utensils, Cake, Coffee..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button
                  onClick={closeForm}
                  className="rounded-xl px-4 py-2 text-sm font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Hủy
                </button>
                <button
                  id="save-category-btn"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Check className="h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl" style={{ backgroundColor: "#f5f5f4" }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Layers className="h-12 w-12 mb-3" style={{ color: "var(--border)" }} />
            <p style={{ color: "var(--text-secondary)" }}>Chưa có danh mục nào</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl p-5 transition-shadow hover:shadow-md"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg flex-shrink-0"
                      style={{ backgroundColor: "var(--surface-muted)" }}
                    >
                      {cat.icon ? cat.icon[0].toUpperCase() : "📂"}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                      {cat.icon && (
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{cat.icon}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      id={`edit-cat-btn-${cat.id}`}
                      onClick={() => openEdit(cat)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-orange-50"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                    </button>
                    <button
                      id={`delete-cat-btn-${cat.id}`}
                      onClick={() => handleDelete(cat)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                {cat.description && (
                  <p className="mt-3 text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {cat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
