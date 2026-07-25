import { apiClient, setAccessToken } from "./api-client";
import { useAuthStore } from "@/stores/auth.store";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isVerified: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
};

export type PendingRegistration = {
  pendingVerification: true;
  email: string;
  message: string;
  developmentOtp?: string;
};

let memorySession: AuthSession | null = null;
let bootstrapPromise: Promise<AuthSession | null> | null = null;

export const auth = {
  async login(email: string, password: string) {
    const { data: session } = await apiClient.post<AuthSession>("/auth/login", { email, password });
    this.saveSession(session);
    return session;
  },
  async register(username: string, email: string, password: string) {
    const { data } = await apiClient.post<PendingRegistration>("/auth/register", { username, email, password });
    return data;
  },
  async refresh() {
    const { data: session } = await apiClient.post<AuthSession>("/auth/refresh");
    this.saveSession(session);
    return session;
  },
  async bootstrap() {
    if (typeof window !== "undefined")
      localStorage.removeItem("foodirecipe.session");
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = this.refresh()
      .catch(() => {
        memorySession = null;
        setAccessToken(null);
        if (typeof window !== "undefined") {
          useAuthStore.getState().setCurrentUser(null);
        }
        return null;
      })
      .finally(() => {
        bootstrapPromise = null;
      });
    return bootstrapPromise;
  },
  async getProfile() {
    const current = this.getSession();
    if (!current?.accessToken) return null;
    const { data: result } = await apiClient.get<{ user: AuthUser }>("/auth/me");
    return result.user;
  },
  async updateProfile(data: {
    username: string;
    bio: string;
    avatarUrl: string;
  }) {
    const current = this.getSession();
    if (!current?.accessToken)
      throw new Error("Bạn cần đăng nhập để cập nhật hồ sơ");
    const { data: result } = await apiClient.patch<{ user: AuthUser }>("/auth/me", data);
    this.saveSession({ ...current, user: result.user });
    return result.user;
  },
  async forgotPassword(email: string) {
    const { data } = await apiClient.post<{ message: string; developmentOtp?: string }>("/auth/forgot-password", { email });
    return data;
  },
  async resendVerification(email: string) {
    const { data } = await apiClient.post<{ message: string; developmentOtp?: string }>("/auth/resend-verification", { email });
    return data;
  },
  async verifyOtp(
    email: string,
    otp: string,
    purpose: "register" | "reset" = "register",
  ) {
    const { data } = await apiClient.post<{ valid: boolean }>("/auth/verify-otp", { email, otp, purpose });
    return data;
  },
  async resetPassword(email: string, otp: string, newPassword: string) {
    const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", { email, otp, newPassword });
    return data;
  },
  saveSession(session: AuthSession) {
    if (typeof window !== "undefined") {
      memorySession = session;
      setAccessToken(session.accessToken);
      useAuthStore.getState().setCurrentUser(session.user);
      window.dispatchEvent(new Event("foodirecipe:auth-change"));
    }
  },
  getSession(): AuthSession | null {
    return memorySession;
  },
  async logout() {
    if (typeof window !== "undefined") {
      await apiClient.post("/auth/logout").catch(() => undefined);
      memorySession = null;
      setAccessToken(null);
      useAuthStore.getState().setCurrentUser(null);
      window.dispatchEvent(new Event("foodirecipe:auth-change"));
    }
  },
};
