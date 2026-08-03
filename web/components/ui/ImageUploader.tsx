'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { Camera, Trash2, Upload } from "lucide-react";
import { ImageSquare } from "@phosphor-icons/react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = 'Ảnh thành phẩm' }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    setLoading(true);
    api.images.upload(file)
      .then(({ url }) => onChange(url))
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Tải ảnh lên thất bại!');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 group max-h-64 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full max-h-64 object-cover" />
          <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="px-4 py-2 bg-white/90 text-neutral-800 rounded-xl font-medium text-sm cursor-pointer hover:bg-white shadow-md transition-all">
              <Camera className="size-4" aria-hidden="true" /> Thay ảnh khác từ thiết bị
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-4 py-2 bg-red-500/90 text-white rounded-xl font-medium text-sm hover:bg-red-600 shadow-md transition-all"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-neutral-300 hover:border-orange-500 bg-neutral-50 hover:bg-orange-50/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
            <ImageSquare size={44} weight="duotone" className="text-orange-400" aria-hidden="true" />
          </div>
          <span className="font-medium text-neutral-800 text-sm mb-1">
            {loading ? '⏳ Đang xử lý ảnh...' : 'Nhấn để chọn và tải ảnh lên từ thiết bị'}
          </span>
          <span className="text-xs text-neutral-400">Hỗ trợ PNG, JPG, WEBP, GIF (Tối đa 5MB)</span>
        </label>
      )}
    </div>
  );
}
