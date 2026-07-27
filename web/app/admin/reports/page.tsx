"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, CheckCircle, XCircle, Clock } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminReports, handleReport } from "@/lib/admin-api";
import { toast } from "sonner";

type Report = {
  id: string;
  reason: string;
  description?: string | null;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
  handledAt?: string | null;
  recipe: { id: string; title: string; author?: { username: string } };
  reporter: { id: string; username: string };
  handler?: { id: string; username: string } | null;
};

const statusConfig = {
  PENDING: { label: "Chờ xử lý", color: "#eab308", bg: "#fef9c3", icon: Clock },
  RESOLVED: { label: "Đã xử lý", color: "#16a34a", bg: "#ecfdf5", icon: CheckCircle },
  REJECTED: { label: "Từ chối", color: "#6b7280", bg: "#f9fafb", icon: XCircle },
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | "PENDING" | "RESOLVED" | "REJECTED">("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminReports(filter || undefined);
      setReports(data);
    } catch {
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handle = async (id: string, status: "RESOLVED" | "REJECTED") => {
    setActionId(id);
    try {
      await handleReport(id, status);
      toast.success(
        status === "RESOLVED"
          ? "Đã xử lý báo cáo và ẩn công thức vi phạm"
          : "Đã từ chối báo cáo"
      );
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, handledAt: new Date().toISOString() } : r
        )
      );
    } catch (e: any) {
      toast.error(e.message || "Không thể xử lý báo cáo");
    } finally {
      setActionId(null);
    }
  };

  const filters: { label: string; value: "" | "PENDING" | "RESOLVED" | "REJECTED" }[] = [
    { label: "Tất cả", value: "" },
    { label: "Chờ xử lý", value: "PENDING" },
    { label: "Đã xử lý", value: "RESOLVED" },
    { label: "Từ chối", value: "REJECTED" },
  ];

  return (
    <div>
      <AdminHeader title="Xử lý báo cáo" subtitle="Quản lý các báo cáo vi phạm từ người dùng" />
      <div className="p-6 space-y-4">

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
              style={
                filter === f.value
                  ? { backgroundColor: "var(--primary)", color: "white", boxShadow: "0 2px 8px rgba(249,115,22,0.4)" }
                  : { backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reports list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl" style={{ backgroundColor: "#f5f5f4" }} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Flag className="h-12 w-12 mb-3" style={{ color: "var(--border)" }} />
            <p style={{ color: "var(--text-secondary)" }}>Không có báo cáo nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const cfg = statusConfig[report.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={report.id}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <StatusIcon className="h-5 w-5" style={{ color: cfg.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                          >
                            {report.reason}
                          </span>
                        </div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          Công thức:{" "}
                          <span style={{ color: "var(--primary)" }}>{report.recipe?.title}</span>
                        </p>
                        {report.description && (
                          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                            {report.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          Người báo cáo:{" "}
                          <strong style={{ color: "var(--text-primary)" }}>{report.reporter?.username}</strong>{" "}
                          · {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                          {report.handledAt && (
                            <> · Đã xử lý: {new Date(report.handledAt).toLocaleDateString("vi-VN")}</>
                          )}
                        </p>
                      </div>
                    </div>

                    {report.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          id={`resolve-btn-${report.id}`}
                          onClick={() => handle(report.id, "RESOLVED")}
                          disabled={actionId === report.id}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                          style={{ backgroundColor: "#ecfdf5", color: "#16a34a", border: "1px solid #bbf7d0" }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Chấp nhận & Ẩn
                        </button>
                        <button
                          id={`reject-btn-${report.id}`}
                          onClick={() => handle(report.id, "REJECTED")}
                          disabled={actionId === report.id}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                          style={{ backgroundColor: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb" }}
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
