import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminGuard } from "@/components/auth/AdminGuard";

export const metadata = {
  title: "FoodiRecipe Admin",
  description: "Khu vực quản trị FoodiRecipe",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <AdminSidebar />
        <main
          className="flex min-w-0 flex-1 flex-col"
          style={{ marginLeft: "var(--sidebar-width)" }}
        >
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
