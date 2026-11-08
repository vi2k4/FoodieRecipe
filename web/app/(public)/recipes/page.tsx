/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { api } from '@/lib/api-client';
import { BowlFood, Sparkle } from '@phosphor-icons/react';
import { Eye, ThumbsUp, Flame, Clock, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { FavoriteButton } from '@/components/recipes/FavoriteButton';
import { LikeButton } from '@/components/recipes/LikeButton';
import { LoginRequiredDialog } from '@/components/auth/LoginRequiredDialog';
import { RecipeGridSkeleton } from '@/components/ui/loading-skeletons';
import { DifficultyDot } from '@/components/recipes/DifficultyDot';

export default function RecipesPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recipes, setRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  // 12 = 3 hàng đầy đủ khi desktop hiển thị 4 cột.
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [minCalories, setMinCalories] = useState('');
  const [maxCookTime, setMaxCookTime] = useState('');
  const [minCookTime, setMinCookTime] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const loadRecipes = async (
    targetPage = page,
    overrideFilters?: { search?: string; categoryId?: string; difficulty?: string; minCalories?: string; maxCalories?: string; minCookTime?: string; maxCookTime?: string; sortBy?: string }
  ) => {
    setLoading(true);
    try {
      const activeSearch = overrideFilters?.search !== undefined ? overrideFilters.search : search;
      const activeCat = overrideFilters?.categoryId !== undefined ? overrideFilters.categoryId : categoryId;
      const activeDiff = overrideFilters?.difficulty !== undefined ? overrideFilters.difficulty : difficulty;
      const activeMaxCal = overrideFilters?.maxCalories !== undefined ? overrideFilters.maxCalories : maxCalories;
      const activeMinCal = overrideFilters?.minCalories !== undefined ? overrideFilters.minCalories : minCalories;
      const activeMaxCook = overrideFilters?.maxCookTime !== undefined ? overrideFilters.maxCookTime : maxCookTime;
      const activeMinCook = overrideFilters?.minCookTime !== undefined ? overrideFilters.minCookTime : minCookTime;
      const activeSort = overrideFilters?.sortBy !== undefined ? overrideFilters.sortBy : sortBy;

      const params: Record<string, string | number | boolean> = {
        isPublic: true,
        page: targetPage,
        limit: limit,
      };

      if (activeSearch.trim()) params.search = activeSearch.trim();
      if (activeCat) params.categoryId = Number(activeCat);
      if (activeDiff) params.difficulty = activeDiff;
      if (activeMinCal) params.minCalories = Number(activeMinCal);
      if (activeMaxCal) params.maxCalories = Number(activeMaxCal);
      if (activeMinCook) params.minCookTime = Number(activeMinCook);
      if (activeMaxCook) params.maxCookTime = Number(activeMaxCook);
      if (activeSort) params.sortBy = activeSort;

      const res = await api.recipes.list(params);
      
      let list = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.total !== undefined ? res.total : list.length;

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
    const querySearch = searchParams.get('search')?.trim() || '';
    const requestedSort = searchParams.get('sortBy') || 'newest';
    const validSorts = ['newest', 'oldest', 'popular', 'liked', 'rated', 'hot'];
    const querySort = validSorts.includes(requestedSort) ? requestedSort : 'newest';
    setSearch(querySearch);
    setSortBy(querySort);
    setPage(1);
    loadRecipes(1, { search: querySearch, sortBy: querySort });
  }, [searchParams]);

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
    setMinCalories('');
    setMaxCookTime('');
    setMinCookTime('');
    setSortBy('newest');
    setPage(1);
    loadRecipes(1, { search: '', categoryId: '', difficulty: '', minCalories: '', maxCalories: '', minCookTime: '', maxCookTime: '', sortBy: 'newest' });
  };

  const handleCreateClick = () => {
    if (user.role === 'GUEST') {
      setLoginDialogOpen(true);
      return;
    }
    router.push('/recipes/create');
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const hasFilters = Boolean(
    search ||
    categoryId ||
    difficulty ||
    minCalories ||
    maxCalories ||
    minCookTime ||
    maxCookTime ||
    sortBy !== 'newest'
  );
  const isDarkTheme = resolvedTheme === 'dark';
  const filterSurfaceStyle = { backgroundColor: isDarkTheme ? '#171311' : '#ffffff' };
  const filterControlStyle = {
    backgroundColor: isDarkTheme ? '#0a0a0a' : '#ffffff',
    color: isDarkTheme ? '#ffffff' : '#171717',
  };
  const filterLabelStyle = { color: isDarkTheme ? '#ffffff' : '#171717' };

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
        <div className="w-full lg:w-64 shrink-0">
          <div
            style={filterSurfaceStyle}
            className="sticky top-24 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="border-b border-neutral-100 p-4 dark:border-neutral-800">
              <div className="flex items-start justify-between gap-2">
              <div>
                <h3 style={filterLabelStyle} className="flex items-center gap-2 text-sm font-bold">
                  <SlidersHorizontal size={16} className="text-orange-500" />
                  Bộ lọc tìm kiếm
                </h3>
                <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">Tìm đúng món ăn theo nhu cầu</p>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium whitespace-nowrap"
                >
                  <RotateCcw size={13} />
                  Đặt lại
                </button>
              )}
              </div>
            </div>

            <form onSubmit={handleFilterSubmit} className="space-y-4 p-4">
              <div>
                <label style={filterLabelStyle} className="mb-1.5 block text-xs font-semibold">Tên món ăn</label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-orange-500" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ví dụ: phở bò..."
                    style={filterControlStyle}
                    className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500"
                  />
                  </div>
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    Tìm
                  </button>
                </div>
              </div>

              <div>
                <label style={filterLabelStyle} className="mb-1.5 block text-xs font-semibold">Danh mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={filterControlStyle}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
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
                <label style={filterLabelStyle} className="mb-1.5 block text-xs font-semibold">Độ khó</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={filterControlStyle}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                >
                  <option value="">Tất cả độ khó</option>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={filterLabelStyle} className="block text-xs font-semibold mb-1">Calo tối thiểu</label>
                  <input
                    type="number"
                    min="0"
                    value={minCalories}
                    onChange={(e) => setMinCalories(e.target.value.replace(/^-/, ''))}
                    placeholder="0 kcal"
                    style={filterControlStyle}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label style={filterLabelStyle} className="block text-xs font-semibold mb-1">Calo tối đa</label>
                  <input
                    type="number"
                    min="0"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.value.replace(/^-/, ''))}
                    placeholder="500 kcal"
                    style={filterControlStyle}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={filterLabelStyle} className="block text-xs font-semibold mb-1">Thời gian tối thiểu</label>
                  <input
                    type="number"
                    min="0"
                    value={minCookTime}
                    onChange={(e) => setMinCookTime(e.target.value.replace(/^-/, ''))}
                    placeholder="0 phút"
                    style={filterControlStyle}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label style={filterLabelStyle} className="block text-xs font-semibold mb-1">Thời gian tối đa</label>
                  <input
                    type="number"
                    min="0"
                    value={maxCookTime}
                    onChange={(e) => setMaxCookTime(e.target.value.replace(/^-/, ''))}
                    placeholder="60 phút"
                    style={filterControlStyle}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label style={filterLabelStyle} className="mb-1.5 block text-xs font-semibold">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={filterControlStyle}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="popular">Xem nhiều nhất</option>
                  <option value="liked">Nhiều lượt thích</option>
                  <option value="rated">Đánh giá cao</option>
                  <option value="hot">Đang hot</option>
                </select>
              </div>

            </form>
          </div>
        </div>

        {/* Recipe Grid & Pagination Section */}
        <div className="flex-1 flex flex-col justify-between">
          
          {loading ? (
            <RecipeGridSkeleton count={limit} />
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
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                {recipes.map((recipe) => (
                  <Link
                    href={`/recipes/${recipe.id}`}
                    key={String(recipe.id)}
                    className="group flex w-full flex-col bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-32 overflow-hidden bg-neutral-100 sm:h-48">
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
                      
                      {/* Difficulty indicator */}
                      <div className="absolute left-3 top-3">
                        <DifficultyDot difficulty={recipe.difficulty} />
                      </div>

                      {/* Category Badge */}
                      {recipe.category && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          {recipe.category.name}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-neutral-900 transition-colors group-hover:text-orange-500 sm:text-lg">
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

                      {/* Card Footer: Author & Source */}
                      <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={recipe.author?.avatarUrl || "/file.svg"}
                            alt={recipe.author?.username || "Người dùng"}
                            className="w-7 h-7 rounded-full border border-neutral-200 object-cover shrink-0"
                          />
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
      <LoginRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        action="đóng góp công thức mới"
      />
    </div>
  );
}
