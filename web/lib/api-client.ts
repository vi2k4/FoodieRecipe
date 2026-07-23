const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
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
      return apiFetch<any>(`/recipes${q}`);
    },
    get: (id: string | number) => apiFetch<any>(`/recipes/${id}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<any>('/recipes', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: body?.userId ? { 'x-user-id': String(body.userId) } : undefined,
      }),
    update: (id: string | number, body: Record<string, unknown>) =>
      apiFetch<any>(`/recipes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: body?.userId ? { 'x-user-id': String(body.userId) } : undefined,
      }),
    remove: (id: string | number, userId?: string | number) =>
      apiFetch<any>(`/recipes/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  ingredients: {
    add: (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiFetch<any>(`/recipes/${recipeId}/ingredients`, {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    update: (id: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiFetch<any>(`/recipes/ingredients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    remove: (id: string | number, userId?: string | number) =>
      apiFetch<any>(`/recipes/ingredients/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  steps: {
    add: (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiFetch<any>(`/recipes/${recipeId}/steps`, {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    update: (id: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiFetch<any>(`/recipes/steps/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    remove: (id: string | number, userId?: string | number) =>
      apiFetch<any>(`/recipes/steps/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  images: {
    add: (recipeId: string | number, body: Record<string, unknown>, userId?: string | number) => {
      const uid = userId || body?.userId;
      return apiFetch<any>(`/recipes/${recipeId}/images`, {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: uid }),
        headers: uid ? { 'x-user-id': String(uid) } : undefined,
      });
    },
    remove: (id: string | number, userId?: string | number) =>
      apiFetch<any>(`/recipes/images/${id}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  recipeTags: {
    add: (recipeId: string | number, tagId: string | number, userId?: string | number) => {
      return apiFetch<any>(`/recipes/${recipeId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagId, userId }),
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      });
    },
    remove: (recipeId: string | number, tagId: string | number, userId?: string | number) =>
      apiFetch<any>(`/recipes/${recipeId}/tags/${tagId}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': String(userId) } : undefined,
      }),
  },
  categories: {
    list: () => apiFetch<any>('/categories'),
    get: (id: string | number) => apiFetch<any>(`/categories/${id}`),
    create: (body: Record<string, unknown>) => apiFetch<any>('/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string | number, body: Record<string, unknown>) => apiFetch<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string | number) => apiFetch<any>(`/categories/${id}`, { method: 'DELETE' }),
  },
  tags: {
    list: () => apiFetch<any>('/tags'),
    create: (name: string) => apiFetch<any>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),
    remove: (id: string | number) => apiFetch<any>(`/tags/${id}`, { method: 'DELETE' }),
  },
};

export const apiClient = api;
