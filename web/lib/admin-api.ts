import { apiClient } from "./api-client";

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard() {
  const res = await apiClient.get("/admin/dashboard");
  return res.data;
}

export async function getStatistics() {
  const res = await apiClient.get("/admin/statistics");
  return res.data;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAdminUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get("/admin/users", { params });
  return res.data;
}

export async function toggleUserLock(id: string, isLocked: boolean) {
  const res = await apiClient.patch(`/admin/users/${id}`, { isLocked });
  return res.data;
}

export async function deleteAdminUser(id: string) {
  const res = await apiClient.delete(`/admin/users/${id}`);
  return res.data;
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export async function getAdminRecipes(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get("/admin/recipes", { params });
  return res.data;
}

export async function deleteAdminRecipe(id: string) {
  const res = await apiClient.delete(`/admin/recipes/${id}`);
  return res.data;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getAdminReports(status?: string) {
  const res = await apiClient.get("/admin/reports", {
    params: status ? { status } : {},
  });
  return res.data;
}

export async function handleReport(
  id: string,
  status: "RESOLVED" | "REJECTED"
) {
  const res = await apiClient.patch(`/admin/reports/${id}`, { status });
  return res.data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const res = await apiClient.get("/categories");
  return res.data;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
}) {
  const res = await apiClient.post("/admin/categories", data);
  return res.data;
}

export async function updateCategory(
  id: string,
  data: { name: string; description?: string; icon?: string }
) {
  const res = await apiClient.patch(`/admin/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await apiClient.delete(`/admin/categories/${id}`);
  return res.data;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getTags() {
  const res = await apiClient.get("/tags");
  return res.data;
}

export async function createTag(name: string) {
  const res = await apiClient.post("/admin/tags", { name });
  return res.data;
}

export async function updateTag(id: string, name: string) {
  const res = await apiClient.patch(`/admin/tags/${id}`, { name });
  return res.data;
}

export async function deleteTag(id: string) {
  const res = await apiClient.delete(`/admin/tags/${id}`);
  return res.data;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications() {
  const res = await apiClient.get("/notifications");
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await apiClient.patch("/notifications/read-all");
  return res.data;
}
