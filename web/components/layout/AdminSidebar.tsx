"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Flag,
  Tag,
  Layers,
  ChefHat,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Công thức", href: "/admin/recipes", icon: BookOpen },
  { label: "Báo cáo", href: "/admin/reports", icon: Flag },
  { label: "Danh mục", href: "/admin/categories", icon: Layers },
  { label: "Tags", href: "/admin/tags", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col"
      style={{ width: "var(--sidebar-width)", backgroundColor: "#1c1917" }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-stone-700 px-5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <ChefHat className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">FoodiRecipe</p>
          <p className="text-xs" style={{ color: "#a78bfa" }}>
            Quản trị viên
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "text-white"
                      : "text-stone-400 hover:bg-stone-700 hover:text-white"
                  )}
                  style={
                    active
                      ? {
                          backgroundColor: "var(--primary)",
                          boxShadow: "0 2px 8px rgba(249,115,22,0.4)",
                        }
                      : {}
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Main site link */}
        <div className="mt-6 px-3">
          <Link
            href="/recipes"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-400 transition-all duration-200 hover:bg-stone-700 hover:text-white"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Về trang chính
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-stone-700 p-4">
        {currentUser && (
          <div className="flex items-center gap-3">
            {currentUser.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="h-8 w-8 rounded-full object-cover border-2"
                style={{ borderColor: "var(--primary)" }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {currentUser.username}
              </p>
              <p className="truncate text-xs text-stone-400">
                {currentUser.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
