"use client";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-900">
        <main className="max-w-md space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-neutral-600">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
