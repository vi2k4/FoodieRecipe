import { RecipeGridSkeleton } from "@/components/ui/loading-skeletons";

export default function LoadingPage() {
  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[#fffaf5] px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="h-8 w-2/5 animate-pulse rounded bg-orange-100" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-orange-50" />
        </div>
        <RecipeGridSkeleton />
      </div>
    </main>
  );
}
