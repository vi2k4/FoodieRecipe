"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { BowlFood } from "@phosphor-icons/react";

interface Props {
  image?: string;
  title?: string;
}

export default function RecipeHeader({ image, title }: Props) {
  return (
    <>
      <Link
        href="/my-recipes"
        className="mb-6 inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Quay lại công thức của tôi
      </Link>

      <div className="overflow-hidden rounded-3xl shadow-md dark:ring-1 dark:ring-orange-900">
        <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/60 dark:to-stone-900">
          {image ? (
            <Image
              src={image}
              fill
              alt={title || "Recipe image"}
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BowlFood size={64} weight="duotone" className="text-orange-400" aria-hidden="true" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {title && (
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                {title}
              </h1>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
