import { env } from "./env";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string | string[] } & T;
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new ApiError(message || "Có lỗi xảy ra, vui lòng thử lại", response.status);
  }
  return data;
}

export const api = {
  recipes: {
    list: (params?: Record<string, string | number | boolean> | string) => {
      let q = '';
      if (typeof params === 'string') {
        q = params ? (params.startsWith('?') ? params : '?' + params) : '';
      } else if (params) {
        q = '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
      }
      return apiClient<any>(`/recipes${q}`);
    },
    get: (id: string | number) => apiClient<any>(`/recipes/${id}`),
    create: (body: Record<string, unknown>) =>
      apiClient<any>('/recipes', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: body?.userId ? { 'x-user-id': String(body.userId) } : undefined,
      }),
    update: (id: string | number, body: Record<string, unknown>) =>
      apiClient<any>(`/recipes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: body?.userId ? { 'x-user-id': String(body.userId) } : undefined,
      }),
    remove: (id: string | number, userId?: string | number) =>
      apiClient<any>(`/recipes/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  ingredients: {
    add: (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiClient<any>(`/recipes/${recipeId}/ingredients`, {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    update: (id: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiClient<any>(`/recipes/ingredients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    remove: (id: string | number, userId?: string | number) =>
      apiClient<any>(`/recipes/ingredients/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  steps: {
    add: (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiClient<any>(`/recipes/${recipeId}/steps`, {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    update: (id: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiClient<any>(`/recipes/steps/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    remove: (id: string | number, userId?: string | number) =>
      apiClient<any>(`/recipes/steps/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  images: {
    add: (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiClient<any>(`/recipes/${recipeId}/images`, {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    remove: (id: string | number, userId?: string | number) =>
      apiClient<any>(`/recipes/images/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  recipeTags: {
    add: (recipeId: string | number, tagId: string | number, userId?: string | number) => {
      return apiClient<any>(`/recipes/${recipeId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagId, userId }),
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      });
    },
    remove: (recipeId: string | number, tagId: string | number, userId?: string | number) =>
      apiClient<any>(`/recipes/${recipeId}/tags/${tagId}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  categories: {
    list: () => apiClient<any>('/categories'),
    get: (id: string | number) => apiClient<any>(`/categories/${id}`),
    create: (body: Record<string, unknown>) => apiClient<any>('/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string | number, body: Record<string, unknown>) => apiClient<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string | number) => apiClient<any>(`/categories/${id}`, { method: 'DELETE' }),
  },
  tags: {
    list: () => apiClient<any>('/tags'),
    create: (name: string) => apiClient<any>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),
    remove: (id: string | number) => apiClient<any>(`/tags/${id}`, { method: 'DELETE' }),
  },
};
