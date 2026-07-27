"use client";

import Image from "next/image";
import { useRef } from "react";

interface Props {
  previewUrl: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
}

export default function UploadBox({
  previewUrl,
  disabled = false,
  onFileSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  return (
    <div className="mt-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="
          w-full
          border-2
          border-dashed
          border-orange-300
          rounded-3xl
          h-56
          flex
          items-center
          justify-center
          cursor-pointer
          hover:bg-orange-50
          transition
          overflow-hidden
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Ảnh nguyên liệu"
            width={640}
            height={360}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-center px-6">
            <div className="text-6xl">🥕 🍅 🥚</div>
            <p className="mt-3 text-sm text-gray-500">
              Nhấn để chọn ảnh nguyên liệu
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
