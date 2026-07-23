"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MockUser = {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  avatarUrl?: string;
  bio?: string;
};

export const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    username: "dung_admin",
    email: "dung@foodie.com",
    role: "ADMIN",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    bio: "Quản trị viên hệ thống FoodiRecipe.",
  },
  {
    id: "2",
    username: "hoang_chef",
    email: "hoang@chef.com",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    bio: "Đam mê ẩm thực truyền thống Việt Nam.",
  },
  {
    id: "3",
    username: "lan_anh",
    email: "lananh@food.com",
    role: "USER",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    bio: "Yêu thích làm bánh và các món ăn ngọt.",
  },
];

type AuthStore = {
  currentUser: MockUser | null;
  setCurrentUser: (user: MockUser | null) => void;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: MOCK_USERS[0], // default: Admin Dũng
      setCurrentUser: (user) => set({ currentUser: user }),
      isAdmin: () => get().currentUser?.role === "ADMIN",
    }),
    { name: "foodie-auth" }
  )
);
