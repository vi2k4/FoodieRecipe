import { ClipboardList } from "lucide-react";
import { RecipeStep } from "@/types/recipe";

interface Props { steps?: RecipeStep[]; }

export default function InstructionList({ steps = [] }: Props) {
  const heading = <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="size-6 text-orange-500" aria-hidden="true" /> Các bước thực hiện</h2>;
  return (
    <section className="mt-10 rounded-2xl border border-orange-100 bg-white p-8 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
      {heading}
      {!steps.length ? <p className="mt-4 text-gray-500">Chưa có hướng dẫn thực hiện.</p> : (
        <div className="mt-8 space-y-6">{[...steps].sort((a, b) => a.stepNumber - b.stepNumber).map((step) => (
          <div key={String(step.id)} className="flex gap-5 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-bold group-hover:bg-orange-600 transition-colors">{step.stepNumber}</div>
            <p className="pt-1.5 leading-7 text-gray-700 dark:text-stone-200">{step.content}</p>
          </div>
        ))}</div>
      )}
    </section>
  );
}
