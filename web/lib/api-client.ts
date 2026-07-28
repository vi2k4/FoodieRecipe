/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import { env } from "./env";

let accessToken: string | null = null;

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** Axios instance dùng chung cho toàn bộ frontend. */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const message = error.response?.data?.message;
    const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
    throw new ApiError(normalizedMessage || "Có lỗi xảy ra, vui lòng thử lại", error.response?.status);
  },
);

export const api = {
  searchHistory: {
    list: async (limit = 10) => {
      const { data } = await apiClient.get<SearchHistoryEntry[]>(
        "/search-history",
        { params: { limit } },
      );
      return data;
    },
    create: async (keyword: string) => {
      const { data } = await apiClient.post<SearchHistoryEntry>(
        "/search-history",
        { keyword },
      );
      return data;
    },
    remove: async (id: string | number) => {
      const { data } = await apiClient.delete<{ success: boolean }>(
        `/search-history/${id}`,
      );
      return data;
    },
    clear: async () => {
      const { data } = await apiClient.delete<{
        success: boolean;
        deletedCount: number;
      }>("/search-history");
      return data;
    },
  },
  recipes: {
    list: async (params?: Record<string, any> | string) => {
      if (typeof params === 'string') {
        const { data } = await apiClient.get<any>(`/recipes${params ? (params.startsWith('?') ? params : '?' + params) : ''}`);
        return data;
      }
      const { data } = await apiClient.get<any>('/recipes', { params });
      return data;
    },
    mine: async (params?: Record<string, any>) => {
      const { data } = await apiClient.get<any>('/recipes/mine', { params });
      return data;
    },
    get: async (id: string | number) => {
      const { data } = await apiClient.get<any>(`/recipes/${id}`);
      return data;
    },
    create: async (body: Record<string, unknown>) => {
      const headers = body?.userId ? { 'x-user-id': String(body.userId) } : undefined;
      const { data } = await apiClient.post<any>('/recipes', body, { headers });
      return data;
    },
    update: async (id: string | number, body: Record<string, unknown>) => {
      const headers = body?.userId ? { 'x-user-id': String(body.userId) } : undefined;
      const { data } = await apiClient.patch<any>(`/recipes/${id}`, body, { headers });
      return data;
    },
    remove: async (id: string | number, userId?: string | number) => {
      const headers = userId ? { 'x-user-id': String(userId) } : undefined;
      const { data } = await apiClient.delete<any>(`/recipes/${id}`, { headers });
      return data;
    },
  },
  ingredients: {
    add: async (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      const headers = uid ? { 'x-user-id': String(uid) } : undefined;
      const { data } = await apiClient.post<any>(`/recipes/${recipeId}/ingredients`, { ...body, userId: uid }, { headers });
      return data;
    },
    update: async (id: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      const headers = uid ? { 'x-user-id': String(uid) } : undefined;
      const { data } = await apiClient.patch<any>(`/recipes/ingredients/${id}`, { ...body, userId: uid }, { headers });
      return data;
    },
    remove: async (id: string | number, userId?: string | number) => {
      const headers = userId ? { 'x-user-id': String(userId) } : undefined;
      const { data } = await apiClient.delete<any>(`/recipes/ingredients/${id}`, { headers });
      return data;
    },
  },
  steps: {
    add: async (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      const headers = uid ? { 'x-user-id': String(uid) } : undefined;
      const { data } = await apiClient.post<any>(`/recipes/${recipeId}/steps`, { ...body, userId: uid }, { headers });
      return data;
    },
    update: async (id: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      const headers = uid ? { 'x-user-id': String(uid) } : undefined;
      const { data } = await apiClient.patch<any>(`/recipes/steps/${id}`, { ...body, userId: uid }, { headers });
      return data;
    },
    remove: async (id: string | number, userId?: string | number) => {
      const headers = userId ? { 'x-user-id': String(userId) } : undefined;
      const { data } = await apiClient.delete<any>(`/recipes/steps/${id}`, { headers });
      return data;
    },
  },
  images: {
    add: async (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      const headers = uid ? { 'x-user-id': String(uid) } : undefined;
      const { data } = await apiClient.post<any>(`/recipes/${recipeId}/images`, { ...body, userId: uid }, { headers });
      return data;
    },
    remove: async (id: string | number, userId?: string | number) => {
      const headers = userId ? { 'x-user-id': String(userId) } : undefined;
      const { data } = await apiClient.delete<any>(`/recipes/images/${id}`, { headers });
      return data;
    },
  },
  recipeTags: {
    add: async (recipeId: string | number, tagId: string | number, userId?: string | number) => {
      const headers = userId ? { 'x-user-id': String(userId) } : undefined;
      const { data } = await apiClient.post<any>(`/recipes/${recipeId}/tags`, { tagId, userId }, { headers });
      return data;
    },
    remove: async (recipeId: string | number, tagId: string | number, userId?: string | number) => {
      const headers = userId ? { 'x-user-id': String(userId) } : undefined;
      const { data } = await apiClient.delete<any>(`/recipes/${recipeId}/tags/${tagId}`, { headers });
      return data;
    },
  },
  categories: {
    list: async () => {
      const { data } = await apiClient.get<any>('/categories');
      return data;
    },
    get: async (id: string | number) => {
      const { data } = await apiClient.get<any>(`/categories/${id}`);
      return data;
    },
    create: async (body: Record<string, unknown>) => {
      const { data } = await apiClient.post<any>('/categories', body);
      return data;
    },
    update: async (id: string | number, body: Record<string, unknown>) => {
      const { data } = await apiClient.post<any>(`/categories/${id}`, body);
      return data;
    },
    remove: async (id: string | number) => {
      const { data } = await apiClient.delete<any>(`/categories/${id}`);
      return data;
    },
  },
  tags: {
    list: async () => {
      const { data } = await apiClient.get<any>('/tags');
      return data;
    },
    create: async (name: string) => {
      const { data } = await apiClient.post<any>('/tags', { name });
      return data;
    },
    remove: async (id: string | number) => {
      const { data } = await apiClient.delete<any>(`/tags/${id}`);
      return data;
    },
  },
};

export interface SearchHistoryEntry {
  id: string;
  userId: string | null;
  keyword: string;
  createdAt: string;
}
