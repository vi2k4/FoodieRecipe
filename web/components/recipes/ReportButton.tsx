"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { socialApi } from "@/lib/social-api";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
  recipeId: number | string;
  recipeTitle?: string;
  className?: string;
  variant?: "button" | "icon" | "menuItem";
}

const PRESET_REASONS = [
  "Nội dung vi phạm / Không phù hợp",
  "Hướng dẫn sai lệch / Gây nguy hiểm",
  "Hình ảnh giả mạo / Vi phạm bản quyền",
  "Spam / Quảng cáo rác",
  "Lý do khác",
];

export function ReportButton({
  recipeId,
  recipeTitle,
  className = "",
  variant = "button",
}: ReportButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const session = auth.getSession();
    if (!session?.accessToken) {
      toast.error("Vui lòng đăng nhập để báo cáo công thức!");
      router.push("/login");
      return;
    }

    setIsOpen(true);
    setSubmitted(false);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalReason =
      selectedReason === "Lý do khác"
        ? customReason.trim()
        : selectedReason;

    if (!finalReason) {
      toast.error("Vui lòng chọn hoặc nhập lý do báo cáo!");
      return;
    }

    if (finalReason.length > 100) {
      toast.error("Lý do báo cáo không được vượt quá 100 ký tự!");
      return;
    }

    setLoading(true);
    try {
      await socialApi.reportRecipe(recipeId, {
        reason: finalReason,
        description: description.trim() || undefined,
      });

      setSubmitted(true);
      toast.success("Đã gửi báo cáo công thức tới Ban quản trị (Admin)!");
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setDescription("");
        setCustomReason("");
        setSelectedReason(PRESET_REASONS[0]);
      }, 1800);
    } catch (err: any) {
      toast.error(err?.message || "Gửi báo cáo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "button" && (
        <button
          type="button"
          onClick={handleOpen}
          className={`px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all duration-200 ${className}`}
          title="Báo cáo công thức vi phạm"
        >
          <Flag className="w-3.5 h-3.5 text-red-400" />
          <span>Báo cáo</span>
        </button>
      )}

      {variant === "icon" && (
        <button
          type="button"
          onClick={handleOpen}
          className={`p-2 rounded-full bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors border border-neutral-200/60 ${className}`}
          title="Báo cáo công thức vi phạm"
        >
          <Flag className="w-4 h-4" />
        </button>
      )}

      {variant === "menuItem" && (
        <button
          type="button"
          onClick={handleOpen}
          className={`w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors ${className}`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Báo cáo công thức này</span>
        </button>
      )}

      {/* Report Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Báo cáo công thức
                  </h3>
                  {recipeTitle && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[280px]">
                      {recipeTitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              /* Success State */
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Đã gửi báo cáo thành công!
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                  Cảm ơn bạn đã phản hồi. Ban quản trị sẽ sớm kiểm tra và xử lý công thức này.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                    Lý do báo cáo <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {PRESET_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                          selectedReason === reason
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 shadow-xs"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="w-4 h-4 text-red-600 focus:ring-red-500 border-neutral-300"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedReason === "Lý do khác" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                      Nhập lý do cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Ví dụ: Công thức trùng lặp, thiếu định lượng..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Chi tiết bổ sung (không bắt buộc)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả cụ thể thông tin vi phạm để Admin kiểm tra nhanh hơn..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Báo cáo của bạn sẽ gửi trực tiếp đến hệ thống quản trị. Vui lòng cung cấp thông tin trung thực.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi báo cáo"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
