"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat } from '@phosphor-icons/react';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <footer className="bg-neutral-950 text-neutral-400 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <ChefHat size={30} weight="duotone" className="text-orange-500" aria-hidden="true" />
            <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              FoodieRecipe
            </span>
          </Link>
          <p className="text-sm max-w-sm mb-6 leading-relaxed">
            Nền tảng chia sẻ công thức nấu ăn tích hợp AI/GenAI đột phá. Khám phá hàng ngàn công thức nấu ăn hấp dẫn mỗi ngày.
          </p>
        </div>
        
        <div>
          <h3 className="text-white font-medium mb-4">Khám phá</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/recipes" className="hover:text-orange-400 transition-colors">
                Danh sách công thức
              </Link>
            </li>
            <li>
              <Link href="/recipes/create" className="hover:text-orange-400 transition-colors">
                Đóng góp công thức
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-medium mb-4">Hệ thống</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/login" className="hover:text-orange-400 transition-colors">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-orange-400 transition-colors">
                Đăng ký
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-neutral-800 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} FoodieRecipe. All rights reserved.</p>
      </div>
    </footer>
  );
}
