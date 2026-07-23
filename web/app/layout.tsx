import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodiRecipe",
  description: "Recipe discovery and management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
