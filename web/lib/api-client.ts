import { env } from "./env";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export interface CustomRequestInit extends RequestInit {
  params?: Record<string, any>;
}

function buildUrl(path: string, params?: Record<string, any>): string {
  let url = path.startsWith("http") ? path : `${env.apiUrl}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }
  return url;
}

function getHeaders(path: string, optionsHeaders: HeadersInit = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (optionsHeaders) {
    if (optionsHeaders instanceof Headers) {
      optionsHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(optionsHeaders)) {
      optionsHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, optionsHeaders);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const authRaw = localStorage.getItem("foodie-auth");
      if (authRaw) {
        const auth = JSON.parse(authRaw);
        const currentUser = auth?.state?.currentUser;

        // Nếu đang gọi admin endpoint, phải dùng user có role ADMIN
        const isAdminEndpoint =
          path.startsWith("/admin/") ||
          path === "/admin" ||
          path.startsWith("/notifications");

        if (isAdminEndpoint) {
          // Ưu tiên dùng admin user (id=1 hoặc role=ADMIN)
          if (currentUser?.role === "ADMIN") {
            headers["x-user-id"] = String(currentUser.id);
          } else {
            // Fallback: dùng admin mặc định (id=1)
            headers["x-user-id"] = "1";
          }
        } else {
          // Các endpoint khác: dùng user hiện tại
          if (currentUser?.id) {
            headers["x-user-id"] = String(currentUser.id);
          }
        }
      } else {
        // Chưa có auth, dùng admin mặc định cho admin endpoints
        if (
          path.startsWith("/admin/") ||
          path === "/admin" ||
          path.startsWith("/notifications")
        ) {
          headers["x-user-id"] = "1";
        }
      }
    } catch {
      // silently ignore localStorage errors
    }
  }

  return headers;
}

export async function apiClient<T>(path: string, options: CustomRequestInit = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: getHeaders(path, fetchOptions.headers),
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string | string[] } & T;
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new ApiError(message || "Có lỗi xảy ra, vui lòng thử lại", response.status);
  }
  return data;
}

// Thêm các phương thức helper giống axios
apiClient.get = async function <T>(path: string, options: CustomRequestInit = {}): Promise<{ data: T }> {
  const data = await apiClient<T>(path, { ...options, method: "GET" });
  return { data };
};

apiClient.post = async function <T>(path: string, body?: any, options: CustomRequestInit = {}): Promise<{ data: T }> {
  const data = await apiClient<T>(path, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  return { data };
};

apiClient.put = async function <T>(path: string, body?: any, options: CustomRequestInit = {}): Promise<{ data: T }> {
  const data = await apiClient<T>(path, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
  return { data };
};

apiClient.patch = async function <T>(path: string, body?: any, options: CustomRequestInit = {}): Promise<{ data: T }> {
  const data = await apiClient<T>(path, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
  return { data };
};

apiClient.delete = async function <T>(path: string, options: CustomRequestInit = {}): Promise<{ data: T }> {
  const data = await apiClient<T>(path, { ...options, method: "DELETE" });
  return { data };
};
