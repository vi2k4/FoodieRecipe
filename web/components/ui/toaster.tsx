"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      richColors
      expand
      toastOptions={{
        classNames: {
          toast: "font-sans border-orange-100 shadow-lg shadow-orange-100/40",
          title: "font-semibold",
          description: "text-stone-500",
          success: "bg-green-50 text-green-800 border-green-200",
          error: "bg-red-50 text-red-800 border-red-200",
          warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
        },
      }}
    />
  );
}
