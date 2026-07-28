"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

interface Props {
  recipeId: string | number;
}

export default function UpdateButton({ recipeId }: Props) {
  return (
    <div className="mt-10">
      <Link
        href={`/recipes/${recipeId}/edit`}
        className="
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-orange-500
        py-4
        text-lg
        font-semibold
        text-white
        transition
        hover:bg-orange-600
        hover:shadow-lg hover:shadow-orange-500/25
        "
      >
        <Pencil size={20} />
        Update Recipe
      </Link>
    </div>
  );
}
