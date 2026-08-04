/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Hash } from 'lucide-react';
import { ChefHat, Globe, LockKey } from '@phosphor-icons/react';
import { api } from '@/lib/api-client';
import { ImageUploader } from '@/components/ui/ImageUploader';

export default function CreateRecipePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState('EASY');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  // Tags state
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<(string | number)[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [steps, setSteps] = useState(['']);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user.isVerified) {
      router.push('/');
    }
  }, [user, router]);

  const loadCategoriesAndTags = async () => {
    try {
      const [cats, tagList] = await Promise.all([
        api.categories.list().catch(() => []),
        api.tags.list().catch(() => []),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setTags(Array.isArray(tagList) ? tagList : []);
    } catch (e) {
      console.error('Failed to load categories/tags', e);
    }
  };

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  // Toggle selecting a tag
  const toggleTag = (id: string | number) => {
    const idStr = String(id);
    if (selectedTagIds.map(String).includes(idStr)) {
      setSelectedTagIds(selectedTagIds.filter((t) => String(t) !== idStr));
    } else {
      setSelectedTagIds([...selectedTagIds, id]);
    }
  };

  // Add a new tag on the fly
  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    setAddingTag(true);
    try {
      const created = await api.tags.create(newTagName.trim());
      setNewTagName('');
      // Refresh tags list
      const updatedTags = await api.tags.list();
      setTags(Array.isArray(updatedTags) ? updatedTags : []);
      if (created?.id) {
        setSelectedTagIds((prev) => [...prev, created.id]);
      }
    } catch (err: any) {
      alert(err.message || 'Thêm Tag mới thất bại');
    } finally {
      setAddingTag(false);
    }
  };



  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSteps(updated);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên công thức!');
      return;
    }

    if (!imageUrl.trim()) {
      alert('Vui lòng tải lên ảnh món ăn trước khi tạo công thức!');
      return;
    }

    if (servings && Number(servings) < 1) {
      alert('Khẩu phần ăn phải lớn hơn hoặc bằng 1!');
      return;
    }

    if (calories && Number(calories) < 0) {
      alert('Số lượng calo không được là số âm!');
      return;
    }

    if (cookTime && Number(cookTime) < 0) {
      alert('Thời gian nấu không được là số âm!');
      return;
    }

    if (ingredients.some((ingredient) => ingredient.amount !== '' && Number(ingredient.amount) < 0)) {
      alert('Số lượng nguyên liệu không được là số âm!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create Recipe in backend API
      const newRecipe = await api.recipes.create({
        userId: user.id || 1,
        title: title.trim(),
        description: description.trim() || undefined,
        calories: calories ? Number(calories) : undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        servings: servings ? Number(servings) : 4,
        difficulty: difficulty,
        categoryId: categoryId ? Number(categoryId) : undefined,
        thumbnail: imageUrl.trim() || undefined,
        source: 'USER',
        isPublic: isPublic,
      });

      const recipeId = newRecipe.id;
      const currentUserId = user.id || 1;

      // 2. Add Ingredients
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        if (ing.name.trim()) {
          await api.ingredients.add(recipeId, {
            ingredientName: ing.name.trim(),
            quantity: ing.amount ? Number(ing.amount) : undefined,
            unit: ing.unit.trim() || undefined,
            displayOrder: i + 1,
            userId: currentUserId,
          }, currentUserId);
        }
      }

      // 3. Add Steps
      for (let i = 0; i < steps.length; i++) {
        const stepContent = steps[i];
        if (stepContent.trim()) {
          await api.steps.add(recipeId, {
            stepNumber: i + 1,
            content: stepContent.trim(),
            userId: currentUserId,
          }, currentUserId);
        }
      }

      // 4. Associate selected Tags with Recipe
      for (const tagId of selectedTagIds) {
        await api.recipeTags.add(recipeId, tagId, currentUserId);
      }

      alert('Tạo công thức mới thành công và đã lưu vào Database!');
      router.push(`/recipes/${recipeId}`);
    } catch (err: any) {
      console.error('Tạo công thức thất bại:', err);
      setErrorMsg(err.message || 'Tạo công thức thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  if (user.role === 'GUEST' || !user.isVerified) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl pb-24">
      <div className="mb-8">
        <Link href="/recipes" className="text-orange-500 hover:text-orange-600 font-medium mb-4 inline-block">
          &larr; Quay lại danh sách
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Đóng góp công thức mới</h1>
        <p className="text-neutral-500 mt-2">Chia sẻ công thức nấu ăn của bạn – lưu trực tiếp vào cơ sở dữ liệu.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2">Thông tin cơ bản</h2>

          {/* Privacy Option */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Quyền riêng tư <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  isPublic
                    ? 'bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/20 text-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Globe size={30} weight="duotone" className="text-emerald-500" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-sm">Công khai (Public)</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Mọi người đều có thể tìm thấy và xem công thức này</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  !isPublic
                    ? 'bg-orange-50/60 border-orange-500 ring-2 ring-orange-500/20 text-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <LockKey size={30} weight="duotone" className="text-slate-500" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-sm">Riêng tư (Private)</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Chỉ một mình bạn có thể xem công thức này</div>
                </div>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tên món ăn <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="vd: Phở Bò Nam Định"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Mô tả món ăn</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả hương vị, nguồn gốc món ăn..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-neutral-900"
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Số người ăn</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="vd: 4"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Số Calo (kcal)</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="vd: 450"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Thời gian nấu (phút)</label>
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="vd: 60"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Danh mục món ăn</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-neutral-900"
              >
                <option value="">Chọn danh mục (Không bắt buộc)</option>
                {categories.map((cat) => (
                  <option key={String(cat.id)} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <ImageUploader value={imageUrl} onChange={setImageUrl} label="Hình ảnh món ăn thành phẩm" />
            </div>
          </div>

          {/* Tags Section - Right below Category */}
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                Thẻ phân loại (Tags)
              </label>
              <span className="text-xs text-neutral-400">Chọn hoặc tạo mới tag bên cạnh</span>
            </div>

            {/* Input & Button to add new custom tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                }}
                placeholder="Nhập tên tag mới (vd: Giảm cân, Nhanh gọn)..."
                className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddNewTag}
                disabled={addingTag || !newTagName.trim()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {addingTag ? 'Đang tạo...' : 'Thêm Tag mới'}
              </button>
            </div>

            {/* Available Tags Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.length === 0 ? (
                <span className="text-xs text-neutral-400">Chưa có tag nào. Nhập tên và bấm nút bên trên để tạo!</span>
              ) : (
                tags.map((tag) => {
                  const isSelected = selectedTagIds.map(String).includes(String(tag.id));
                  return (
                    <button
                      type="button"
                      key={String(tag.id)}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? <Check className="size-4" aria-hidden="true" /> : <Hash className="size-4" aria-hidden="true" />}
                      <span>{tag.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><ChefHat size={24} weight="duotone" className="text-orange-500" aria-hidden="true" /> Nguyên liệu</h2>
            <button type="button" onClick={addIngredient} className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">
              Thêm dòng
            </button>
          </div>
          
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <input 
                required 
                type="text" 
                value={ing.name}
                onChange={(e) => {
                  const updated = [...ingredients];
                  updated[idx].name = e.target.value;
                  setIngredients(updated);
                }}
                placeholder="Tên nguyên liệu (vd: Thịt bò)" 
                className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900" 
              />
              <input 
                type="number" 
                min="0"
                value={ing.amount}
                onChange={(e) => {
                  const updated = [...ingredients];
                  updated[idx].amount = e.target.value.replace(/^-/, '');
                  setIngredients(updated);
                }}
                placeholder="Số lượng" 
                className="w-24 px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900" 
              />
              <input 
                type="text" 
                value={ing.unit}
                onChange={(e) => {
                  const updated = [...ingredients];
                  updated[idx].unit = e.target.value;
                  setIngredients(updated);
                }}
                placeholder="Đơn vị (g, ml, muỗng)" 
                className="w-32 px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900" 
              />
              <button 
                type="button" 
                onClick={() => removeIngredient(idx)}
                disabled={ingredients.length === 1}
                className="p-2 text-neutral-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><ChefHat size={24} weight="duotone" className="text-orange-500" aria-hidden="true" /> Các bước thực hiện</h2>
            <button type="button" onClick={addStep} className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">
              Thêm bước
            </button>
          </div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-8 h-8 shrink-0 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveStepUp(idx)}
                    disabled={idx === 0}
                    className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 text-[10px] font-bold flex items-center justify-center transition-colors"
                    title="Chuyển lên"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStepDown(idx)}
                    disabled={idx === steps.length - 1}
                    className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 text-[10px] font-bold flex items-center justify-center transition-colors"
                    title="Chuyển xuống"
                  >
                    ▼
                  </button>
                </div>
              </div>
              <textarea 
                required 
                rows={2}
                value={step}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[idx] = e.target.value;
                  setSteps(updated);
                }}
                placeholder={`Nội dung bước ${idx + 1}...`} 
                className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-neutral-900" 
              />
              <button 
                type="button" 
                onClick={() => removeStep(idx)}
                disabled={steps.length === 1}
                className="p-2 text-neutral-400 hover:text-red-500 disabled:opacity-50 transition-colors mt-1"
                title="Xóa bước này"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-neutral-200 flex justify-end gap-4">
          <Link href="/recipes" className="px-6 py-3 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Đang lưu vào Database...' : 'Đăng công thức (Lưu vào DB)'}
          </button>
        </div>

      </form>
    </div>
  );
}
