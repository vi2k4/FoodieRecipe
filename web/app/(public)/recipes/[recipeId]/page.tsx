import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Flame, Users, Star, MessageSquare, ChevronRight, CheckCircle2, Tag, Calendar, User, Heart, Utensils } from "lucide-react";

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
  comments: {
    id: number;
    content: string;
    createdAt: string;
    user: {
      username: string;
      avatarUrl: string | null;
    };
  }[];
}

const MOCK_RECIPES_DB: Record<number, Recipe> = {
  1: {
    id: 1,
    title: "Bánh Flan Truyền Thống Caramels",
    description: "Công thức làm bánh flan caramel siêu mịn, thơm ngậy mùi trứng sữa và không bị rỗ.",
    calories: 250,
    cookTime: 45,
    difficulty: "EASY",
    servings: 4,
    thumbnail: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80",
    source: "Đầu bếp Nguyễn",
    averageRating: 4.8,
    createdAt: "2026-07-18T09:24:47.493Z",
    author: {
      username: "chef_nguyen",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80",
      bio: "Đầu bếp chuyên nghiệp với hơn 10 năm kinh nghiệm trong ẩm thực Việt Nam",
    },
    ingredients: [
      { id: 1, ingredientName: "Trứng gà", quantity: 5, unit: "quả" },
      { id: 2, ingredientName: "Sữa tươi không đường", quantity: 500, unit: "ml" },
      { id: 3, ingredientName: "Đường cát", quantity: 100, unit: "g" },
      { id: 4, ingredientName: "Vani", quantity: 1, unit: "ống" },
    ],
    steps: [
      { id: 1, stepNumber: 1, content: "Đun đường với một chút nước lọc đến khi chuyển màu cánh gián caramel, đổ một lớp mỏng vào đáy các khuôn bánh." },
      { id: 2, stepNumber: 2, content: "Đánh nhẹ trứng gà cho tan và hạn chế tạo bọt khí, đun sữa tươi ấm rồi từ từ rót sữa vào trứng, khuấy nhẹ đều tay cùng với vani." },
      { id: 3, stepNumber: 3, content: "Lọc hỗn hợp qua rây mịn từ 2 đến 3 lần để bánh được mịn hoàn toàn, sau đó rót từ từ vào khuôn đã nguội caramel." },
      { id: 4, stepNumber: 4, content: "Xếp khuôn vào nồi hấp cách thủy ở lửa nhỏ nhất trong 30-40 phút. Nên che mặt khuôn bằng giấy bạc để tránh nước đọng nhỏ vào bánh." },
      { id: 5, stepNumber: 5, content: "Để bánh nguội hoàn toàn rồi cho vào ngăn mát tủ lạnh từ 2-3 tiếng trước khi úp ngược ra đĩa thưởng thức." },
    ],
    recipeTags: [
      { tag: { name: "Dễ làm" } },
      { tag: { name: "Ít calo" } },
    ],
    comments: [
      {
        id: 1,
        content: "Nhìn ngon quá anh ơi! Cho em hỏi nếu hấp bằng nồi cơm điện thì có được không ạ?",
        createdAt: "2026-07-18T09:24:47.493Z",
        user: {
          username: "member_lan",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        }
      }
    ]
  },
  2: {
    id: 2,
    title: "Phở Bò Hà Nội Cổ Truyền",
    description: "Hương vị phở bò truyền thống tinh tế với nước dùng trong vắt, ngọt thanh từ xương bò ninh kỹ và thơm lừng hồi quế thảo quả.",
    calories: 450,
    cookTime: 180,
    difficulty: "HARD",
    servings: 4,
    thumbnail: "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=800&q=80",
    source: "Bí kíp gia truyền Chef Nguyễn",
    averageRating: 4.9,
    createdAt: "2026-07-18T09:24:47.493Z",
    author: {
      username: "chef_nguyen",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80",
      bio: "Đầu bếp chuyên nghiệp với hơn 10 năm kinh nghiệm trong ẩm thực Việt Nam",
    },
    ingredients: [
      { id: 5, ingredientName: "Bánh phở tươi", quantity: 500, unit: "g" },
      { id: 6, ingredientName: "Thịt thăn bò", quantity: 300, unit: "g" },
      { id: 7, ingredientName: "Xương ống bò", quantity: 1000, unit: "g" },
      { id: 8, ingredientName: "Hành tây, gừng", quantity: 1, unit: "củ" },
      { id: 9, ingredientName: "Gia vị phở gồm quế, hồi và thảo quả", quantity: 1, unit: "gói" },
      { id: 10, ingredientName: "Hành lá, rau thơm", quantity: 50, unit: "g" },
    ],
    steps: [
      { id: 6, stepNumber: 1, content: "Xương ống rửa sạch, luộc bỏ nước đầu rồi ninh trong nồi áp suất hoặc nồi thường khoảng 2-3 tiếng để ngọt nước." },
      { id: 7, stepNumber: 2, content: "Nướng hành tây, gừng nguyên vỏ cho thơm, cạo sạch phần cháy đen rồi đập dập, thả vào nồi nước dùng." },
      { id: 8, stepNumber: 3, content: "Rang thơm quế, hồi, thảo quả rồi cho vào túi lọc vải, thả vào nồi ninh xương trước khi tắt bếp khoảng 1 tiếng." },
      { id: 9, stepNumber: 4, content: "Trần bánh phở qua nước sôi rồi xếp vào tô, xếp thịt bò thái lát mỏng cùng hành hoa xắt nhỏ lên trên." },
      { id: 10, stepNumber: 5, content: "Chan nước dùng đang sôi sùng sục vào tô phở cho thịt bò chín tái và dậy mùi hành thơm. Ăn kèm quẩy và chanh ớt." },
    ],
    recipeTags: [
      { tag: { name: "Truyền thống" } },
    ],
    comments: [
      {
        id: 2,
        content: "Bí quyết nước dùng ngon quá ạ! Em đã thử nấu tại nhà và cả nhà đều khen.",
        createdAt: "2026-07-18T09:24:47.493Z",
        user: {
          username: "member_lan",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        }
      }
    ]
  },
  3: {
    id: 3,
    title: "Salad Ức Gà Sốt Mè Rang Giảm Cân",
    description: "Lựa chọn hoàn hảo cho những bữa ăn Eat-clean thanh đạm, giàu protein tốt và các loại vitamin từ rau quả tươi mát.",
    calories: 320,
    cookTime: 15,
    difficulty: "EASY",
    servings: 2,
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    source: "Kitchen Eaters",
    averageRating: 4.6,
    createdAt: "2026-07-18T09:24:47.493Z",
    author: {
      username: "member_lan",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      bio: "Người đam mê làm bánh và nấu các món ăn tốt cho sức khỏe",
    },
    ingredients: [
      { id: 11, ingredientName: "Ức gà phi lê", quantity: 200, unit: "g" },
      { id: 12, ingredientName: "Rau xà lách sạch", quantity: 150, unit: "g" },
      { id: 13, ingredientName: "Cà chua bi", quantity: 50, unit: "g" },
      { id: 14, ingredientName: "Quả bơ chín", quantity: 0.5, unit: "quả" },
      { id: 15, ingredientName: "Nước sốt mè rang Kewpie", quantity: 3, unit: "muỗng canh" },
    ],
    steps: [
      { id: 11, stepNumber: 1, content: "Ức gà rửa sạch, luộc chín cùng một chút gừng đập dập và muối để khử mùi. Sau khi chín, xé gà thành sợi vừa ăn." },
      { id: 12, stepNumber: 2, content: "Rau xà lách rửa sạch xắt khúc nhỏ. Cà chua bi cắt đôi. Dưa chuột thái mỏng. Bơ lột vỏ cắt lát dày." },
      { id: 13, stepNumber: 3, content: "Cho xà lách, cà chua, dưa chuột và bơ vào tô trộn lớn." },
      { id: 14, stepNumber: 4, content: "Rải ức gà xé sợi lên trên cùng, rưới nước sốt mè rang đều khắp bề mặt tô salad." },
      { id: 15, stepNumber: 5, content: "Trộn đều nhẹ tay trước khi ăn để các nguyên liệu ngấm sốt mà bơ không bị nát. Dùng lạnh ngon hơn." },
    ],
    recipeTags: [
      { tag: { name: "Healthy" } },
      { tag: { name: "Nhanh" } },
      { tag: { name: "Ít calo" } },
    ],
    comments: []
  }
};

async function getRecipeDetails(recipeId: string): Promise<Recipe> {
  const numericId = parseInt(recipeId, 10);
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${apiUrl}/recipes/${recipeId}`, {
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch recipe details");
    const data = await res.json();
    if (!data) throw new Error("Empty recipe response");
    
    // If the comments or other relationships are missing in backend, map them or fallback
    return {
      ...data,
      ingredients: data.ingredients || MOCK_RECIPES_DB[numericId]?.ingredients || [],
      steps: data.steps || MOCK_RECIPES_DB[numericId]?.steps || [],
      recipeTags: data.recipeTags || MOCK_RECIPES_DB[numericId]?.recipeTags || [],
      comments: data.comments || MOCK_RECIPES_DB[numericId]?.comments || [],
    };
  } catch (error) {
    console.error(`Backend fetch failed for recipe ${recipeId}, using mock:`, error);
    if (MOCK_RECIPES_DB[numericId]) {
      return MOCK_RECIPES_DB[numericId];
    }
    throw error;
  }
}

interface RecipeDetailPageProps {
  params: Promise<{
    recipeId: string;
  }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { recipeId } = await params;
  
  let recipe: Recipe;
  try {
    recipe = await getRecipeDetails(recipeId);
  } catch (err) {
    notFound();
  }

  const formattedDate = new Date(recipe.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            <div className="flex items-center gap-2">
              <img 
                src={recipe.author.avatarUrl || "/default-avatar.png"} 
                alt={recipe.author.username}
                className="w-8 h-8 rounded-full object-cover border border-neutral-200"
              />
              <div>
                <p className="font-semibold text-neutral-800">{recipe.author.username}</p>
                <p className="text-[10px]">Tác giả</p>
              </div>
            </div>
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
              src={recipe.thumbnail || "/placeholder.jpg"} 
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
            <span className="absolute top-4 right-4 bg-orange-600 text-white font-bold text-xs uppercase px-3.5 py-1.5 rounded-full shadow-md">
              {recipe.difficulty}
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
              <p className="text-sm font-extrabold text-neutral-800">{recipe.calories || "--"} kcal</p>
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
                        {ing.quantity && `${ing.quantity} `}
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
              <span className="text-sm text-neutral-500 font-medium">Điểm đánh giá</span>
              <div className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-sm">
                <Star className="w-4 h-4 fill-amber-500" /> {recipe.averageRating.toFixed(1)}
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all duration-200 text-sm font-semibold text-neutral-700 cursor-not-allowed">
                <Heart className="w-4.5 h-4.5" /> Yêu thích
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all duration-200 text-sm font-semibold text-neutral-700 cursor-not-allowed">
                <MessageSquare className="w-4.5 h-4.5" /> Bình luận
              </button>
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
                  <span 
                    key={idx} 
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    #{rt.tag.name}
                  </span>
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
                  src={recipe.author.avatarUrl || "/default-avatar.png"} 
                  alt={recipe.author.username}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">{recipe.author.username}</h4>
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
          <MessageSquare className="w-5.5 h-5.5 text-neutral-400" /> Bình luận - {recipe.comments.length}
        </h2>

        {/* Comment input mockup */}
        <div className="flex gap-4 p-5 bg-neutral-50 border border-neutral-200 rounded-3xl">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
            K
          </div>
          <div className="flex-1 space-y-3">
            <textarea 
              rows={3} 
              placeholder="Chia sẻ ý kiến của bạn về món ăn này..." 
              className="w-full p-4 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              disabled
            />
            <button className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-not-allowed">
              Gửi bình luận
            </button>
          </div>
        </div>

        {/* List of comments */}
        <div className="space-y-4">
          {recipe.comments.length > 0 ? (
            recipe.comments.map((comm) => (
              <div key={comm.id} className="flex gap-4 p-5 bg-white border border-neutral-100 rounded-3xl shadow-sm">
                <img 
                  src={comm.user.avatarUrl || "/default-avatar.png"} 
                  alt={comm.user.username}
                  className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900">{comm.user.username}</span>
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
            ))
          ) : (
            <p className="text-neutral-500 text-sm italic pl-2">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
          )}
        </div>
      </section>
    </div>
  );
}
