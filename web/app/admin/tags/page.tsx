"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, X, Check } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getTags, createTag, updateTag, deleteTag } from "@/lib/admin-api";
import { toast } from "sonner";

type TagItem = {
  id: string;
  name: string;
};

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(() => toast.error("Không thể tải tags"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Tên tag không được để trống"); return; }
    setSaving(true);
    try {
      const created = await createTag(newName.trim());
      setTags((prev) => [...prev, created]);
      setNewName("");
      toast.success(`Đã thêm tag "${created.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Không thể thêm tag");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) { toast.error("Tên tag không được để trống"); return; }
    setSaving(true);
    try {
      const updated = await updateTag(id, editName.trim());
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditId(null);
      toast.success(`Đã đổi tên tag thành "${updated.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Không thể cập nhật tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: TagItem) => {
    if (!confirm(`Xóa tag "${tag.name}"?`)) return;
    try {
      await deleteTag(tag.id);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      toast.success(`Đã xóa tag "${tag.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Không thể xóa tag");
    }
  };

  return (
    <div>
      <AdminHeader title="Quản lý Tags" subtitle={`${tags.length} tags trong hệ thống`} />
      <div className="p-6 space-y-6">

        {/* Add Tag */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="mb-3 font-semibold" style={{ color: "var(--text-primary)" }}>
            Thêm tag mới
          </h3>
          <div className="flex gap-3">
            <input
              id="new-tag-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Tên tag mới... (Enter để thêm)"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              id="add-tag-btn"
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Plus className="h-4 w-4" />
              Thêm
            </button>
          </div>
        </div>

        {/* Tags list */}
        {loading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded-full" style={{ backgroundColor: "#f5f5f4" }} />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Tag className="h-12 w-12 mb-3" style={{ color: "var(--border)" }} />
            <p style={{ color: "var(--text-secondary)" }}>Chưa có tag nào</p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3 className="mb-4 font-semibold" style={{ color: "var(--text-primary)" }}>
              Tất cả tags ({tags.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all"
                  style={{
                    backgroundColor: editId === tag.id ? "#fff7ed" : "var(--surface-muted)",
                    border: editId === tag.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                  }}
                >
                  <Tag className="h-3 w-3" style={{ color: "var(--primary)" }} />

                  {editId === tag.id ? (
                    <>
                      <input
                        id={`edit-tag-input-${tag.id}`}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(tag.id); if (e.key === "Escape") setEditId(null); }}
                        autoFocus
                        className="w-24 bg-transparent text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                      <button onClick={() => handleUpdate(tag.id)} disabled={saving} className="rounded-full p-0.5 hover:bg-green-100" title="Lưu">
                        <Check className="h-3 w-3 text-green-600" />
                      </button>
                      <button onClick={() => setEditId(null)} className="rounded-full p-0.5 hover:bg-red-100" title="Hủy">
                        <X className="h-3 w-3 text-red-500" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "var(--text-primary)" }}>{tag.name}</span>
                      <div className="hidden items-center gap-1 group-hover:flex">
                        <button
                          id={`edit-tag-btn-${tag.id}`}
                          onClick={() => { setEditId(tag.id); setEditName(tag.name); }}
                          className="rounded-full p-0.5 hover:bg-orange-100"
                          title="Đổi tên"
                        >
                          <Pencil className="h-3 w-3" style={{ color: "var(--primary)" }} />
                        </button>
                        <button
                          id={`delete-tag-btn-${tag.id}`}
                          onClick={() => handleDelete(tag)}
                          className="rounded-full p-0.5 hover:bg-red-100"
                          title="Xóa"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
