"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { ContentSkeleton } from "@/components/ui/loading-skeletons";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    auth.bootstrap().then((session) => {
      if (!mounted) return;
      if (!session || session.user.role !== "ADMIN") {
        router.replace("/404");
        return;
      }
      setReady(true);
    }).catch(() => router.replace("/404"));
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return <div className="mx-auto min-h-screen max-w-3xl px-6 py-16"><ContentSkeleton /></div>;
  }

  return children;
}
