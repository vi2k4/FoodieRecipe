"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChefHat as ChefHatIcon,
  Heart,
  Home,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { ChefHat } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, type AuthSession } from "@/lib/auth";
import { toast } from "sonner";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      setSession(auth.getSession());
      setHydrated(true);
    };
    window.addEventListener("foodirecipe:auth-change", syncSession);
    window.addEventListener("storage", syncSession);
    auth.bootstrap().then(syncSession).catch(syncSession);
    return () => {
      window.removeEventListener("foodirecipe:auth-change", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  async function logout() {
    setMobileMenuOpen(false);
    await auth.logout();
    toast.success("Đã đăng xuất");
    router.push("/login");
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat
            size={26}
            weight="duotone"
            className="text-orange-500"
            aria-hidden="true"
          />
          <span className="bg-linear-to-r text-lg font-bold from-orange-500 to-orange-400 bg-clip-text text-transparent">
            FoodieRecipe
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-neutral-600 sm:gap-3 md:flex md:gap-4">
          <Link
            href="/"
            className="hidden transition-colors hover:text-neutral-900 md:inline"
          >
            Trang chủ
          </Link>
          <Link
            href="/recipes"
            className="hidden transition-colors hover:text-neutral-900 md:inline"
          >
            Công thức
          </Link>
          <Link
            href="/ai-generator"
            className="hidden transition-colors hover:text-neutral-900 md:inline"
          >
            Tủ lạnh AI
          </Link>
          {!hydrated ? (
            <div
              className="h-9 w-28 animate-pulse rounded-full bg-orange-50"
              aria-label="Đang tải phiên đăng nhập"
            />
          ) : session ? (
            <>
              <NotificationDropdown />
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full px-2 py-1.5 font-medium text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                <Avatar
                  size="sm"
                  className="size-8 bg-orange-100 text-xs font-bold text-orange-600"
                >
                  <AvatarImage
                    src={session.user.avatarUrl || undefined}
                    alt={session.user.username}
                  />
                  <AvatarFallback>
                    {session.user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate sm:inline">
                  {session.user.username}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Đăng xuất"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-orange-600"
              >
                <UserRound className="size-4" />
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {hydrated && session && <NotificationDropdown />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 cursor-default bg-neutral-900/20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="absolute inset-x-0 top-16 z-50 border-t border-orange-100 bg-white px-4 pb-5 pt-3 shadow-xl md:hidden">
            <nav className="space-y-1" aria-label="Điều hướng chính">
              {[
                { href: "/", label: "Trang chủ", icon: Home },
                { href: "/recipes", label: "Công thức", icon: BookOpen },
                { href: "/ai-generator", label: "Tủ lạnh AI", icon: Sparkles },
                ...(session
                  ? [
                      {
                        href: "/my-recipes",
                        label: "Công thức của tôi",
                        icon: ChefHatIcon,
                      },
                      {
                        href: "/favorites",
                        label: "Món ăn yêu thích",
                        icon: Heart,
                      },
                      {
                        href: "/profile",
                        label: "Hồ sơ cá nhân",
                        icon: UserRound,
                      },
                    ]
                  : []),
              ].map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-orange-600"
                    }`}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-neutral-100 pt-3">
              {hydrated && session ? (
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="size-5" />
                  Đăng xuất
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-3 py-3 text-sm font-semibold text-orange-600"
                  >
                    <UserRound className="size-4" />
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-orange-500 px-3 py-3 text-sm font-semibold text-white"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
