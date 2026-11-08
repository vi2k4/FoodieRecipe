"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { ContentSkeleton } from "@/components/ui/loading-skeletons";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    auth.bootstrap().then((session) => {
      if (!mounted) return;
      if (session) {
        router.replace("/");
        return;
      }
      setReady(true);
    });
    return () => { mounted = false; };
  }, [router]);

  if (!ready) {
    return <div className="mx-auto min-h-[calc(100vh-9rem)] max-w-3xl px-6 py-16"><ContentSkeleton /></div>;
  }
  return children;
}
