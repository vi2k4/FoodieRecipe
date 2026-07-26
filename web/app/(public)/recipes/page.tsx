'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  Clock, 
  Flame, 
  Star, 
  Search, 
  Filter, 
  RotateCcw, 
  UtensilsCrossed, 
  TrendingUp,
  SlidersHorizontal,
  AlertCircle
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  calories: number | null;
  cookTime: number | null;
  difficulty: string;
  servings: number | null;
  thumbnail: string | null;
  averageRating: number | null;
  author: {
    username: string;
    avatarUrl: string | null;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function RecipesPage() {
  // Input field local states
  const [searchInput, setSearchInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [difficultyInput, setDifficultyInput] = useState("ALL");
  const [caloriesInput, setCaloriesInput] = useState(1000);
  const [cookTimeInput, setCookTimeInput] = useState(180);

  // Active filters applied to request
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "ALL",
    maxCalories: 1000,
    maxCookTime: 180,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Query categories from API
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      return res.data;
    },
  });

  // Query recipes from API
  const recipesQuery = useQuery<Recipe[]>({
    queryKey: ["recipes", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.difficulty !== "ALL") params.difficulty = filters.difficulty;
      if (filters.maxCalories < 1000) params.maxCalories = filters.maxCalories;
      if (filters.maxCookTime < 180) params.maxCookTime = filters.maxCookTime;

      const res = await axios.get(`${API_BASE_URL}/recipes`, { params });
      return res.data;
    },
  });

  const handleApplyFilters = () => {
    setFilters({
      search: searchInput,
      category: categoryInput,
      difficulty: difficultyInput,
      maxCalories: caloriesInput,
      maxCookTime: cookTimeInput,
    });
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setCategoryInput("");
    setDifficultyInput("ALL");
    setCaloriesInput(1000);
    setCookTimeInput(180);
    setFilters({
      search: "",
      category: "",
      difficulty: "ALL",
      maxCalories: 1000,
      maxCookTime: 180,
    });
    setShowMobileFilters(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  const categories = categoriesQuery.data || [];
  const recipes = recipesQuery.data || [];

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#1c1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Banner giới thiệu */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 text-white p-8 md:p-12 shadow-xl">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none rounded-full blur-2xl" />
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Khám phá tinh hoa ẩm thực
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Tìm kiếm công thức nấu ăn
            </h1>
            <p className="text-orange-50/90 text-sm md:text-base max-w-lg leading-relaxed">
              Lọc theo khẩu vị, lượng calo, thời gian chế biến hoặc độ khó để tìm thấy món ăn hoàn hảo nhất cho bữa cơm gia đình bạn.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR BỘ LỌC (DESKTOP) */}
          <div className="hidden lg:block bg-white border border-[#fed7aa] rounded-3xl p-6 shadow-sm h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-neutral-800">
                <Filter className="w-4 h-4 text-orange-600" /> Bộ lọc tìm kiếm
              </h2>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-medium text-neutral-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại
              </button>
            </div>

            {/* Từ khóa */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Từ khóa</label>
              <div className="relative flex items-center bg-[#fffaf5] border border-[#fed7aa] rounded-xl px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-200">
                <Search className="w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  placeholder="Ví dụ: Bánh flan, Phở..." 
                  className="w-full px-2 py-0.5 text-sm text-neutral-800 placeholder-neutral-400 bg-transparent border-0 outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Danh mục */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Danh mục</label>
              {categoriesQuery.isLoading ? (
                <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
              ) : (
                <select 
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full bg-[#fffaf5] border border-[#fed7aa] rounded-xl px-3 py-2.5 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Độ khó */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Độ khó</label>
              <div className="grid grid-cols-4 gap-1.5 bg-[#fffaf5] p-1 border border-[#fed7aa] rounded-xl">
                {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyInput(diff)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 ${
                      difficultyInput === diff
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {diff === "ALL" ? "Tất cả" : diff === "EASY" ? "Dễ" : diff === "MEDIUM" ? "Vừa" : "Khó"}
                  </button>
                ))}
              </div>
            </div>

            {/* Calo tối đa */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-700 uppercase tracking-wider">Lượng Calo tối đa</span>
                <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{caloriesInput} kcal</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="50"
                value={caloriesInput}
                onChange={(e) => setCaloriesInput(parseInt(e.target.value))}
                className="w-full accent-orange-600 h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
                <span>50 kcal</span>
                <span>1000 kcal</span>
              </div>
            </div>

            {/* Thời gian tối đa */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-700 uppercase tracking-wider">Thời gian nấu tối đa</span>
                <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{cookTimeInput} phút</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="180" 
                step="5"
                value={cookTimeInput}
                onChange={(e) => setCookTimeInput(parseInt(e.target.value))}
                className="w-full accent-orange-600 h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
                <span>5 phút</span>
                <span>180 phút</span>
              </div>
            </div>

            <button
              onClick={handleApplyFilters}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm hover:shadow shadow-orange-600/10 flex items-center justify-center gap-1.5"
            >
              Áp dụng bộ lọc
            </button>
          </div>

          {/* DANH SÁCH CÔNG THỨC */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* Header thanh công cụ nhỏ */}
            <div className="flex items-center justify-between bg-white border border-[#fed7aa]/50 rounded-2xl px-6 py-4 shadow-sm">
              <div className="text-sm font-medium text-neutral-600">
                Hiển thị <span className="text-orange-600 font-bold">{recipes.length}</span> công thức
              </div>
              
              <div className="flex items-center gap-2">
                {/* Nút lọc cho thiết bị di động */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2 border border-[#fed7aa] bg-orange-50 rounded-xl text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors shadow-sm"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Bộ lọc
                </button>
              </div>
            </div>

            {/* Xử lý các trạng thái API */}
            {recipesQuery.isError ? (
              // Error State
              <div className="bg-white border border-red-100 rounded-3xl py-12 px-4 text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
                <div className="p-3 bg-red-50 rounded-full border border-red-100 text-red-500">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-neutral-800">Không thể kết nối máy chủ</h3>
                  <p className="text-neutral-500 text-sm max-w-md mx-auto">
                    Có lỗi xảy ra khi tải dữ liệu từ hệ thống. Vui lòng đảm bảo backend đang chạy hoặc tải lại trang.
                  </p>
                </div>
                <button
                  onClick={() => recipesQuery.refetch()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : recipesQuery.isLoading ? (
              // Skeleton screens khi đang loading
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col bg-white border border-neutral-200/60 rounded-3xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] w-full bg-neutral-200" />
                    <div className="p-5 space-y-4">
                      <div className="h-6 bg-neutral-200 rounded w-3/4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-200 rounded w-full" />
                        <div className="h-4 bg-neutral-200 rounded w-5/6" />
                      </div>
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div className="h-4 bg-neutral-200 rounded w-1/3" />
                        <div className="h-6 bg-neutral-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recipes.length === 0 ? (
              // Empty State
              <div className="bg-white border border-[#fed7aa]/50 rounded-3xl py-16 px-4 text-center space-y-4 shadow-sm flex flex-col items-center justify-center">
                <div className="p-4 bg-orange-50 rounded-full border border-orange-100">
                  <UtensilsCrossed className="w-8 h-8 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-neutral-800">Không tìm thấy công thức nào</h3>
                  <p className="text-neutral-500 text-sm max-w-md mx-auto">
                    Thử thay đổi từ khóa hoặc điều chỉnh các bộ lọc calo, thời gian nấu và độ khó xem sao nhé.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-xs rounded-xl border border-orange-200 transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              // Grid hiển thị Cards thật từ API
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Link 
                    key={recipe.id}
                    href={`/recipes/${recipe.id}`}
                    className="flex flex-col bg-white border border-[#fed7aa]/45 rounded-3xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      <img 
                        src={recipe.thumbnail || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"} 
                        alt={recipe.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <span className={`absolute top-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-neutral-100 ${
                        recipe.difficulty === "EASY" ? "text-green-600" : recipe.difficulty === "MEDIUM" ? "text-amber-600" : "text-red-600"
                      }`}>
                        {recipe.difficulty === "EASY" ? "Dễ" : recipe.difficulty === "MEDIUM" ? "Vừa" : "Khó"}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        {recipe.category && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100/60 uppercase">
                            {recipe.category.name}
                          </span>
                        )}
                        <h3 className="font-bold text-base text-neutral-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
                          {recipe.title}
                        </h3>
                        <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-neutral-500 text-xs">
                        {/* Meta stats */}
                        <div className="flex items-center gap-3">
                          {recipe.cookTime && (
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" /> {recipe.cookTime} phút
                            </span>
                          )}
                          {recipe.calories && (
                            <span className="flex items-center gap-1 font-medium">
                              <Flame className="w-3.5 h-3.5 text-neutral-400" /> {Math.round(Number(recipe.calories))} kcal
                            </span>
                          )}
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          <Star className="w-3 h-3 fill-amber-500" /> {recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : "0.0"}
                        </div>
                      </div>

                      {/* Author footer */}
                      {recipe.author && (
                        <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-neutral-600">
                            Bởi <span className="text-neutral-800 font-semibold">{recipe.author.username}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DI ĐỘNG: PANEL BỘ LỌC CHI TIẾT (DRAWER MODAL) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/40 backdrop-blur-sm">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-xl overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600" /> Bộ lọc
              </h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-neutral-100"
              >
                <span className="text-neutral-500 font-semibold text-lg">&times;</span>
              </button>
            </div>

            {/* Từ khóa */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Từ khóa</label>
              <div className="relative flex items-center bg-[#fffaf5] border border-[#fed7aa] rounded-xl px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-200">
                <Search className="w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ví dụ: Bánh flan, Phở..." 
                  className="w-full px-2 py-0.5 text-sm text-neutral-800 placeholder-neutral-400 bg-transparent border-0 outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Danh mục */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Danh mục</label>
              <select 
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full bg-[#fffaf5] border border-[#fed7aa] rounded-xl px-3 py-2.5 text-sm text-neutral-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Độ khó */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Độ khó</label>
              <div className="grid grid-cols-4 gap-1 bg-[#fffaf5] p-1 border border-[#fed7aa] rounded-xl">
                {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyInput(diff)}
                    className={`py-1.5 text-[9px] font-bold rounded-lg transition-all duration-200 ${
                      difficultyInput === diff
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {diff === "ALL" ? "Tất cả" : diff === "EASY" ? "Dễ" : diff === "MEDIUM" ? "Vừa" : "Khó"}
                  </button>
                ))}
              </div>
            </div>

            {/* Calo tối đa */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-700 uppercase tracking-wider">Lượng Calo tối đa</span>
                <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{caloriesInput} kcal</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="50"
                value={caloriesInput}
                onChange={(e) => setCaloriesInput(parseInt(e.target.value))}
                className="w-full accent-orange-600 h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Thời gian tối đa */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-700 uppercase tracking-wider">Thời gian nấu tối đa</span>
                <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{cookTimeInput} phút</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="180" 
                step="5"
                value={cookTimeInput}
                onChange={(e) => setCookTimeInput(parseInt(e.target.value))}
                className="w-full accent-orange-600 h-1.5 bg-orange-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors text-center"
              >
                Đặt lại
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm text-center"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
