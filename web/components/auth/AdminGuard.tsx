"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    auth.bootstrap().then((session) => {
      if (!mounted) return;
      if (!session || session.user.role !== "ADMIN") {
        router.replace("/login");
        return;
      }
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#1c1917]">
        <div className="flex flex-col items-center gap-3 text-stone-200">
          <Loader2 className="size-8 animate-spin text-orange-500" />
          <p className="text-sm font-medium">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return children;
}
