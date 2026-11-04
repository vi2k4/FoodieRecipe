"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChefHat as ChefHatIcon,
  Heart,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
  Moon,
  Sun,
  Search,
  Shield,
} from "lucide-react";
import { ChefHat } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, type AuthSession } from "@/lib/auth";
import { toast } from "sonner";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-flex size-10 rounded-full bg-orange-50" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-orange-400"
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Giao diện sáng" : "Giao diện tối"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setThemeMounted(true);
  }, []);

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
    setProfileMenuOpen(false);
    await auth.logout();
    toast.success("Đã đăng xuất");
    router.push("/login");
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${themeMounted && resolvedTheme === "light" ? "header-light !border-orange-100 !bg-white/80" : "border-orange-100 bg-white/80 dark:border-neutral-700 dark:bg-neutral-900/90"}`}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="brand-logo flex items-center gap-2">
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

        <nav className="hidden flex-1 items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 md:flex lg:gap-4">
          <form onSubmit={(event) => { event.preventDefault(); if (search.trim()) router.push(`/recipes?search=${encodeURIComponent(search.trim())}`); }} className="relative hidden w-full max-w-md lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm công thức..." aria-label="Tìm công thức" className="h-10 w-full rounded-full border border-orange-100 bg-orange-50/50 pl-9 pr-4 text-sm outline-none focus:border-orange-300 dark:border-neutral-700 dark:bg-neutral-800" />
          </form>
          <ThemeToggle />
          <Link
            href="/"
            className="hidden"
          >
            Trang chủ
          </Link>
          <Link
            href="/recipes"
            title="Công thức"
            aria-label="Công thức"
            className="hidden size-10 items-center justify-center rounded-full text-[0px] transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-neutral-800 dark:hover:text-orange-400 md:inline-flex"
          >
            <BookOpen className="size-5" aria-hidden="true" />
            Công thức
          </Link>
          <Link
            href="/ai-generator"
            title="Tủ lạnh AI"
            aria-label="Tủ lạnh AI"
            className="hidden size-10 items-center justify-center rounded-full text-[0px] transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-neutral-800 dark:hover:text-orange-400 md:inline-flex"
          >
            <Sparkles className="size-5" aria-hidden="true" />
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
              <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 font-medium text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-orange-400"
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
              </button>
              {profileMenuOpen && <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-orange-100 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"><Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-orange-50 dark:text-neutral-200 dark:hover:bg-neutral-800"><UserRound className="size-4" />Hồ sơ cá nhân</Link><Link href="/my-recipes" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-orange-50 dark:text-neutral-200 dark:hover:bg-neutral-800"><ChefHatIcon className="size-4" />Công thức của tôi</Link>{session.user.role === "ADMIN" && <Link href="/admin" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"><Shield className="size-4" />Quản trị Admin</Link>}<button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="size-4" />Đăng xuất</button></div>}
              </div>
              <button
                type="button"
                onClick={logout}
                className="hidden"
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
          <ThemeToggle />
          {hydrated && session && <NotificationDropdown />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-orange-400"
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
          <div className="absolute inset-x-0 top-16 z-50 border-t border-orange-100 bg-white px-4 pb-5 pt-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 md:hidden">
            <nav className="space-y-1" aria-label="Điều hướng chính">
              {[
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
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-orange-600 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-orange-400"
                    }`}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-neutral-100 pt-3">
              <div className="mb-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                <span>Giao diện</span>
                <ThemeToggle />
              </div>
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
