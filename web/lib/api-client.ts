import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: tự động đính kèm x-user-id từ auth store
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const authRaw = localStorage.getItem("foodie-auth");
      if (authRaw) {
        const auth = JSON.parse(authRaw);
        const currentUser = auth?.state?.currentUser;

        // Nếu đang gọi admin endpoint, phải dùng user có role ADMIN
        const url = config.url || "";
        const isAdminEndpoint =
          url.startsWith("/admin/") ||
          url === "/admin" ||
          url.startsWith("/notifications");

        if (isAdminEndpoint) {
          // Ưu tiên dùng admin user (id=1 hoặc role=ADMIN)
          if (currentUser?.role === "ADMIN") {
            config.headers["x-user-id"] = currentUser.id;
          } else {
            // Fallback: dùng admin mặc định (id=1)
            config.headers["x-user-id"] = "1";
          }
        } else {
          // Các endpoint khác: dùng user hiện tại
          if (currentUser?.id) {
            config.headers["x-user-id"] = currentUser.id;
          }
        }
      } else {
        // Chưa có auth, dùng admin mặc định cho admin endpoints
        const url = config.url || "";
        if (
          url.startsWith("/admin/") ||
          url === "/admin" ||
          url.startsWith("/notifications")
        ) {
          config.headers["x-user-id"] = "1";
        }
      }
    } catch {
      // silently ignore localStorage errors
    }
  }
  return config;
});

// Response interceptor: xử lý lỗi global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(message));
  }
);
