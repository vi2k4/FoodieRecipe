"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChefHat, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-9rem)] place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-100/50 md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-orange-500 p-10 text-white md:block">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-orange-400/50" />
          <div className="absolute -bottom-20 -left-16 size-56 rounded-full bg-orange-600/40" />
          <div className="relative flex h-full flex-col justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <ChefHat className="size-7" /> FoodiRecipe
            </Link>
            <div>
              <Sparkles className="mb-5 size-9 text-orange-100" />
              <h2 className="max-w-sm text-3xl font-extrabold leading-tight">Nấu ngon hơn, chia sẻ dễ hơn.</h2>
              <p className="mt-4 max-w-sm text-orange-100">Lưu công thức yêu thích và khám phá cảm hứng bếp núc mỗi ngày.</p>
            </div>
            <p className="text-sm text-orange-100">Cộng đồng dành cho những người yêu món ngon.</p>
          </div>
        </div>
        <Card className="rounded-none border-0 shadow-none">
          <CardHeader className="px-6 pt-8 sm:px-10 sm:pt-12">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 sm:px-10 sm:pb-12">
            {children}
            {footer && <div className="mt-6 text-center text-sm text-stone-500">{footer}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
