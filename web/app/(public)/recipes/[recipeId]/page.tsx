/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';

export default function RecipeDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.recipeId as string;

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const isOwner = user.isVerified && (
    user.role === 'ADMIN' ||
    String(recipe?.userId) === String(user?.id) ||
    String(recipe?.author?.id) === String(user?.id)
  );

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true);
      try {
        const data = await api.recipes.get(id);
        setRecipe(data);
      } catch (err: any) {
        console.error('Failed to load recipe:', err);
        setErrorMsg(err.message || 'Không tìm thấy công thức này!');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (!isOwner) {
      alert('Bạn không có quyền xóa công thức này!');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa công thức này không?')) return;
    try {
      await api.recipes.remove(id, user.id);
      alert('Đã xóa công thức thành công!');
      router.push('/recipes');
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-neutral-500">
        <div className="text-4xl mb-3 animate-bounce">⏳</div>
        <p className="font-medium text-lg">Đang tải chi tiết công thức từ Database...</p>
      </div>
    );
  }

  if (errorMsg || !recipe) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🍲</div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Không tìm thấy công thức</h2>
        <p className="text-neutral-500 mb-6">{errorMsg || 'Công thức này có thể đã bị xóa hoặc không tồn tại.'}</p>
        <Link href="/recipes" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600">
          Quay lại danh sách công thức
        </Link>
      </div>
    );
  }

  const ingredientsList = recipe.ingredients || [];
  const stepsList = recipe.steps || [];
  const tagsList = recipe.tags || [];

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] min-h-[320px] w-full bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.thumbnail || `https://picsum.photos/seed/${recipe.id}/1200/800`}
          alt={recipe.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Link href="/recipes" className="inline-flex items-center text-white/80 hover:text-white text-sm font-medium transition-colors">
                &larr; Quay lại danh sách
              </Link>
              
              {isOwner && (
                <div className="flex gap-2">
                  <Link href={`/recipes/${recipe.id}/edit`} className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-amber-500/30 flex items-center gap-1">
                    ✏️ Sửa công thức
                  </Link>
                  <button onClick={handleDelete} className="px-3.5 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-red-500/30 flex items-center gap-1">
                    🗑️ Xóa
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {recipe.category && (
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-medium">
                  {recipe.category.icon || '📂'} {recipe.category.name}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md flex items-center gap-1">
                🧑‍🍳 Tác giả: {recipe.author?.username || 'Người dùng'}
              </span>
              {(recipe.source === 'AI GenAI' || recipe.source === 'AI') && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  🤖 Source: AI GenAI
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md flex items-center gap-1 ${
                recipe.isPublic !== false
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {recipe.isPublic !== false ? '🌐 Công khai' : '🔒 Riêng tư'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{recipe.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <span className="font-medium">{recipe.calories || '—'} kcal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <span className="font-medium">{recipe.cookTime || '—'} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">👥</span>
                <span className="font-medium">{recipe.servings || 4} người</span>
              </div>
            </div>

            {/* Display Tags in Hero Section */}
            {tagsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
                <span className="text-white/70 text-xs font-medium mr-1">🏷️ Tags:</span>
                {tagsList.map((tag: any) => (
                  <span key={String(tag.id)} className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-medium border border-white/20 transition-colors">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {recipe.description && (
          <div className="mb-10 p-6 bg-orange-50/50 border border-orange-100 rounded-2xl text-neutral-700 leading-relaxed text-lg">
            {recipe.description}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Ingredients */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 sticky top-24">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <span>🛒</span> Nguyên liệu ({ingredientsList.length})
              </h2>
              {ingredientsList.length === 0 ? (
                <p className="text-neutral-400 text-sm">Chưa có thông tin nguyên liệu</p>
              ) : (
                <ul className="space-y-4">
                  {ingredientsList.map((ing: any, idx: number) => (
                    <li key={ing.id || idx} className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-5 h-5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 cursor-pointer" 
                      />
                      <div>
                        <span className="font-medium text-neutral-800 block">{ing.ingredientName}</span>
                        {(ing.quantity || ing.unit) && (
                          <span className="text-sm text-neutral-500">{ing.quantity || ''} {ing.unit || ''}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
              <span>👨‍🍳</span> Các bước thực hiện ({stepsList.length})
            </h2>
            {stepsList.length === 0 ? (
              <p className="text-neutral-400">Chưa có nội dung các bước nấu</p>
            ) : (
              <div className="space-y-8">
                {stepsList.map((step: any, idx: number) => (
                  <div key={step.id || idx} className="flex gap-4">
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-lg">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-neutral-800 leading-relaxed text-lg">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
