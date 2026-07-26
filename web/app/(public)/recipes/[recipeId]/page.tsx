"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { socialApi } from "@/lib/social-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  Flame, 
  Users, 
  Star, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  Tag, 
  Calendar, 
  User, 
  Heart, 
  Utensils, 
  AlertCircle,
  ThumbsUp
} from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  description: string | null;
  calories: number | null;
  cookTime: number | null;
  difficulty: string;
  servings: number | null;
  thumbnail: string | null;
  source: string | null;
  averageRating: number;
  likeCount: number;
  favoriteCount: number;
  createdAt: string;
  author: {
    username: string;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
  ingredients: {
    id: number;
    ingredientName: string;
    quantity: number | null;
    unit: string | null;
  }[];
  steps: {
    id: number;
    stepNumber: number;
    content: string;
  }[];
  recipeTags: {
    tag: {
      name: string;
    };
  }[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  parentCommentId: number | null;
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
  replies: Comment[];
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params?.recipeId as string;
  
  const [token, setToken] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [commentContent, setCommentContent] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // 1. Query Recipe details
  const recipeQuery = useQuery<Recipe>({
    queryKey: ["recipeDetails", recipeId],
    queryFn: async () => {
      const data = await socialApi.getRecipeDetails(recipeId);
      setLikeCount(Number(data.likeCount || 0));
      setFavoriteCount(Number(data.favoriteCount || 0));
      return {
        ...data,
        averageRating: Number(data.averageRating || 0),
        ingredients: data.ingredients || [],
        steps: data.steps || [],
        recipeTags: data.recipeTags || [],
      };
    },
    enabled: !!recipeId,
  });

  const recipe = recipeQuery.data;

  // 2. Query Comments Tree
  const commentsQuery = useQuery<Comment[]>({
    queryKey: ["recipeComments", recipeId],
    queryFn: async () => {
      return socialApi.getComments(recipeId);
    },
    enabled: !!recipeId,
  });

  // 3. Query user's favorites to see if this recipe is in it
  const favoritesQuery = useQuery<any[]>({
    queryKey: ["myFavorites"],
    queryFn: async () => {
      if (!token) return [];
      return socialApi.getMyFavorites();
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (recipe && favoritesQuery.data) {
      const hasFav = favoritesQuery.data.some((fav: any) => Number(fav.id) === Number(recipe.id));
      setIsFavorited(hasFav);
    }
  }, [recipe, favoritesQuery.data]);

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  const handleLikeToggle = async () => {
    if (!token) {
      triggerAlert("Vui lòng đăng nhập để thích công thức này!");
      return;
    }
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(prev => nextLiked ? prev + 1 : prev - 1);
    try {
      await socialApi.toggleLike(recipeId, nextLiked);
      recipeQuery.refetch();
    } catch (e) {
      // Revert local state on failure
      setIsLiked(!nextLiked);
      setLikeCount(prev => nextLiked ? prev - 1 : prev + 1);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!token) {
      triggerAlert("Vui lòng đăng nhập để lưu công thức yêu thích!");
      return;
    }
    const nextFav = !isFavorited;
    setIsFavorited(nextFav);
    setFavoriteCount(prev => nextFav ? prev + 1 : prev - 1);
    try {
      await socialApi.toggleFavorite(recipeId, nextFav);
      favoritesQuery.refetch();
      recipeQuery.refetch();
    } catch (e) {
      setIsFavorited(!nextFav);
      setFavoriteCount(prev => nextFav ? prev - 1 : prev + 1);
    }
  };

  const handleRate = async (score: number) => {
    if (!token) {
      triggerAlert("Vui lòng đăng nhập để đánh giá sao công thức này!");
      return;
    }
    setUserRating(score);
    try {
      await socialApi.submitRating(recipeId, score);
      recipeQuery.refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async () => {
    if (!token) {
      triggerAlert("Vui lòng đăng nhập để gửi bình luận!");
      return;
    }
    if (!commentContent.trim()) return;

    try {
      await socialApi.postComment(recipeId, commentContent);
      setCommentContent("");
      commentsQuery.refetch();
    } catch (e) {
      console.error(e);
    }
  };

  if (recipeQuery.isError) {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center p-4">
        <div className="bg-white border border-red-100 rounded-3xl py-12 px-6 text-center space-y-4 shadow-sm flex flex-col items-center justify-center max-w-md w-full">
          <div className="p-3 bg-red-50 rounded-full border border-red-100 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-neutral-800">Không tìm thấy công thức</h3>
            <p className="text-neutral-500 text-sm">
              Công thức này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
            </p>
          </div>
          <button
            onClick={() => router.push("/recipes")}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors block w-full text-center"
          >
            Quay lại danh sách công thức
          </button>
        </div>
      </div>
    );
  }

  if (recipeQuery.isLoading || !recipe) {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const comments = commentsQuery.data || [];

  const formattedDate = new Date(recipe.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      
      {/* Toast Alert popup */}
      {alertMessage && (
        <div className="fixed top-24 right-4 z-50 flex items-center gap-2 bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-neutral-800 animate-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-semibold">{alertMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/recipes" className="hover:text-neutral-900 transition-colors">
          Công thức
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-800 font-medium truncate max-w-[200px] sm:max-w-xs">
          {recipe.title}
        </span>
      </nav>

      {/* Main Header / Title Section */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 leading-tight">
          {recipe.title}
        </h1>
        
        {recipe.description && (
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-4xl">
            {recipe.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-500 pt-2">
          {recipe.author && (
            <button 
              onClick={() => router.push(`/users/${recipe.author?.username}`)}
              className="flex items-center gap-2 text-left group"
            >
              <img 
                src={recipe.author.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                alt={recipe.author.username}
                className="w-8 h-8 rounded-full object-cover border border-neutral-200 group-hover:scale-105 transition-transform"
              />
              <div>
                <p className="font-semibold text-neutral-800 group-hover:text-orange-600 transition-colors">@{recipe.author.username}</p>
                <p className="text-[10px]">Tác giả</p>
              </div>
            </button>
          )}

          <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>Đăng ngày {formattedDate}</span>
          </div>

          {recipe.source && (
            <>
              <div className="h-6 w-px bg-neutral-200 hidden sm:block" />
              <div className="flex items-center gap-1">
                <span className="font-medium text-neutral-600">Nguồn:</span>
                <span className="text-neutral-700 italic">{recipe.source}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recipe content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Main Cover Image */}
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-200/50">
            <img 
              src={recipe.thumbnail || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"} 
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
            <span className="absolute top-4 right-4 bg-orange-600 text-white font-bold text-xs uppercase px-3.5 py-1.5 rounded-full shadow-md">
              {recipe.difficulty === "EASY" ? "Dễ" : recipe.difficulty === "MEDIUM" ? "Vừa" : "Khó"}
            </span>
          </div>

          {/* Stats quick bar */}
          <div className="grid grid-cols-3 gap-4 p-5 bg-white border border-neutral-200/60 rounded-3xl shadow-sm text-center">
            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Thời gian</p>
              <p className="text-sm font-extrabold text-neutral-800">{recipe.cookTime || "--"} phút</p>
            </div>
            
            <div className="space-y-1 border-x border-neutral-100">
              <div className="mx-auto w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Lượng Calo</p>
              <p className="text-sm font-extrabold text-neutral-800">{recipe.calories ? Math.round(Number(recipe.calories)) : "--"} kcal</p>
            </div>

            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Khẩu phần</p>
              <p className="text-sm font-extrabold text-neutral-800">{recipe.servings || "--"} người</p>
            </div>
          </div>

          {/* Ingredients list with checkboxes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <CheckCircle2 className="w-5 h-5 text-orange-600" /> Nguyên liệu cần chuẩn bị
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-6 border border-neutral-200/60 rounded-3xl shadow-sm">
              {recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ing) => (
                  <label 
                    key={ing.id} 
                    className="flex items-center gap-3 py-2 px-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500/20 w-4.5 h-4.5 cursor-pointer"
                    />
                    <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                      <span className="font-semibold text-neutral-900">
                        {ing.quantity && `${Number(ing.quantity)} `}
                        {ing.unit && `${ing.unit} `}
                      </span>
                      {ing.ingredientName}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-neutral-500 text-sm col-span-2">Chưa có thông tin nguyên liệu</p>
              )}
            </div>
          </div>

          {/* Preparation steps */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Utensils className="w-5 h-5 text-orange-600" /> Các bước thực hiện
            </h2>
            <div className="space-y-4">
              {recipe.steps.length > 0 ? (
                recipe.steps.map((step) => (
                  <div 
                    key={step.id} 
                    className="flex gap-4 p-5 bg-white border border-neutral-200/50 rounded-3xl shadow-sm hover:border-neutral-300/80 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                      {step.stepNumber}
                    </div>
                    <div className="space-y-1 pt-0.5">
                      <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                        {step.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">Chưa có thông tin các bước làm</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar card & Social details */}
        <div className="space-y-6">
          
          {/* Action box: Ratings, Likes, Favorites */}
          <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-neutral-950 text-base pb-3 border-b border-neutral-100">
              Đánh giá & Tương tác
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 font-medium">Điểm đánh giá trung bình</span>
              <div className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-sm">
                <Star className="w-4 h-4 fill-amber-500" /> {recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : "0.0"}
              </div>
            </div>

            {/* Interactive Rating Pick */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
              <span className="text-xs text-neutral-500 font-medium">Đánh giá của bạn</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Like and Favorite Toggle Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleLikeToggle}
                variant={isLiked ? "secondary" : "outline"}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200 text-sm font-semibold h-auto ${
                  isLiked
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "border-neutral-200 hover:bg-rose-50/50 hover:text-rose-500 text-neutral-700"
                }`}
              >
                <ThumbsUp className="w-4.5 h-4.5" /> Thích ({likeCount})
              </Button>
              
              <Button 
                onClick={handleFavoriteToggle}
                variant={isFavorited ? "secondary" : "outline"}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200 text-sm font-semibold h-auto ${
                  isFavorited
                    ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
                    : "border-neutral-200 hover:bg-orange-50/50 hover:text-orange-500 text-neutral-700"
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${isFavorited ? "fill-orange-600" : ""}`} /> Lưu ({favoriteCount})
              </Button>
            </div>
          </div>

          {/* Tags Box */}
          <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-950 text-base pb-3 border-b border-neutral-100 flex items-center gap-1.5">
              <Tag className="w-4.5 h-4.5 text-neutral-400" /> Từ khóa tìm kiếm
            </h3>
            <div className="flex flex-wrap gap-2">
              {recipe.recipeTags.length > 0 ? (
                recipe.recipeTags.map((rt, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    #{rt.tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-neutral-400 text-xs italic">Không có tag nào</span>
              )}
            </div>
          </div>

          {/* Bio card */}
          {recipe.author && (
            <div className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={recipe.author.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                  alt={recipe.author.username}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">@{recipe.author.username}</h4>
                  <p className="text-[10px] text-neutral-400">Đầu bếp đóng góp</p>
                </div>
              </div>
              {recipe.author.bio && (
                <p className="text-xs text-neutral-500 leading-relaxed italic border-t border-neutral-100 pt-3">
                  "{recipe.author.bio}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <section className="space-y-6 pt-10 border-t border-neutral-200/60 max-w-4xl">
        <h2 className="text-2xl font-bold text-neutral-950 flex items-center gap-2">
          <MessageSquare className="w-5.5 h-5.5 text-neutral-400" /> Bình luận ({comments.length})
        </h2>

        {/* Comment input field */}
        <div className="flex gap-4 p-5 bg-neutral-50 border border-neutral-200 rounded-3xl">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
            C
          </div>
          <div className="flex-1 space-y-3">
            <textarea 
              rows={3} 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={token ? "Chia sẻ ý kiến của bạn về món ăn này..." : "Vui lòng đăng nhập để chia sẻ bình luận..."} 
              className="w-full p-4 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              disabled={!token}
            />
            <Button 
              onClick={handlePostComment}
              disabled={!token || !commentContent.trim()}
              variant="default"
              className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm h-auto ${
                token && commentContent.trim()
                  ? "bg-neutral-900 hover:bg-neutral-800 text-white hover:scale-105 active:scale-95"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              Gửi bình luận
            </Button>
          </div>
        </div>

        {/* List of comments (with support for nested replies) */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comm) => (
              <div key={comm.id} className="space-y-4">
                {/* Main Comment */}
                <div className="flex gap-4 p-5 bg-white border border-neutral-100 rounded-3xl shadow-sm">
                  <Avatar className="w-9 h-9 border border-neutral-200">
                    <AvatarImage 
                      src={comm.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                      className="object-cover"
                    />
                    <AvatarFallback>{comm.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">@{comm.user.username}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(comm.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {comm.content}
                    </p>
                  </div>
                </div>

                {/* Indented Replies */}
                {comm.replies && comm.replies.length > 0 && (
                  <div className="pl-12 space-y-3">
                    {comm.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 p-4 bg-orange-50/20 border border-orange-100/50 rounded-2xl shadow-sm">
                        <Avatar className="w-8 h-8 border border-neutral-200">
                          <AvatarImage 
                            src={reply.user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                            className="object-cover"
                          />
                          <AvatarFallback>{reply.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">@{reply.user.username}</span>
                            <span className="text-[9px] text-neutral-400">
                              {new Date(reply.createdAt).toLocaleDateString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-sm italic pl-2">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
          )}
        </div>
      </section>
    </div>
  );
}
