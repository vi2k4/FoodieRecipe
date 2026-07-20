import Link from "next/link";
import { Clock, Flame, Star, Search, Filter } from "lucide-react";

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

const MOCK_RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Bánh Flan Truyền Thống Caramels",
    description: "Công thức làm bánh flan caramel siêu mịn, thơm ngậy mùi trứng sữa và không bị rỗ.",
    calories: 250,
    cookTime: 45,
    difficulty: "EASY",
    servings: 4,
    thumbnail: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80",
    averageRating: 4.8,
    author: {
      username: "chef_nguyen",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80",
    }
  },
  {
    id: 2,
    title: "Phở Bò Hà Nội Cổ Truyền",
    description: "Hương vị phở bò truyền thống tinh tế với nước dùng trong vắt, ngọt thanh từ xương bò ninh kỹ và thơm lừng hồi quế thảo quả.",
    calories: 450,
    cookTime: 180,
    difficulty: "HARD",
    servings: 4,
    thumbnail: "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=800&q=80",
    averageRating: 4.9,
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
    servings: 2,
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    averageRating: 4.6,
    author: {
      username: "member_lan",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    }
  }
];

async function getRecipes(): Promise<Recipe[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/recipes`, {
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch recipes");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : MOCK_RECIPES;
  } catch (error) {
    console.error("Backend fetch failed, using mock data:", error);
    return MOCK_RECIPES;
  }
}

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Khám phá công thức
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Tìm kiếm nguồn cảm hứng nấu nướng từ hàng trăm công thức tuyệt vời.
          </p>
        </div>

        {/* Filter mockup buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex items-center bg-white border border-neutral-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-200">
            <Search className="w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Tìm món ăn..." 
              className="w-full px-2 py-0.5 text-xs text-neutral-800 placeholder-neutral-400 bg-transparent border-0 outline-none focus:ring-0"
              disabled
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 bg-white rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm cursor-not-allowed">
            <Filter className="w-3.5 h-3.5 text-neutral-500" /> Bộ lọc
          </button>
        </div>
      </div>

      {/* Grid List */}
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
                  <Star className="w-3 h-3 fill-amber-500" /> {recipe.averageRating.toFixed(1)}
                </div>
              </div>

              {/* Author footer */}
              {recipe.author && (
                <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                  <img 
                    src={recipe.author.avatarUrl || "/default-avatar.png"} 
                    alt={recipe.author.username}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-200"
                  />
                  <span className="text-[11px] font-medium text-neutral-600">
                    Bởi <span className="text-neutral-800 font-semibold">{recipe.author.username}</span>
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
