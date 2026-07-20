import Link from "next/link";
import { ChefHat, Home, Search, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-9rem)] items-center justify-center overflow-hidden bg-[#fffaf5] px-5 py-16">
      <div className="absolute -left-28 top-10 -z-10 size-72 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="absolute -right-20 bottom-0 -z-10 size-80 rounded-full bg-yellow-100/80 blur-3xl" />

      <Card className="w-full max-w-2xl border-orange-100 bg-white/90 shadow-xl shadow-orange-100/40 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="relative mb-7 flex size-28 items-center justify-center rounded-[2rem] bg-orange-50 text-orange-500 ring-8 ring-orange-50/60">
            <Utensils className="absolute -bottom-2 -right-3 size-9 -rotate-12 rounded-full bg-white p-2 shadow-sm" />
            <ChefHat className="size-14" strokeWidth={1.6} />
          </div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
            404 · Không tìm thấy
          </p>
          <h1 className="max-w-lg text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            Món này chưa có trong thực đơn
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-stone-500">
            Có vẻ đường dẫn bạn truy cập đã bị đổi, hoặc công thức này không còn
            tồn tại. Hãy quay về bếp và khám phá món mới nhé.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 text-sm font-medium text-white transition-colors hover:bg-orange-600"><Home className="size-4" />Về trang chủ</Link>
            <Link href="/recipes" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-orange-200 px-6 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"><Search className="size-4" />Khám phá công thức</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
