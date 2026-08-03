/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { BowlFood, ChefHat, Sparkle } from '@phosphor-icons/react';

export default function Home() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [maxCalories, setMaxCalories] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [resRecipes, resCats] = await Promise.all([
          api.recipes.list({ isPublic: true, page: 1, limit: 6 }).catch(() => []),
          api.categories.list().catch(() => []),
        ]);
        setRecipes(Array.isArray(resRecipes) ? resRecipes : resRecipes?.data || []);
        setCategories(Array.isArray(resCats) ? resCats : []);
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100/50 -z-10" />
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-neutral-900 md:text-6xl">
            My Foodie Recipes <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              Nền tảng chia sẻ công thức nấu ăn tích hợp AI/GenAI
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600">
            Khám phá hàng ngàn công thức nấu ăn hấp dẫn, dinh dưỡng và dễ làm. Đặc biệt, trải nghiệm công nghệ AI đột phá giúp tạo công thức từ ảnh nguyên liệu của bạn.
          </p>

          {/* Quick Search Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/recipes?search=${encodeURIComponent(search)}&categoryId=${categoryId}&maxCalories=${maxCalories}`;
            }}
            className="grid grid-cols-1 gap-4 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-xl shadow-orange-500/5 sm:grid-cols-2 lg:grid-cols-12"
          >
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên món ăn (vd: Phở bò)..." 
              className="min-w-0 rounded-xl border border-neutral-200 px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:col-span-2 lg:col-span-5"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="min-w-0 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500 lg:col-span-3"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={String(cat.id)} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex min-w-0 items-center gap-2 px-2 lg:col-span-2">
              <span className="text-sm text-neutral-500 whitespace-nowrap">Max Calo:</span>
              <input 
                type="number"
                value={maxCalories}
                onChange={(e) => setMaxCalories(e.target.value)}
                placeholder="500" 
                className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500" 
              />
            </div>
            <button 
              type="submit"
              className="flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-orange-500 px-5 py-3 font-medium text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600 lg:col-span-2"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Featured Recipes Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Công thức mới từ Database</h2>
            <p className="text-neutral-500 text-sm">Các công thức tươi ngon cập nhật từ cộng đồng</p>
          </div>
          <Link href="/recipes" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            Xem tất cả <span>&rarr;</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-100">
            <div className="text-3xl mb-2 animate-bounce">⏳</div>
            <p>Đang tải dữ liệu từ Database...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-100">
            <BowlFood size={52} weight="duotone" className="mx-auto mb-2 text-orange-400" aria-label="No image" />
            <p>Chưa có công thức nào. Hãy đóng góp công thức đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={String(recipe.id)} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={recipe.thumbnail || "/file.svg"} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-orange-600">
                    {recipe.difficulty === 'EASY' ? 'Dễ' : recipe.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                    <span className="flex items-center gap-1">{recipe.calories || '—'} kcal</span>
                    <span className="flex items-center gap-1">⏱️ {recipe.cookTime || '—'} ph</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-4 border-t border-neutral-100">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs">
                      {recipe.source === 'AI GenAI' || recipe.source === 'AI' ? (
                        <Sparkle size={16} weight="duotone" aria-label="AI generated" />
                      ) : (
                        <ChefHat size={16} weight="duotone" aria-label="Chef recipe" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 truncate">{recipe.author?.username || 'Ẩn danh'}</span>
                    {recipe.source === 'AI GenAI' || recipe.source === 'AI' ? (
                      <span className="ml-auto text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-md">
                        AI GenAI
                      </span>
                    ) : (
                      <span className="ml-auto text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md border border-neutral-200">
                        USER
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
