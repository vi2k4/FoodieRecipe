'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

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
          api.recipes.list({ limit: 6 }).catch(() => []),
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
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-6 leading-tight">
            My Foodie Recipes <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              Nền tảng chia sẻ công thức nấu ăn tích hợp AI/GenAI
            </span>
          </h1>
          <p className="text-lg text-neutral-600 mb-10 max-w-2xl mx-auto">
            Khám phá hàng ngàn công thức nấu ăn hấp dẫn, dinh dưỡng và dễ làm. Đặc biệt, trải nghiệm công nghệ AI đột phá giúp tạo công thức từ ảnh nguyên liệu của bạn.
          </p>

          {/* Quick Search Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/recipes?search=${encodeURIComponent(search)}&categoryId=${categoryId}&maxCalories=${maxCalories}`;
            }}
            className="bg-white p-4 rounded-2xl shadow-xl shadow-orange-500/5 border border-orange-100 flex flex-col md:flex-row gap-4 text-left"
          >
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên món ăn (vd: Phở bò)..." 
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 bg-white"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={String(cat.id)} value={String(cat.id)}>
                  {cat.icon || '📂'} {cat.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm text-neutral-500 whitespace-nowrap">Max Calo:</span>
              <input 
                type="number"
                value={maxCalories}
                onChange={(e) => setMaxCalories(e.target.value)}
                placeholder="500" 
                className="w-24 px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900" 
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors whitespace-nowrap flex items-center justify-center shadow-lg shadow-orange-500/20"
            >
              🔍 Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Featured Recipes Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">🔥 Công thức mới từ Database</h2>
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
            <div className="text-4xl mb-2">🍲</div>
            <p>Chưa có công thức nào. Hãy đóng góp công thức đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={String(recipe.id)} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={recipe.thumbnail || `https://picsum.photos/seed/${recipe.id}/600/400`} 
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
                    <span className="flex items-center gap-1">🔥 {recipe.calories || '—'} kcal</span>
                    <span className="flex items-center gap-1">⏱️ {recipe.cookTime || '—'} ph</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-4 border-t border-neutral-100">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs">
                      {recipe.source === 'AI GenAI' || recipe.source === 'AI' ? '🤖' : '👨‍🍳'}
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
