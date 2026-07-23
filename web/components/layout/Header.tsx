"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, type AuthSession } from "@/lib/auth";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍜</span>
          <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            FoodieRecipe
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-neutral-600">
          <Link
            href="/"
            className="transition-colors hover:text-neutral-900"
          >
            Trang chủ
          </Link>
          <Link
            href="/recipes"
            className="transition-colors hover:text-neutral-900"
          >
            Công thức
          </Link>
          {!hydrated ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-orange-50" aria-label="Đang tải phiên đăng nhập" />
          ) : session ? (
            <>
              <div className="flex items-center gap-2 rounded-full px-2 py-1.5 font-medium text-neutral-700 transition-colors">
                <Avatar className="size-8 bg-orange-100 text-xs font-bold text-orange-600">
                  <AvatarImage src={session.user.avatarUrl || undefined} alt={session.user.username} />
                  <AvatarFallback>{session.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate sm:inline">{session.user.username}</span>
              </div>
              <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Đăng xuất">
                <LogOut className="size-4" /><span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 transition-colors hover:text-orange-600"><UserRound className="size-4" />Đăng nhập</Link>
              <Link href="/register" className="rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
