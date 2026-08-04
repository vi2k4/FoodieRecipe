"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { socialApi } from "@/lib/social-api";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Clock, 
  Flame, 
  Star, 
  ChevronRight,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  description: string;
  calories: number;
  cookTime: number;
  difficulty: string;
  thumbnail: string;
  averageRating: number;
  author: {
    username: string;
    avatarUrl: string;
  };
}

const INITIAL_FAVORITES: Recipe[] = [
  {
    id: 1,
    title: "Bánh Flan Truyền Thống Caramels",
    description: "Công thức làm bánh flan caramel siêu mịn, thơm ngậy mùi trứng sữa và không bị rỗ.",
    calories: 250,
    cookTime: 45,
    difficulty: "EASY",
    thumbnail: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80",
    averageRating: 4.8,
    author: {
      username: "chef_nguyen",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80",
    }
  },
  {
    id: 3,
    title: "Salad Ức Gà Sốt Mè Rang Giảm Cân",
    description: "Lựa chọn hoàn hảo cho những bữa ăn Eat-clean thanh đạm, giàu protein tốt và các loại vitamin từ rau quả tươi mát.",
    calories: 320,
    cookTime: 15,
    difficulty: "EASY",
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    averageRating: 4.6,
    author: {
      username: "member_lan",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    }
  }
];

export default function FavoritesPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const syncToken = () => {
      if (!mounted) return;
      const session = auth.getSession();
      setToken(session?.accessToken || null);
    };
    auth.bootstrap().then(syncToken).catch(syncToken);
    window.addEventListener("foodirecipe:auth-change", syncToken);
    return () => {
      mounted = false;
      window.removeEventListener("foodirecipe:auth-change", syncToken);
    };
  }, []);

  const myFavoritesQuery = useQuery<any[]>({
    queryKey: ["myFavorites"],
    queryFn: async () => {
      return socialApi.getMyFavorites();
    },
    enabled: !!token,
  });

  const favoritesList = myFavoritesQuery.data || [];
  const favorites = token ? favoritesList : INITIAL_FAVORITES;

  const handleRemoveFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    try {
      await socialApi.toggleFavorite(id, false);
      myFavoritesQuery.refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-neutral-500 items-center gap-2">
          <Link href="/" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium">Món ăn yêu thích</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Sưu tập yêu thích
          </h1>
          <p className="text-neutral-500 max-w-xl">
            Nơi lưu giữ những công thức nấu ăn tuyệt vời nhất mà bạn đã sưu tầm để chuẩn bị nấu cho gia đình.
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 fill-none" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Chưa có công thức yêu thích</h3>
            <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
              Hãy khám phá hàng trăm công thức hấp dẫn và bấm nút Yêu thích để lưu lại tại đây nhé!
            </p>
            <Link 
              href="/recipes"
              className="inline-flex items-center gap-2 bg-orange-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Khám phá ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
              >
                {/* Unfavorite Heart Button */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleRemoveFavorite(e, recipe.id)}
                  className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-white p-0 rounded-full shadow-md transition-all h-10 w-10 flex items-center justify-center cursor-pointer select-none"
                  title="Xóa khỏi yêu thích"
                >
                  <Heart className="w-5 h-5 fill-current text-red-500" />
                </span>

                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-neutral-100">
                  <img 
                    src={recipe.thumbnail || "/placeholder.jpg"} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm hover:bg-orange-700 border-none">
                    {recipe.difficulty === "EASY" ? "Dễ" : recipe.difficulty === "MEDIUM" ? "Vừa" : "Khó"}
                  </Badge>
                </div>

                {/* Card Content */}
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-neutral-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  {/* Author & Stats */}
                  <div className="border-t border-neutral-50 pt-4 flex flex-col gap-3">
                    {/* Author profile */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-neutral-100">
                        <AvatarImage src={recipe.author?.avatarUrl} className="object-cover" />
                        <AvatarFallback>{recipe.author?.username?.slice(0, 2).toUpperCase() || 'US'}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-neutral-600 font-medium">@{recipe.author?.username || 'user'}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {recipe.cookTime || 30} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-neutral-400" />
                          {recipe.calories ? Math.round(recipe.calories) : '—'} kcal
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current" />
                        {recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : "5.0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
