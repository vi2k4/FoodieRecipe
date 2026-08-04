/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { BowlFood, ChefHat, Sparkle } from '@phosphor-icons/react';
import { Eye, ThumbsUp, Flame, Clock } from 'lucide-react';
import { FavoriteButton } from '@/components/recipes/FavoriteButton';
import { LikeButton } from '@/components/recipes/LikeButton';

export default function RecipesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [recipes, setRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [maxCookTime, setMaxCookTime] = useState('');

  const loadRecipes = async (
    targetPage = page,
    overrideFilters?: { search?: string; categoryId?: string; difficulty?: string; maxCalories?: string; maxCookTime?: string }
  ) => {
    setLoading(true);
    try {
      const activeSearch = overrideFilters?.search !== undefined ? overrideFilters.search : search;
      const activeCat = overrideFilters?.categoryId !== undefined ? overrideFilters.categoryId : categoryId;
      const activeDiff = overrideFilters?.difficulty !== undefined ? overrideFilters.difficulty : difficulty;
      const activeMaxCal = overrideFilters?.maxCalories !== undefined ? overrideFilters.maxCalories : maxCalories;
      const activeMaxCook = overrideFilters?.maxCookTime !== undefined ? overrideFilters.maxCookTime : maxCookTime;

      const params: Record<string, string | number | boolean> = {
        isPublic: true,
        page: targetPage,
        limit: limit,
      };

      if (activeSearch.trim()) params.search = activeSearch.trim();
      if (activeCat) params.categoryId = Number(activeCat);
      if (activeDiff) params.difficulty = activeDiff;

      const res = await api.recipes.list(params);
      
      let list = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.total !== undefined ? res.total : list.length;

      // Filter maxCalories / maxCookTime on client side if provided
      if (activeMaxCal) {
        list = list.filter((r: any) => !r.calories || Number(r.calories) <= Number(activeMaxCal));
      }
      if (activeMaxCook) {
        list = list.filter((r: any) => !r.cookTime || Number(r.cookTime) <= Number(activeMaxCook));
      }

      setRecipes(list);
      setTotal(totalCount);
    } catch (err) {
      console.error('Failed to fetch recipes from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes(page);
  }, [page, limit]);

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await api.categories.list();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCats();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRecipes(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setDifficulty('');
    setMaxCalories('');
    setMaxCookTime('');
    setPage(1);
    loadRecipes(1, { search: '', categoryId: '', difficulty: '', maxCalories: '', maxCookTime: '' });
  };

  const handleCreateClick = () => {
    router.push('/recipes/create');
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">Khám phá công thức nấu ăn</h1>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 shrink-0"
        >
          Đóng góp công thức mới
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                Bộ lọc tìm kiếm
              </h3>
              {(search || categoryId || difficulty || maxCalories || maxCookTime) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <form onSubmit={handleFilterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tên món ăn</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập tên món ăn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-neutral-900 text-sm"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={String(cat.id)} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Độ khó</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-neutral-900 text-sm"
                >
                  <option value="">Tất cả độ khó</option>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Max Calo (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.value.replace(/^-/, ''))}
                    placeholder="vd: 500"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Max thời gian (phút)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxCookTime}
                    onChange={(e) => setMaxCookTime(e.target.value.replace(/^-/, ''))}
                    placeholder="vd: 60"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm text-sm"
                >
                  Tìm kiếm & Áp dụng
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recipe Grid & Pagination Section */}
        <div className="flex-1 flex flex-col justify-between">
          
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-neutral-200">
              <div className="text-4xl mb-3 animate-bounce">⏳</div>
              <p className="font-medium text-neutral-600">Đang tải dữ liệu thẻ công thức từ Database...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-neutral-200 space-y-4">
              <BowlFood size={60} weight="duotone" className="mx-auto text-orange-400" aria-label="No image" />
              <h3 className="text-xl font-bold text-neutral-800">Không tìm thấy công thức nào</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto">
                Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm để khám phá nhiều công thức hơn.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-sm font-medium transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Recipe Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Link
                    href={`/recipes/${recipe.id}`}
                    key={String(recipe.id)}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-48 overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {recipe.thumbnail ? (
                        <img
                          src={recipe.thumbnail}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BowlFood size={56} weight="duotone" className="text-orange-400" aria-hidden="true" />
                        </div>
                      )}
                      
                      {/* Difficulty Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-neutral-800 shadow-sm">
                        {recipe.difficulty === 'EASY' ? 'Dễ' : recipe.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                      </div>

                      {/* Category Badge */}
                      {recipe.category && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          {recipe.category.name}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
                        {recipe.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mb-4">
                        <span className="flex items-center gap-1 font-medium text-neutral-700">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {recipe.calories || '—'} kcal
                        </span>
                        <span className="flex items-center gap-1 font-medium text-neutral-700">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {recipe.cookTime || '—'} phút
                        </span>
                        <span className="flex items-center gap-1 font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                          <Eye className="w-3.5 h-3.5 text-neutral-400" />
                          {Number(recipe.viewCount || 0)} xem
                        </span>
                        <LikeButton
                          recipeId={recipe.id}
                          initialCount={Number(recipe.likeCount ?? recipe._count?.likes ?? 0)}
                        />
                      </div>

                      {recipe.description && (
                        <p className="text-neutral-500 text-xs line-clamp-2 mb-4">
                          {recipe.description}
                        </p>
                      )}

                      {/* Card Footer: Author & Source */}
                      <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs shrink-0">
                            <ChefHat size={18} weight="duotone" aria-label="Chef recipe" />
                          </div>
                          <span className="text-xs font-medium text-neutral-700 truncate">
                            {recipe.author?.username || 'Người dùng'}
                          </span>
                        </div>

                        <FavoriteButton recipeId={recipe.id} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Bar */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                
                {/* Status text */}
                <div className="text-sm text-neutral-600 font-medium">
                  Hiển thị <span className="font-bold text-neutral-900">{recipes.length > 0 ? (page - 1) * limit + 1 : 0}</span> - <span className="font-bold text-neutral-900">{Math.min(page * limit, total)}</span> trong tổng số <span className="font-bold text-orange-600">{total}</span> thẻ công thức
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                  >
                    &larr; Trang trước
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          page === p
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                  >
                    Trang sau &rarr;
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
