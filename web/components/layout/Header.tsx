"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, UserRound, Heart } from "lucide-react";
import { ChefHat } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, type AuthSession } from "@/lib/auth";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

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
    await auth.logout();
    toast.success("Đã đăng xuất");
    router.push("/login");
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat size={26} weight="duotone" className="text-orange-500" aria-hidden="true" />
          <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            FoodieRecipe
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-neutral-600">
          <Link href="/" className="transition-colors hover:text-neutral-900">
            Trang chủ
          </Link>
          <Link
            href="/recipes"
            className="transition-colors hover:text-neutral-900"
          >
            Công thức
          </Link>
          <Link
            href="/ai-generator"
            className="transition-colors hover:text-neutral-900"
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
      </div>
    </header>
  );
}
