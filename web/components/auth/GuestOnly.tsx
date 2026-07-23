"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";

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
    return <div className="grid min-h-[calc(100vh-9rem)] place-items-center bg-[#fffaf5]"><Loader2 className="size-7 animate-spin text-orange-500" /></div>;
  }
  return children;
}
