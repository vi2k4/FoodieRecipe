"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Globe, LogIn, Search, UserRound, X } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminLoginHistory, getAdminUserLoginHistory } from "@/lib/admin-api";
import { toast } from "sonner";

type LoginRecord = {
  id: string;
  ipAddress: string;
  userAgent?: string | null;
  loginMethod: "PASSWORD" | "GOOGLE" | string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
  };
};

export default function AdminLoginHistoryPage() {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<LoginRecord["user"] | null>(null);
  const [userHistory, setUserHistory] = useState<LoginRecord[]>([]);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminLoginHistory({
        search: submittedSearch || undefined,
        page,
        limit: 20,
      });
      setRecords(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch {
      toast.error("Không thể tải lịch sử đăng nhập");
    } finally {
      setLoading(false);
    }
  }, [page, submittedSearch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const openUserHistory = async (user: LoginRecord["user"]) => {
    setSelectedUser(user);
    setUserHistory([]);
    setUserHistoryLoading(true);
    try {
      const result = await getAdminUserLoginHistory(String(user.id));
      setUserHistory(result.data || []);
    } catch {
      toast.error("Không thể tải lịch sử của người dùng");
      setSelectedUser(null);
    } finally {
      setUserHistoryLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Lịch sử đăng nhập"
        subtitle={`${total.toLocaleString("vi-VN")} lượt đăng nhập đã ghi nhận`}
      />

      <div className="space-y-5 p-4 sm:p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo username, email hoặc địa chỉ IP..."
              className="h-10 w-full rounded-xl border bg-transparent pl-9 pr-3 text-sm outline-none focus:border-orange-500"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>
        </form>

        <div
          className="overflow-hidden rounded-2xl border"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="px-5 py-4 font-semibold" style={{ color: "var(--text-secondary)" }}>Người dùng</th>
                  <th className="px-5 py-4 font-semibold" style={{ color: "var(--text-secondary)" }}>Địa chỉ IP</th>
                  <th className="px-5 py-4 font-semibold" style={{ color: "var(--text-secondary)" }}>Phương thức</th>
                  <th className="px-5 py-4 font-semibold" style={{ color: "var(--text-secondary)" }}>Thiết bị</th>
                  <th className="px-5 py-4 font-semibold" style={{ color: "var(--text-secondary)" }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-14 text-center" style={{ color: "var(--text-secondary)" }}>Đang tải lịch sử...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-14 text-center" style={{ color: "var(--text-secondary)" }}>Chưa có dữ liệu đăng nhập.</td></tr>
                ) : records.map((record) => (
                  <tr key={record.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {record.user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={record.user.avatarUrl} alt={record.user.username} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700"><UserRound className="h-4 w-4" /></div>
                        )}
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => openUserHistory(record.user)}
                            className="truncate text-left font-semibold hover:text-orange-600 hover:underline"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {record.user.username}
                          </button>
                          <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>{record.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-primary)" }}><span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-orange-500" />{record.ipAddress}</span></td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800"><LogIn className="h-3.5 w-3.5" />{record.loginMethod === "GOOGLE" ? "Google" : "Mật khẩu"}</span></td>
                    <td className="max-w-xs truncate px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }} title={record.userAgent || "Không rõ thiết bị"}>{record.userAgent || "Không rõ thiết bị"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(record.createdAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Trang {page} / {totalPages}</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Trước</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Sau</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedUser(null)}>
          <div
            className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold" style={{ color: "var(--text-primary)" }}>Lịch sử đăng nhập của {selectedUser.username}</h2>
                <p className="truncate text-sm" style={{ color: "var(--text-secondary)" }}>{selectedUser.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="rounded-lg p-2 hover:bg-orange-50" aria-label="Đóng">
                <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto p-5">
              {userHistoryLoading ? (
                <p className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Đang tải lịch sử...</p>
              ) : userHistory.length === 0 ? (
                <p className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Người dùng chưa có lượt đăng nhập nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                        <th className="px-3 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Địa chỉ IP</th>
                        <th className="px-3 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Phương thức</th>
                        <th className="px-3 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Thiết bị</th>
                        <th className="px-3 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userHistory.map((record) => (
                        <tr key={record.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                          <td className="px-3 py-3 font-mono text-xs" style={{ color: "var(--text-primary)" }}>{record.ipAddress}</td>
                          <td className="px-3 py-3 text-xs" style={{ color: "var(--text-primary)" }}>{record.loginMethod === "GOOGLE" ? "Google" : "Mật khẩu"}</td>
                          <td className="max-w-xs truncate px-3 py-3 text-xs" style={{ color: "var(--text-secondary)" }} title={record.userAgent || "Không rõ thiết bị"}>{record.userAgent || "Không rõ thiết bị"}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(record.createdAt).toLocaleString("vi-VN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
