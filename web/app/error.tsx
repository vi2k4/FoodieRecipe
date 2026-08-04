"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Runtime Error:", error);
  }, [error]);

  return (
    <div className="p-8 text-center bg-red-50 min-h-[50vh] flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">Đã xảy ra lỗi hệ thống</h2>
      <p className="text-sm text-neutral-700 mb-4 max-w-md bg-white p-4 rounded-xl border border-red-200 font-mono text-left overflow-auto">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg text-sm hover:bg-orange-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
