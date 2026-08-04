import Link from "next/link";
import { Utensils, Cookie, Leaf, Coffee, Flame, Clock, Star, BrainCircuit, Search, ArrowRight } from "lucide-react";
import { FavoriteButton } from "@/components/recipes/FavoriteButton";

interface Recipe {
  id: number;
  title: string;
  description: string;
  calories: number | null;
  cookTime: number | null;
  difficulty: string;
  servings: number | null;
  thumbnail: string | null;
  averageRating: number;
  author: {
    username: string;
    avatarUrl: string | null;
  } | null;
}

const CATEGORIES = [
  { name: "Món chính", count: 120, icon: Utensils, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { name: "Món tráng miệng", count: 45, icon: Cookie, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { name: "Món chay", count: 32, icon: Leaf, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { name: "Đồ uống", count: 28, icon: Coffee, color: "bg-blue-50 text-blue-600 border-blue-100" }
];

async function getRecipes(): Promise<Recipe[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const params = new URLSearchParams({
      isPublic: "true",
      page: "1",
      limit: "6",
    });
    const res = await fetch(`${apiUrl}/recipes?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch recipes");
    const payload = await res.json();
    const recipes = Array.isArray(payload) ? payload : payload?.data;
    return Array.isArray(recipes) ? recipes.slice(0, 6) : [];
  } catch (error) {
    console.error("Backend fetch failed:", error);
    return [];
  }
}

export default async function PublicHomePage() {
  const recipes = await getRecipes();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-transparent">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-orange-200/10 to-transparent pointer-events-none rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 tracking-wide uppercase">
            <Flame className="w-3 h-3 text-orange-600" /> Nền tảng chia sẻ công thức hàng đầu
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[1.15]">
            Sáng Tạo & Chia Sẻ <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Công Thức Nấu Ăn Cùng AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá hàng ngàn công thức nấu ăn ngon mỗi ngày hoặc sử dụng trợ lý AI thông minh để gợi ý món ăn độc đáo từ những nguyên liệu có sẵn trong tủ lạnh của bạn.
          </p>

          {/* Search Bar mockup */}
          <div className="mx-auto flex max-w-xl flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-md transition-all duration-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center">
              <Search className="ml-3 h-5 w-5 shrink-0 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm công thức, nguyên liệu..." 
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder-neutral-400 focus:ring-0"
                disabled
              />
            </div>
            <button className="flex shrink-0 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-orange-500">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          Danh mục phổ biến
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md hover:border-neutral-200 transition-all duration-200 cursor-pointer group"
              >
                <div className={`p-3 rounded-xl border ${cat.color} group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 text-sm">{cat.name}</h3>
                  <p className="text-xs text-neutral-400">{cat.count} công thức</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recipes Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Công thức mới nhất</h2>
            <p className="text-neutral-500 text-sm mt-1">Được đóng góp bởi cộng đồng đầu bếp tài ba</p>
          </div>
          <Link 
            href="/recipes" 
            className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-500 group transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link 
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="flex flex-col bg-white border border-neutral-200/60 rounded-3xl overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-300 group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <img 
                  src={recipe.thumbnail || "/placeholder.jpg"} 
                  alt={recipe.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-700 shadow-sm border border-neutral-100">
                  {recipe.difficulty}
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-neutral-800 leading-snug group-hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-neutral-500 text-xs">
                  {/* Meta stats */}
                  <div className="flex items-center gap-3">
                    {recipe.cookTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" /> {recipe.cookTime} phút
                      </span>
                    )}
                    {recipe.calories && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-neutral-400" /> {recipe.calories} kcal
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {recipe.averageRating.toFixed(1)}
                  </div>
                </div>

                {/* Author footer */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  {recipe.author ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={recipe.author.avatarUrl || "/default-avatar.png"} 
                        alt={recipe.author.username}
                        className="w-6.5 h-6.5 rounded-full object-cover border border-neutral-200 shrink-0"
                      />
                      <span className="text-[11px] font-medium text-neutral-600 truncate">
                        Bởi <span className="text-neutral-800 font-semibold">{recipe.author.username}</span>
                      </span>
                    </div>
                  ) : <div />}
                  <FavoriteButton recipeId={recipe.id} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Assistant Promotion banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 shadow-2xl">
          {/* Subtle abstract glow background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <BrainCircuit className="w-3.5 h-3.5" /> Tính năng đột phá
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Quét Ảnh Nguyên Liệu <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                Gợi Ý Món Ăn Bằng GenAI
              </span>
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Chụp ảnh các nguyên liệu thô có sẵn trong bếp của bạn, hệ thống AI AWS Rekognition sẽ tự động nhận diện và đề xuất công thức hoàn hảo được tạo bởi Claude 3.5 Sonnet.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                Trải nghiệm ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
