"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit3, 
  Reply, 
  X, 
  Check, 
  Loader2,
  CornerDownRight
} from "lucide-react";
import { socialApi } from "@/lib/social-api";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CommentUser {
  id: number | string;
  username: string;
  avatarUrl?: string | null;
}

interface Comment {
  id: number | string;
  content: string;
  createdAt: string;
  parentCommentId?: number | string | null;
  user?: CommentUser;
  author?: CommentUser;
  replies?: Comment[];
}

interface RecipeCommentSectionProps {
  recipeId: number | string;
}

export function RecipeCommentSection({ recipeId }: RecipeCommentSectionProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleExpand = (commentId: number | string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [String(commentId)]: !prev[String(commentId)],
    }));
  };
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 250);
  };

  const session = auth.getSession();
  const isLoggedIn = !!session?.accessToken;
  const currentUserId = session?.user?.id;

  // Query comments with pagination
  const { data: commentsResult, isLoading, refetch } = useQuery<{
    data: Comment[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: ["recipeComments", String(recipeId), page],
    queryFn: async () => {
      const res = await socialApi.getComments(recipeId, page, limit);
      if (Array.isArray(res)) {
        return {
          data: res,
          meta: { total: res.length, page: 1, limit: 10, totalPages: 1 },
        };
      }
      return res || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    },
  });

  const comments: Comment[] = commentsResult?.data || [];
  const meta = commentsResult?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Post comment mutation
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để gửi bình luận!");
      router.push("/login");
      return;
    }

    if (!newContent.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận!");
      return;
    }

    try {
      setSubmitting(true);
      await socialApi.postComment(
        recipeId,
        newContent.trim(),
        replyingTo ? replyingTo.id : undefined
      );

      toast.success(replyingTo ? "Đã gửi phản hồi!" : "Đã đăng bình luận!");
      setNewContent("");
      setReplyingTo(null);
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["recipeComments", String(recipeId)] });
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit comment
  const handleSaveEdit = async (commentId: number | string) => {
    if (!editContent.trim()) return;
    try {
      await socialApi.updateComment(commentId, editContent.trim());
      toast.success("Đã cập nhật bình luận!");
      setEditingCommentId(null);
      queryClient.invalidateQueries({ queryKey: ["recipeComments", String(recipeId)] });
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật bình luận");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number | string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    try {
      await socialApi.deleteComment(commentId);
      toast.success("Đã xóa bình luận!");
      queryClient.invalidateQueries({ queryKey: ["recipeComments", String(recipeId)] });
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa bình luận");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const renderCommentItem = (comment: Comment, depth = 1) => {
    const currentDepth = Math.min(depth, 3);
    const commentUser = comment.user || comment.author;
    const username = commentUser?.username || "Người dùng";
    const avatarUrl = commentUser?.avatarUrl || undefined;
    const isOwner = String(commentUser?.id) === String(currentUserId);
    const isEditing = editingCommentId === comment.id;

    const containerIndent =
      currentDepth === 1
        ? "mt-6"
        : currentDepth === 2
        ? "ml-6 mt-3 pl-4 border-l-2 border-orange-200/60"
        : "ml-6 mt-3 pl-4 border-l-2 border-amber-300/80 bg-amber-50/20 rounded-r-2xl";

    return (
      <div key={comment.id} className={`flex gap-3.5 ${containerIndent}`}>
        {/* Avatar */}
        <Avatar className="w-9 h-9 border border-neutral-200 shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-xs">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Body */}
        <div className="flex-1 min-w-0 max-w-full">
          <div className="bg-neutral-50 border border-neutral-200/70 p-4 rounded-2xl relative group max-w-full overflow-hidden break-words">
            {/* Author Name & Date */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-sm text-neutral-900 truncate">
                @{username}
              </span>
              <span className="text-[11px] text-neutral-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Comment Content / Edit Form */}
            {isEditing ? (
              <div className="space-y-2 mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2.5 bg-white border border-orange-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(comment.id)}
                    className="px-3 py-1 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Lưu
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full">
                {comment.content}
              </p>
            )}

            {/* Actions: Reply, Edit, Delete */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-neutral-200/40 text-xs font-medium text-neutral-500">
                <button
                  type="button"
                  onClick={() => handleReplyClick(comment)}
                  className="hover:text-orange-600 flex items-center gap-1 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" /> Phản hồi
                </button>
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="hover:text-amber-600 flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Nested Replies with Expand / Collapse (capped at level 3) */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-1 space-y-1">
              {(() => {
                const isExpanded = !!expandedComments[String(comment.id)];
                const repliesToShow = isExpanded
                  ? comment.replies
                  : comment.replies.slice(0, 2);
                const hiddenCount = comment.replies.length - repliesToShow.length;

                return (
                  <>
                    {repliesToShow.map((reply) =>
                      renderCommentItem(reply, Math.min(currentDepth + 1, 3))
                    )}
                    {hiddenCount > 0 && (
                      <div className="ml-6 mt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(comment.id)}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1.5 py-1 px-2.5 bg-orange-50/80 rounded-lg border border-orange-200/60 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Xem thêm {hiddenCount} câu trả lời khác...
                        </button>
                      </div>
                    )}
                    {isExpanded && comment.replies.length > 2 && (
                      <div className="ml-6 mt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(comment.id)}
                          className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 py-1 px-2 hover:bg-neutral-100 rounded-lg transition-all"
                        >
                          ▲ Thu gọn câu trả lời
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const replyingUsername = replyingTo ? ((replyingTo.user || replyingTo.author)?.username || "Người dùng") : "";

  return (
    <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 my-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral-100">
        <MessageSquare className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold text-neutral-900">
          Bình luận ({meta.total})
        </h2>
      </div>

      {/* Input Form */}
      <form onSubmit={handlePostComment} className="mb-8 space-y-3">
        {replyingTo && (
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200/80 px-4 py-2 rounded-xl text-xs text-orange-800">
            <span className="flex items-center gap-1 font-medium">
              <CornerDownRight className="w-4 h-4 text-orange-500" />
              Đang phản hồi <strong>@{replyingUsername}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-orange-600 hover:text-orange-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 border border-neutral-200 shrink-0">
            <AvatarImage src={session?.user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-xs">
              {session?.user?.username ? session.user.username.slice(0, 2).toUpperCase() : "ME"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <textarea
              ref={commentInputRef}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={
                isLoggedIn
                  ? replyingTo
                    ? `Viết phản hồi cho @${replyingUsername}...`
                    : "Chia sẻ ý kiến hoặc mẹo nấu ăn của bạn cho món này..."
                  : "Đăng nhập để viết bình luận..."
              }
              rows={3}
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-neutral-400"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> {replyingTo ? "Gửi phản hồi" : "Đăng bình luận"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-10 text-neutral-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
          <p className="text-xs">Đang tải bình luận...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-2xl p-6">
          <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-600">Chưa có bình luận nào</p>
          <p className="text-xs text-neutral-400 mt-1">
            Hãy là người đầu tiên chia sẻ cảm nhận về món ăn này!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6 divide-y divide-neutral-100">
            {comments.map((comment) => renderCommentItem(comment))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-neutral-100 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200/80 disabled:opacity-40 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-700 text-neutral-700 font-semibold text-xs rounded-xl transition-all"
              >
                &larr; Trang trước
              </button>
              <span className="text-xs font-semibold text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/60">
                Trang {meta.page} / {meta.totalPages} ({meta.total} bình luận)
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="px-4 py-2 bg-neutral-100 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200/80 disabled:opacity-40 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-700 text-neutral-700 font-semibold text-xs rounded-xl transition-all"
              >
                Trang sau &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
