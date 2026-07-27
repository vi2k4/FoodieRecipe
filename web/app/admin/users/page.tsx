"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Lock, Unlock, Trash2, Shield, User } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminUsers, toggleUserLock, deleteAdminUser } from "@/lib/admin-api";
import { toast } from "sonner";

type UserData = {
  id: string;
  username: string;
  email: string;
  role: string;
  isLocked: boolean;
  isVerified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  deletedAt?: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ search: search || undefined, page, limit: 10 });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleLock = async (user: UserData) => {
    setActionId(user.id);
    try {
      await toggleUserLock(user.id, !user.isLocked);
      toast.success(
        user.isLocked
          ? `Đã mở khóa tài khoản ${user.username}`
          : `Đã khóa tài khoản ${user.username}`
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isLocked: !u.isLocked } : u))
      );
    } catch {
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${user.username}?`)) return;
    setActionId(user.id);
    try {
      await deleteAdminUser(user.id);
      toast.success(`Đã xóa tài khoản ${user.username}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      toast.error("Không thể xóa người dùng");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Quản lý người dùng"
        subtitle={`${total.toLocaleString("vi-VN")} tài khoản trong hệ thống`}
      />
      <div className="p-6 space-y-4">

        {/* Search bar */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
          <input
            id="user-search-input"
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Xóa
            </button>
          )}
        </div>

        {/* Table */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface-muted)" }}>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                    Ngày tham gia
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td colSpan={5} className="px-4 py-4">
                          <div className="h-8 animate-pulse rounded-lg" style={{ backgroundColor: "#f5f5f4" }} />
                        </td>
                      </tr>
                    ))
                  : users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-orange-50"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "var(--surface-muted)" }}>
                                <User className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                              </div>
                            )}
                            <div>
                              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{user.username}</p>
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                            style={
                              user.role === "ADMIN"
                                ? { backgroundColor: "#fff7ed", color: "var(--primary)" }
                                : { backgroundColor: "#f5f5f4", color: "var(--text-secondary)" }
                            }
                          >
                            {user.role === "ADMIN" && <Shield className="h-3 w-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "var(--text-secondary)" }}>
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                            style={
                              user.isLocked
                                ? { backgroundColor: "#fef2f2", color: "#dc2626" }
                                : { backgroundColor: "#ecfdf5", color: "#16a34a" }
                            }
                          >
                            {user.isLocked ? "Đã khóa" : "Hoạt động"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`lock-btn-${user.id}`}
                              onClick={() => handleToggleLock(user)}
                              disabled={actionId === user.id}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
                              style={
                                user.isLocked
                                  ? { backgroundColor: "#ecfdf5", color: "#16a34a", border: "1px solid #bbf7d0" }
                                  : { backgroundColor: "#fff7ed", color: "var(--primary)", border: "1px solid #fed7aa" }
                              }
                            >
                              {user.isLocked ? (
                                <><Unlock className="h-3 w-3" /> Mở khóa</>
                              ) : (
                                <><Lock className="h-3 w-3" /> Khóa</>
                              )}
                            </button>
                            <button
                              id={`delete-btn-${user.id}`}
                              onClick={() => handleDelete(user)}
                              disabled={actionId === user.id}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
                              style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                            >
                              <Trash2 className="h-3 w-3" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
