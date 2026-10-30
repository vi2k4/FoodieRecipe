/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { BowlFood } from '@phosphor-icons/react';
import { Eye, ThumbsUp, Flame, Clock } from 'lucide-react';
import { LikeButton } from '@/components/recipes/LikeButton';
import { HeroSlider } from '@/components/home/HeroSlider';
import { RecipeSection } from '@/components/home/RecipeSection';

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
          api.recipes.list({ isPublic: true, page: 1, limit: 30 }).catch(() => []),
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

  const mostViewed = [...recipes].sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0)).slice(0, 6);
  const mostLiked = [...recipes].sort((a, b) => Number(b.likeCount || b._count?.likes || 0) - Number(a.likeCount || a._count?.likes || 0)).slice(0, 6);
  const topRated = [...recipes].sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0)).slice(0, 6);

  return (
    <div className="flex flex-col gap-12 pb-16">
      <HeroSlider />
      {/* Hero Section */}
      <section className="relative px-4 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100/50 -z-10" />
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="hidden">
            My Foodie Recipes <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              Nền tảng chia sẻ công thức nấu ăn tích hợp AI/GenAI
            </span>
          </h1>
          <p className="hidden">
            Khám phá hàng ngàn công thức nấu ăn hấp dẫn, dinh dưỡng và dễ làm. Đặc biệt, trải nghiệm công nghệ AI đột phá giúp tạo công thức từ ảnh nguyên liệu của bạn.
          </p>

          <p className="mb-4 whitespace-nowrap text-center text-xs font-bold tracking-wide text-orange-700 sm:text-base">
            Khám phá hàng ngàn công thức · Lọc theo nguyên liệu · danh mục · độ khó · lượng calo
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
          >
            Tìm kiếm nâng cao
          </Link>

          {/* Quick Search Box is kept disabled in the source for backwards compatibility. */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/recipes?search=${encodeURIComponent(search)}&categoryId=${categoryId}&maxCalories=${maxCalories}`;
            }}
            className="hidden"
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
            <h2 className="text-2xl font-bold text-neutral-900">Công thức mới nhất</h2>
            <p className="text-neutral-500 text-sm">Các công thức tươi ngon cập nhật từ cộng đồng</p>
          </div>
          <Link href="/recipes" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            Xem tất cả <span>&rarr;</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-100">
            <div className="text-3xl mb-2 animate-bounce">⏳</div>
            <p>Đang tải các công thức mới nhất...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-100">
            <BowlFood size={52} weight="duotone" className="mx-auto mb-2 text-orange-400" aria-label="No image" />
            <p>Chưa có công thức nào. Hãy đóng góp công thức đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {recipes.slice(0, 6).map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={String(recipe.id)} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                <div className="relative h-32 overflow-hidden bg-neutral-100 sm:h-48">
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
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <h3 className="mb-2 line-clamp-2 text-sm font-bold text-neutral-900 transition-colors group-hover:text-orange-500 sm:text-lg">{recipe.title}</h3>
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 sm:gap-3 sm:text-xs">
                    <span className="flex items-center gap-1 font-medium"><Flame className="w-3.5 h-3.5 text-orange-500" /> {recipe.calories || '—'} kcal</span>
                    <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-neutral-400" /> {recipe.cookTime || '—'} ph</span>
                    <span className="flex items-center gap-1 text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      {Number(recipe.viewCount || 0)} xem
                    </span>
                    <LikeButton
                      recipeId={recipe.id}
                      initialCount={Number(recipe.likeCount ?? recipe._count?.likes ?? 0)}
                    />
                  </div>
                  <div className="mt-auto flex items-center gap-2 border-t border-neutral-100 pt-3 sm:pt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.author?.avatarUrl || "/file.svg"}
                      alt={recipe.author?.username || "Ẩn danh"}
                      className="h-6 w-6 shrink-0 rounded-full border border-neutral-200 object-cover"
                    />
                    <span className="truncate text-xs font-medium text-neutral-700 sm:text-sm">
                      {recipe.author?.username || 'Ẩn danh'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <RecipeSection title="Xem nhiều nhất" description="Những công thức đang được cộng đồng quan tâm" recipes={mostViewed} />
      <RecipeSection title="Được yêu thích" description="Các món ăn nhận nhiều lượt thích" recipes={mostLiked} />
      <RecipeSection title="Đang hot" description="Công thức nổi bật dựa trên lượt xem, thích và đánh giá" recipes={topRated} />
    </div>
  );
}
