'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍜</span>
          <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            FoodieRecipe
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-neutral-600">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Trang chủ
          </Link>
          <Link href="/recipes" className="hover:text-orange-500 transition-colors">
            Công thức
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50/70 text-sm text-orange-900 font-medium"
          >
            <span className="text-base">👤</span>
            <span>{user?.username || 'Trang cá nhân'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
