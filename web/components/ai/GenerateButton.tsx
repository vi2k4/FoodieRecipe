"use client";

import LoadingSpinner from "./LoadingSpinner";

interface Props {
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function GenerateButton({
  loading,
  disabled = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="
        mt-6
        w-full
        rounded-full
        bg-orange-600
        py-4
        text-white
        font-semibold
        hover:bg-orange-700
        transition
        disabled:opacity-60
        disabled:cursor-not-allowed
        flex
        items-center
        justify-center
        gap-2
      "
    >
      {loading && <LoadingSpinner />}
      {loading ? "AI đang sáng tạo công thức..." : "Tạo công thức bằng AI"}
    </button>
  );
}
