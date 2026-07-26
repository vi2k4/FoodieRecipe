import { ChefHat } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải nội dung"
      className="min-h-[calc(100vh-9rem)] bg-[#fffaf5] px-5 py-10 sm:py-16"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
            <ChefHat className="size-7 animate-pulse" />
          </div>
          <Skeleton className="h-5 w-36 rounded-full bg-orange-100" />
          <Skeleton className="h-3 w-56 rounded-full bg-orange-50" />
        </div>

        <div className="grid w-full gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="aspect-[16/9] w-full rounded-3xl bg-orange-100/70" />
          <div className="flex flex-col justify-center gap-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <Skeleton className="h-4 w-24 rounded-full bg-orange-100" />
            <Skeleton className="h-9 w-4/5 rounded-lg bg-orange-100" />
            <Skeleton className="h-4 w-full rounded-full bg-orange-50" />
            <Skeleton className="h-4 w-11/12 rounded-full bg-orange-50" />
            <Skeleton className="mt-3 h-10 w-36 rounded-lg bg-orange-100" />
          </div>
        </div>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-xl bg-orange-50" />
              <Skeleton className="mt-4 h-4 w-3/4 rounded-full bg-orange-100" />
              <Skeleton className="mt-3 h-3 w-1/2 rounded-full bg-orange-50" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
