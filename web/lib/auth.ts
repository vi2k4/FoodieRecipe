import { apiClient } from "./api-client";

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
    const session = await apiClient<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.saveSession(session);
    return session;
  },
  async register(username: string, email: string, password: string) {
    return apiClient<PendingRegistration>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },
  async refresh() {
    const session = await apiClient<AuthSession>("/auth/refresh", {
      method: "POST",
    });
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
    const result = await apiClient<{ user: AuthUser }>("/auth/me", {
      headers: { Authorization: `Bearer ${current.accessToken}` },
    });
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
    const result = await apiClient<{ user: AuthUser }>("/auth/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${current.accessToken}` },
      body: JSON.stringify(data),
    });
    this.saveSession({ ...current, user: result.user });
    return result.user;
  },
  async forgotPassword(email: string) {
    return apiClient<{ message: string; developmentOtp?: string }>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  },
  async resendVerification(email: string) {
    return apiClient<{ message: string; developmentOtp?: string }>(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  },
  async verifyOtp(
    email: string,
    otp: string,
    purpose: "register" | "reset" = "register",
  ) {
    return apiClient<{ valid: boolean }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, purpose }),
    });
  },
  async resetPassword(email: string, otp: string, newPassword: string) {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },
  saveSession(session: AuthSession) {
    if (typeof window !== "undefined") {
      memorySession = session;
      window.dispatchEvent(new Event("foodirecipe:auth-change"));
    }
  },
  getSession(): AuthSession | null {
    return memorySession;
  },
  async logout() {
    if (typeof window !== "undefined") {
      await apiClient("/auth/logout", { method: "POST" }).catch(
        () => undefined,
      );
      memorySession = null;
      window.dispatchEvent(new Event("foodirecipe:auth-change"));
    }
  },
};
