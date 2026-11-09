import AIRecipeCard from "@/components/ai/AIRecipeCard";

export default function AiGeneratorPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[#fffaf5] px-4 py-8 text-stone-900 sm:items-center sm:p-10 dark:bg-[#171311] dark:text-stone-100">
      <AIRecipeCard />
    </main>
  );
}
