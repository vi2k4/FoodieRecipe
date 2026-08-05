"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  AlertTriangle,
  User,
  Flame,
  Timer,
  Users,
  Utensils,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminReports, handleReport } from "@/lib/admin-api";
import { api } from "@/lib/api-client";
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

  // State for Review Modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewRecipe, setReviewRecipe] = useState<any | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport((prev) =>
          prev ? { ...prev, status, handledAt: new Date().toISOString() } : null
        );
      }
    } catch (e: any) {
      toast.error(e.message || "Không thể xử lý báo cáo");
    } finally {
      setActionId(null);
    }
  };

  const handleOpenReview = async (report: Report) => {
    setSelectedReport(report);
    setLoadingRecipe(true);
    setReviewRecipe(null);
    try {
      const recipeData = await api.recipes.get(report.recipe.id);
      setReviewRecipe(recipeData);
    } catch (err: any) {
      toast.error("Không thể lấy thông tin chi tiết công thức: " + (err.message || ""));
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleCloseReview = () => {
    setSelectedReport(null);
    setReviewRecipe(null);
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
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer"
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
                  className="rounded-2xl p-5 transition-all hover:shadow-sm"
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

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleOpenReview(report)}
                        className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                        title="Xem xét chi tiết nội dung công thức bị báo cáo"
                      >
                        <Eye className="h-4 w-4" />
                        Xem xét công thức
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal / Drawer Overlay */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={handleCloseReview}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách
                </button>
                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Xem xét báo cáo công thức
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/recipes/${selectedReport.recipe.id}`}
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium mr-2"
                >
                  Mở trang web gốc <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Report Context Banner */}
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-200/60 dark:border-red-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
                      Nội dung báo cáo vi phạm
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: statusConfig[selectedReport.status].bg,
                      color: statusConfig[selectedReport.status].color,
                    }}
                  >
                    {statusConfig[selectedReport.status].label}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="font-semibold text-red-900 dark:text-red-200">Lý do vi phạm: </span>
                  <span className="font-bold text-red-600 dark:text-red-400">{selectedReport.reason}</span>
                </div>

                {selectedReport.description && (
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-white/70 dark:bg-black/30 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                    <span className="font-semibold text-neutral-900 dark:text-white">Mô tả từ người dùng: </span>
                    {selectedReport.description}
                  </div>
                )}

                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-4 pt-1">
                  <span>
                    Người báo cáo: <strong>{selectedReport.reporter.username}</strong>
                  </span>
                  <span>
                    Ngày báo cáo: {new Date(selectedReport.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Recipe Details Section */}
              {loadingRecipe ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium">Đang tải chi tiết công thức để xem xét...</p>
                </div>
              ) : !reviewRecipe ? (
                <div className="p-6 text-center text-neutral-500 border border-dashed rounded-xl">
                  Không thể tải nội dung công thức này (có thể đã bị xóa).
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Recipe Header info */}
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reviewRecipe.thumbnail || "/file.svg"}
                        alt={reviewRecipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {reviewRecipe.category && (
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                            {reviewRecipe.category.name}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            reviewRecipe.isPublic !== false
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {reviewRecipe.isPublic !== false ? "Công khai" : "Đã ẩn / Riêng tư"}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {reviewRecipe.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-neutral-400" /> Tác giả:{" "}
                          <strong>{reviewRecipe.author?.username || "N/A"}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5 text-neutral-400" /> {reviewRecipe.cookTime || "—"} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-neutral-400" /> {reviewRecipe.calories || "—"} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-neutral-400" /> {reviewRecipe.servings || 4} khẩu phần
                        </span>
                      </div>

                      {reviewRecipe.description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                          {reviewRecipe.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ingredients & Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    {/* Ingredients */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        Nguyên liệu ({reviewRecipe.ingredients?.length || 0})
                      </h4>
                      {reviewRecipe.ingredients?.length === 0 ? (
                        <p className="text-xs text-neutral-400">Không có nguyên liệu nào.</p>
                      ) : (
                        <ul className="space-y-2 text-xs">
                          {reviewRecipe.ingredients?.map((ing: any, idx: number) => (
                            <li key={ing.id || idx} className="flex justify-between border-b border-neutral-200/50 dark:border-neutral-700/50 pb-1.5 last:border-0">
                              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                • {ing.ingredientName}
                              </span>
                              <span className="text-neutral-500 font-semibold">
                                {ing.quantity || ""} {ing.unit || ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Steps */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                        Các bước thực hiện ({reviewRecipe.steps?.length || 0})
                      </h4>
                      {reviewRecipe.steps?.length === 0 ? (
                        <p className="text-xs text-neutral-400">Chưa có các bước nấu.</p>
                      ) : (
                        <div className="space-y-3 text-xs">
                          {reviewRecipe.steps?.map((step: any, idx: number) => (
                            <div key={step.id || idx} className="flex items-start gap-2.5">
                              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px]">
                                {step.stepNumber || idx + 1}
                              </span>
                              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {step.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 px-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between gap-3 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={handleCloseReview}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>

              {selectedReport.status === "PENDING" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handle(selectedReport.id, "REJECTED")}
                    disabled={actionId === selectedReport.id}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300"
                  >
                    <XCircle className="h-4 w-4" />
                    Từ chối báo cáo
                  </button>

                  <button
                    type="button"
                    onClick={() => handle(selectedReport.id, "RESOLVED")}
                    disabled={actionId === selectedReport.id}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-md"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Chấp nhận & Ẩn công thức
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-neutral-500">
                  Báo cáo này đã được xử lý (Trạng thái: {statusConfig[selectedReport.status].label})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
